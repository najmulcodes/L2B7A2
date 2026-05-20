import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as issuesService from './issues.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import asyncHandler from '../../utils/asyncHandler';
import { AuthRequest } from '../../types';

export const createIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
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

  const reporter_id = req.user!.id;
  const issue = await issuesService.createIssue(title, description, type, reporter_id);

  sendSuccess(res, StatusCodes.CREATED, 'Issue created successfully', issue);
});

export const getAllIssues = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const sort = (req.query.sort as string) || 'newest';
  const type = req.query.type as string | undefined;
  const status = req.query.status as string | undefined;

  const validSorts = ['newest', 'oldest'];
  const validTypes = ['bug', 'feature_request'];
  const validStatuses = ['open', 'in_progress', 'resolved'];

  if (!validSorts.includes(sort)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'sort must be newest or oldest.');
    return;
  }
  if (type && !validTypes.includes(type)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'type must be bug or feature_request.');
    return;
  }
  if (status && !validStatuses.includes(status)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'status must be open, in_progress, or resolved.');
    return;
  }

  const issues = await issuesService.getAllIssues(sort, type, status);
  sendSuccess(res, StatusCodes.OK, 'Issues fetched successfully', issues);
});

export const getSingleIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
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

export const updateIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
    return;
  }

  const issue = await issuesService.getRawIssueById(id);
  if (!issue) {
    sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
    return;
  }

  const { role, id: userId } = req.user!;

  // Contributor: can only edit own issues that are still open
  if (role === 'contributor') {
    if (issue.reporter_id !== userId) {
      sendError(res, StatusCodes.FORBIDDEN, 'You can only update your own issues.');
      return;
    }
    if (issue.status !== 'open') {
      sendError(res, StatusCodes.CONFLICT, 'You can only update issues that are open.');
      return;
    }
  }

  const { title, description, type } = req.body;

  if (!title && !description && !type) {
    sendError(res, StatusCodes.BAD_REQUEST, 'Provide at least one field to update: title, description, or type.');
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

  const updated = await issuesService.updateIssue(id, { title, description, type });
  sendSuccess(res, StatusCodes.OK, 'Issue updated successfully', updated);
});

export const deleteIssue = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, StatusCodes.BAD_REQUEST, 'Invalid issue ID.');
    return;
  }

  const issue = await issuesService.getRawIssueById(id);
  if (!issue) {
    sendError(res, StatusCodes.NOT_FOUND, 'Issue not found.');
    return;
  }

  await issuesService.deleteIssueById(id);
  sendSuccess(res, StatusCodes.OK, 'Issue deleted successfully');
});