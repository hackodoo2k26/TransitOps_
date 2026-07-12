import type { Request, Response } from "express";
import { expenseService } from "../services/expense.service.js";
import { sendPaginated, sendSuccess } from "../utils/response.js";

const orgId = (req: Request) => Number(req.user!.organizationId);

export class ExpenseController {
  list = async (req: Request, res: Response) => {
    const result = await expenseService.list(orgId(req));
    sendPaginated(res, "Expenses fetched successfully", result.rows, { total: result.count });
  };

  create = async (req: Request, res: Response) => {
    const data = await expenseService.create(req.body, { userId: req.user!.userId, organizationId: req.user!.organizationId });
    sendSuccess(res, "Expense created successfully", data, 201);
  };

  getById = async (req: Request, res: Response) => {
    const data = await expenseService.getById(Number(req.params.id), orgId(req));
    sendSuccess(res, "Expense fetched successfully", data);
  };

  update = async (req: Request, res: Response) => {
    const data = await expenseService.update(Number(req.params.id), orgId(req), req.body);
    sendSuccess(res, "Expense updated successfully", data);
  };

  remove = async (req: Request, res: Response) => {
    const data = await expenseService.delete(Number(req.params.id), orgId(req));
    sendSuccess(res, "Expense deleted successfully", data);
  };
}

export const expenseController = new ExpenseController();

