import { dashboardRepository } from "../repositories/dashboard.repository.js";

export class DashboardService {
  async getOrganizationDashboard(organizationId: number) {
    return dashboardRepository.getOrganizationKpis(organizationId);
  }

  async getGlobalDashboard() {
    return dashboardRepository.getGlobalStats();
  }
}

export const dashboardService = new DashboardService();

