import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as issuesService from './issues.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import asyncHandler from '../../utils/asyncHandler';
import { TIssueStatus, TIssueType } from '../../types';

export const createIssue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, description, type } = req.body;

  if (!title || !description || !type) {
    sendError(res, StatusCodes.BAD_REQUEST, 'title, description, and type are required.');
    return;
  }
  if (title.length > 150) {
    sendError(res, StatusCodes.BAD_REQUEST, 'title must not exceed 150 characters.');
    return;
  }
  if (description.length < 20) {
    sendError(res, StatusCodes.BAD_REQUEST, 'description must be at least 20 characters.');
    return;
  }
  if (!['bug', 'feature_request'].includes(type)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request.');
    return;
  }

  if (!req.user) {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Authentication error.');
    return;
  }

  const reporter_id = req.user.id;
  const issue = await issuesService.createIssue(title, description, type, reporter_id);
  sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
});

export const getAllIssues = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const sort = (req.query.sort as string) || 'newest';
  const type = req.query.type as TIssueType | undefined;
  const status = req.query.status as TIssueStatus | undefined;

  if (!['newest', 'oldest'].includes(sort)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'sort must be newest or oldest.');
    return;
  }
  if (type && !['bug', 'feature_request'].includes(type)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request.');
    return;
  }
  if (status && !['open', 'in_progress', 'resolved'].includes(status)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'status must be open, in_progress, or resolved.');
    return;
  }

  const issues = await issuesService.getAllIssues(sort, type, status);
  sendSuccess(res, StatusCodes.OK, 'Issues fetched successfully', issues);
});

export const getSingleIssue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
    return;
  }

  const issue = await issuesService.getIssueById(id);
  if (!issue) {
    sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
    return;
  }

  sendSuccess(res, StatusCodes.OK, 'Issue fetched successfully', issue);
});

export const updateIssue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
    return;
  }

  const issue = await issuesService.getRawIssueById(id);
  if (!issue) {
    sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
    return;
  }

  if (!req.user) {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Authentication error.');
    return;
  }

  const { role, id: userId } = req.user;
  const { title, description, type, status } = req.body;

  if (role === 'contributor') {
    if (issue.reporter_id !== userId) {
      sendError(res, StatusCodes.FORBIDDEN, 'You can only update your own issues.');
      return;
    }
    if (issue.status !== 'open') {
      sendError(res, StatusCodes.CONFLICT, 'You can only update issues that are open.');
      return;
    }
    if (status !== undefined) {
      sendError(res, StatusCodes.FORBIDDEN, 'Contributors cannot change issue status.');
      return;
    }
  }

  if (!title && !description && !type && status === undefined) {
    sendError(res, StatusCodes.BAD_REQUEST, 'Provide at least one field to update.');
    return;
  }
  if (title && title.length > 150) {
    sendError(res, StatusCodes.BAD_REQUEST, 'title must not exceed 150 characters.');
    return;
  }
  if (description && description.length < 20) {
    sendError(res, StatusCodes.BAD_REQUEST, 'description must be at least 20 characters.');
    return;
  }
  if (type && !['bug', 'feature_request'].includes(type)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request.');
    return;
  }
  if (status && !['open', 'in_progress', 'resolved'].includes(status)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'status must be open, in_progress, or resolved.');
    return;
  }

  const updated = await issuesService.updateIssue(id, { title, description, type, status });
  sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', updated);
});

export const deleteIssue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
    return;
  }

  // Check existence before attempting delete — otherwise a missing ID returns 200
  const issue = await issuesService.getRawIssueById(id);
  if (!issue) {
    sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
    return;
  }

  await issuesService.deleteIssueById(id);
  sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
});
