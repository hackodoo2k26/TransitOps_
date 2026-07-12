import { expenseRepository } from "../repositories/expense.repository.js";
import type { RequestContext } from "../types/context.js";
import { ApiError } from "../utils/api-error.js";

export class ExpenseService {
  async list(organizationId: number) {
    return expenseRepository.list(organizationId);
  }

  async getById(id: number, organizationId: number) {
    const row = await expenseRepository.findById(id, organizationId);
    if (!row) {
      throw new ApiError(404, "Expense not found");
    }
    return row;
  }

  async create(payload: Record<string, unknown>, actor: RequestContext) {
    if (!actor.organizationId) {
      throw new ApiError(400, "Organization context is required");
    }
    return expenseRepository.create({
      vehicleId: payload.vehicleId ? Number(payload.vehicleId) : undefined,
      tripId: payload.tripId ? Number(payload.tripId) : undefined,
      type: payload.type as "fuel" | "maintenance" | "toll" | "misc",
      date: String(payload.date),
      notes: payload.notes ? String(payload.notes) : undefined,
      organizationId: actor.organizationId,
      createdBy: actor.userId ?? undefined,
      amount: String(payload.amount),
    });
  }

  async update(id: number, organizationId: number, payload: Record<string, unknown>) {
    await this.getById(id, organizationId);
    return expenseRepository.update(id, organizationId, {
      vehicleId: payload.vehicleId ? Number(payload.vehicleId) : undefined,
      tripId: payload.tripId ? Number(payload.tripId) : undefined,
      type: payload.type as "fuel" | "maintenance" | "toll" | "misc" | undefined,
      date: payload.date ? String(payload.date) : undefined,
      notes: payload.notes ? String(payload.notes) : undefined,
      amount: payload.amount ? String(payload.amount) : undefined,
    });
  }

  async delete(id: number, organizationId: number) {
    const row = await expenseRepository.delete(id, organizationId);
    if (!row) {
      throw new ApiError(404, "Expense not found");
    }
    return row;
  }
}

export const expenseService = new ExpenseService();
