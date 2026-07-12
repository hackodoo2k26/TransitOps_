import type { NextFunction, Request, Response } from "express";
import type { ZodObject, ZodTypeAny } from "zod";

export const validate =
  (schema: { body?: ZodTypeAny; query?: ZodObject; params?: ZodObject }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query) as any;
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params) as any;
    }
    next();
  };
