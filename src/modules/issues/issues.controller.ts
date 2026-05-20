import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import * as issuesService from './issues.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import asyncHandler from '../../utils/asyncHandler';
import { AuthRequest } from '../../types';
import { Request, Response } from 'express'; // add Request

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

export const getSingleIssue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

export const updateIssue = async (
  id: number,
  fields: { title?: string; description?: string; type?: string; status?: string }
): Promise<Issue> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (fields.title !== undefined)       { updates.push(`title = $${paramIndex++}`);       values.push(fields.title); }
  if (fields.description !== undefined) { updates.push(`description = $${paramIndex++}`); values.push(fields.description); }
  if (fields.type !== undefined)        { updates.push(`type = $${paramIndex++}`);        values.push(fields.type); }
  if (fields.status !== undefined)      { updates.push(`status = $${paramIndex++}`);      values.push(fields.status); }

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query<Issue>(
    `UPDATE issues SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
};