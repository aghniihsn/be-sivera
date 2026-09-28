import { Response } from 'express';

export const sendSuccess = (res: Response, message: string, data: any = null, code = 200) => {
  return res.status(code).json({
    status: 'success',
    message,
    data
  });
};

export const sendError = (res: Response, message: string, code = 400, errors: any = null) => {
  return res.status(code).json({
    status: 'error',
    message,
    errors
  });
};