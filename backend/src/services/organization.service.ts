import { organizationRepository } from "../repositories/organization.repository.js";
import { ApiError } from "../utils/api-error.js";
import { slugify } from "../utils/slug.js";

export class OrganizationService {
  async create(payload: {
    name: string;
    slug?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
  }) {
    const slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
    const existing = await organizationRepository.findBySlug(slug);
    if (existing) {
      throw new ApiError(409, "Organization slug already exists");
    }

    return organizationRepository.create({
      ...payload,
      slug,
      status: "active",
    });
  }

  async list(search?: string) {
    return organizationRepository.list(search);
  }

  async getById(id: number) {
    const row = await organizationRepository.findById(id);
    if (!row || row.isDeleted) {
      throw new ApiError(404, "Organization not found");
    }
    return row;
  }

  async update(id: number, payload: Record<string, unknown>) {
    await this.getById(id);
    const updated = await organizationRepository.update(id, {
      ...payload,
      slug: typeof payload.slug === "string" ? slugify(payload.slug) : undefined,
    });
    if (!updated) {
      throw new ApiError(404, "Organization not found");
    }
    return updated;
  }

  async suspend(id: number) {
    const organization = await this.getById(id);
    if (organization.status === "suspended") {
      throw new ApiError(400, "Organization is already suspended");
    }
    return organizationRepository.update(id, { status: "suspended", suspendedAt: new Date() });
  }

  async activate(id: number) {
    await this.getById(id);
    return organizationRepository.update(id, { status: "active", suspendedAt: null });
  }

  async remove(id: number) {
    const organization = await this.getById(id);
    if (organization.isDeleted) {
      throw new ApiError(400, "Organization is already deleted");
    }
    return organizationRepository.softDelete(id);
  }
}

export const organizationService = new OrganizationService();

