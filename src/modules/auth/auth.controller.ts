import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as authService from './auth.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import asyncHandler from '../../utils/asyncHandler';

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    sendError(res, StatusCodes.BAD_REQUEST, 'name, email, and password are required.');
    return;
  }

  const validRoles = ['contributor', 'maintainer'];
  const assignedRole = role || 'contributor';
  if (!validRoles.includes(assignedRole)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'role must be contributor or maintainer.');
    return;
  }

  const existing = await authService.findUserByEmail(email);
  if (existing) {
    sendError(res, StatusCodes.BAD_REQUEST, 'An account with this email already exists.');
    return;
  }

  const user = await authService.registerUser(name, email, password, assignedRole as 'contributor' | 'maintainer');
  sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', user);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendError(res, StatusCodes.BAD_REQUEST, 'email and password are required.');
    return;
  }

  const user = await authService.findUserByEmail(email);
  if (!user) {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid credentials.');
    return;
  }

  const isValid = await authService.validatePassword(password, user.password);
  if (!isValid) {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid credentials.');
    return;
  }

  const token = authService.generateToken(user.id, user.name, user.role);
  const { password: _pw, ...userPublic } = user;

  sendSuccess(res, StatusCodes.OK, 'Login successful', { token, user: userPublic });
});