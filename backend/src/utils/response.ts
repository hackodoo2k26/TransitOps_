import type { Response } from "express";

export const sendSuccess = <T>(res: Response, message: string, data: T, statusCode = 200) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  meta: Record<string, unknown>,
) =>
  res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });

