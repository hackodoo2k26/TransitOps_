import PDFDocument from "pdfkit";
import { reportRepository } from "../repositories/report.repository.js";

const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","));
  return [headers.join(","), ...lines].join("\n");
};

export class ReportService {
  async getFuelEfficiency(organizationId: number) {
    return reportRepository.getFuelEfficiency(organizationId);
  }

  async getFleetUtilization(organizationId: number) {
    return reportRepository.getFleetUtilization(organizationId);
  }

  async getVehicleRoi(organizationId: number) {
    return reportRepository.getVehicleRoi(organizationId);
  }

  async getOperationalCost(organizationId: number) {
    return reportRepository.getOperationalCost(organizationId);
  }

  async getMonthlyExpenses(organizationId: number) {
    return reportRepository.getMonthlyExpenses(organizationId);
  }

  async exportMonthlyExpenses(organizationId: number, format: "csv" | "pdf") {
    const rows = await this.getMonthlyExpenses(organizationId);
    if (format === "csv") {
      return {
        contentType: "text/csv",
        filename: "monthly-expenses.csv",
        buffer: Buffer.from(toCsv(rows as Record<string, unknown>[])),
      };
    }

    const document = new PDFDocument({ margin: 32 });
    const chunks: Buffer[] = [];
    document.on("data", (chunk) => chunks.push(chunk as Buffer));
    document.fontSize(18).text("Monthly Expenses Report");
    document.moveDown();
    rows.forEach((row) => {
      document.fontSize(11).text(`${row.month} | ${row.type} | ${row.totalAmount}`);
    });
    document.end();

    const buffer = await new Promise<Buffer>((resolve) => {
      document.on("end", () => resolve(Buffer.concat(chunks)));
    });

    return {
      contentType: "application/pdf",
      filename: "monthly-expenses.pdf",
      buffer,
    };
  }
}

export const reportService = new ReportService();

