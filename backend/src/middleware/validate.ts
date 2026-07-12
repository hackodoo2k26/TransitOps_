import type { NextFunction, Request, Response } from "express";
import type { ZodObject, ZodTypeAny } from "zod";

export const validate =
  (schema: { body?: ZodTypeAny; query?: ZodObject; params?: ZodObject }) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      const parsedQuery = schema.query.parse(req.query) as Record<string, unknown>;
      Object.keys(req.query).forEach((key) => {
        delete (req.query as Record<string, unknown>)[key];
      });
      Object.assign(req.query as Record<string, unknown>, parsedQuery);
    }
    if (schema.params) {
      const parsedParams = schema.params.parse(req.params) as Record<string, string | string[]>;
      Object.keys(req.params).forEach((key) => {
        delete req.params[key];
      });
      Object.assign(req.params, parsedParams);
    }
    next();
  };
