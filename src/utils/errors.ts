'use strict';

import { NextFunction, Request, Response } from 'express';

export const BAD_REQUEST = 'BAD_REQUEST';
export const UNAUTHORIZED = 'UNAUTHORIZED';
export const FORBIDDEN = 'FORBIDDEN';
export const NOT_FOUND = 'NOT_FOUND';
export const INTERNAL_ERROR = 'INTERNAL_ERROR';
export const NOT_IMPLEMENTED = 'NOT_IMPLEMENTED';

const ERRORS = new Map([
  [400, BAD_REQUEST],
  [401, UNAUTHORIZED],
  [403, FORBIDDEN],
  [404, NOT_FOUND],
  [500, INTERNAL_ERROR],
  [501, NOT_IMPLEMENTED]
]);

function errorText(status: number, text: string) {
  return text || ERRORS.get(status) || '';
}

export class AppError extends Error {
  status: number;
  constructor(status: number, message: string) {
    status = status || 500;
    super(errorText(status, message));

    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export function error(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.status) {
    console.error(err);
  } else {
    console.error(err.stack);
  }

  if (!err.status) {
    return reply(req, res, 500, 'INTERNAL_ERROR');
  }

  reply(req, res, err.status || (res.statusCode >= 400 ? res.statusCode : 500) || 500, err.message);
}

function reply(req: Request, res: Response, status: number, reply: string) {
  if (reply === null) {
    status = 204;
  }

  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');

  if (status === 204) {
    return res.end();
  }

  reply = Math.trunc(status / 100) === 2 ? reply : JSON.stringify({ error: reply });
  res.setHeader('Content-Length', Buffer.isBuffer(reply) ? reply.length : Buffer.byteLength(reply));
  res.end(reply);
}
