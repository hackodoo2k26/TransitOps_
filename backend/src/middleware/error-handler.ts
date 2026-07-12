import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { ApiError } from "../utils/api-error.js";

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof Error) {
    logger.error("Unhandled error", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  } else {
    logger.error("Unhandled error", { error });
  }
  res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
  });
};
