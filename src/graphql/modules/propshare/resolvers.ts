// Wymiana ofert między agencjami: udostępnianie, oferty współpracy i kolejka przydziału zapytań

import { Property } from "../../../models/properties.js";
import { PropShareOffer } from "../../../models/propshare-offers.js";
import { EnquiryAllocation } from "../../../models/enquiry-allocations.js";
import { User } from "../../../models/users.js";
import { Company } from "../../../models/companies.js";
import { GraphQLError } from "graphql";
import type { GqlContext } from "../../../types/context.js";
import type { TokenPayload } from "../../../utils/jwt.js";
import { agentScopeId, attachActor, isUnassignedAssistant, saveValidated } from "../_shared/crud.js";

function requireAuth(user: GqlContext["user"]): TokenPayload {
  if (!user) throw new GraphQLError("Unauthenticated", { extensions: { code: "UNAUTHENTICATED" } });
  return user;
}

const VALID_OFFER_STATUSES = ["PENDING", "VIEWED", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;

function isoDate(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const BRIEF_TTL_MS = 60_000;
const companyCache = new Map<string, { at: number; value: { name: string; logoUrl: string | null } | null }>();
const agentCache = new Map<string, { at: number; value: { name: string; avatarUrl: string | null } | null }>();

async function companyBrief(companyId?: string | null) {
  if (!companyId) return null;
  const hit = companyCache.get(companyId);
  if (hit && Date.now() - hit.at < BRIEF_TTL_MS) return hit.value;

  const doc = await Company.findById(companyId).select("name logoUrl");
  const value = doc ? { name: doc.name as string, logoUrl: (doc.logoUrl as string | null) ?? null } : null;
  companyCache.set(companyId, { at: Date.now(), value });
  return value;
}

async function agentBrief(agentId?: string | null) {
  if (!agentId) return null;
  const hit = agentCache.get(agentId);
  if (hit && Date.now() - hit.at < BRIEF_TTL_MS) return hit.value;

  const doc = await User.findById(agentId).select("name profile.firstName profile.lastName profile.avatarUrl");
  const value = doc
    ? {
        name: doc.profile?.firstName
          ? `${doc.profile.firstName} ${doc.profile.lastName ?? ""}`.trim()
          : (doc.name as string),
        avatarUrl: doc.profile?.avatarUrl ?? null,
      }
    : null;
  agentCache.set(agentId, { at: Date.now(), value });
  return value;
}

function mayManagePropShare(
  caller: TokenPayload,
  property: { companyId?: string | null; agentId?: string | null },
): boolean {
  if (caller.role === "SYSTEM_ADMIN") return true;
  if (caller.companyId !== property.companyId) return false;
  if (caller.role === "COMPANY_ADMIN" || caller.role === "MANAGER") return true;
  return Boolean(property.agentId && property.agentId === agentScopeId(caller));
}

export const propshareResolvers = {
  Query: {
    getPropShareListings: async (_: unknown, __: unknown, { user }: GqlContext) => {
      requireAuth(user);
      return Property.find({ propShareListed: true, status: "ACTIVE", isDeleted: { $ne: true } })
        .sort({ propShareListedAt: -1 });
    },

    getPropShareOffers: async (_: unknown, __: unknown, { user }: GqlContext) => {
      const caller = requireAuth(user);
      const scopeId = agentScopeId(caller);
      const offers = await PropShareOffer.find({
        $or: [{ fromAgentId: scopeId }, { toAgentId: scopeId }],
      }).sort({ createdAt: -1 });

      const propertyIds = [...new Set(offers.map((o) => o.propertyId))];
      const properties = propertyIds.length ? await Property.find({ _id: { $in: propertyIds } }) : [];
      const propertyById = new Map(properties.map((p) => [p._id as string, p]));
      for (const offer of offers) {
        (offer as any)._propertyBrief = propertyById.get(offer.propertyId) ?? null;
      }
      return offers;
    },

    getAllocationQueue: async (_: unknown, __: unknown, { user }: GqlContext) => {
      const caller = requireAuth(user);
      if (!caller.companyId) throw new GraphQLError("No company", { extensions: { code: "FORBIDDEN" } });
      if (!["COMPANY_ADMIN", "MANAGER", "SYSTEM_ADMIN"].includes(caller.role)) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      const agents = await User.find({
        companyId: caller.companyId,
        role: { $in: ["AGENT", "MANAGER", "COMPANY_ADMIN"] },
        isActive: true,
      }).sort({ allocationQueueOrder: 1, name: 1 });

      const allocations = await EnquiryAllocation.find({ companyId: caller.companyId })
        .sort({ allocatedAt: -1 });

      const lastAllocMap = new Map<string, Date>();
      for (const a of allocations) {
        if (!lastAllocMap.has(a.agentId)) {
          lastAllocMap.set(a.agentId, a.allocatedAt);
        }
      }

      return agents.map((a) => ({
        agentId: a._id,
        name: a.profile?.firstName
          ? `${a.profile.firstName} ${a.profile.lastName ?? ""}`.trim()
          : a.name,
        avatarUrl: a.profile?.avatarUrl ?? null,
        role: a.role,
        allocationEnabled: a.allocationEnabled ?? true,
        allocationQueueOrder: a.allocationQueueOrder ?? null,
        lastAllocatedAt: lastAllocMap.get(a._id as string)?.toISOString() ?? null,
      }));
    },
  },

  Mutation: {
    togglePropShare: async (
      _: unknown,
      { propertyId, listed, notes }: { propertyId: string; listed: boolean; notes?: string },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      const property = await Property.findById(propertyId);
      if (!property || property.isDeleted) {
        throw new GraphQLError("Property not found", { extensions: { code: "NOT_FOUND" } });
      }
      if (!mayManagePropShare(caller, property)) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      property.propShareListed = listed;
      property.propShareListedAt = listed ? new Date() : null;
      if (notes !== undefined) property.propShareNotes = notes ?? null;
      attachActor(property, caller);
      await saveValidated(property);
      return property;
    },

    sendPropShareOffer: async (
      _: unknown,
      { propertyId, enquiryId, message, proposedCommission }: {
        propertyId: string;
        enquiryId?: string;
        message?: string;
        proposedCommission?: number;
      },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      if (isUnassignedAssistant(caller)) {
        throw new GraphQLError("No agent assigned to this assistant account", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      const property = await Property.findById(propertyId);
      if (!property || property.isDeleted) {
        throw new GraphQLError("Property not found", { extensions: { code: "NOT_FOUND" } });
      }
      if (!property.propShareListed) {
        throw new GraphQLError("Property is not listed on PropShare", { extensions: { code: "BAD_REQUEST" } });
      }
      if (property.companyId === caller.companyId) {
        throw new GraphQLError("Cannot send offer for your own company's listing", { extensions: { code: "BAD_REQUEST" } });
      }
      if (!property.agentId) {
        throw new GraphQLError("Listing has no assigned agent", { extensions: { code: "BAD_REQUEST" } });
      }

      const fromAgentId = agentScopeId(caller);

      const existing = await PropShareOffer.findOne({
        propertyId,
        fromAgentId,
        enquiryId: enquiryId ?? null,
        status: "PENDING",
      });
      if (existing) throw new GraphQLError("Offer already pending", { extensions: { code: "CONFLICT" } });

      const toAgent = await User.findById(property.agentId);

      const offer = new PropShareOffer({
        propertyId,
        fromAgentId,
        fromCompanyId: caller.companyId,
        toAgentId: property.agentId,
        toCompanyId: property.companyId,
        enquiryId: enquiryId ?? null,
        message: message ?? null,
        proposedCommission: proposedCommission ?? null,
        status: "PENDING",
      });
      attachActor(offer, caller);
      await saveValidated(offer);

      (offer as unknown as Record<string, unknown>).property = property;
      return offer;
    },

    updatePropShareOffer: async (
      _: unknown,
      { offerId, status }: { offerId: string; status: string },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      if (!VALID_OFFER_STATUSES.includes(status as typeof VALID_OFFER_STATUSES[number])) {
        throw new GraphQLError("Invalid status", { extensions: { code: "BAD_REQUEST" } });
      }

      const offer = await PropShareOffer.findById(offerId);
      if (!offer) throw new GraphQLError("Offer not found", { extensions: { code: "NOT_FOUND" } });

      const scopeId = agentScopeId(caller);
      if (offer.fromAgentId !== scopeId && offer.toAgentId !== scopeId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      offer.status = status as typeof VALID_OFFER_STATUSES[number];
      if (status === "VIEWED") offer.viewedAt = new Date();
      if (["ACCEPTED", "REJECTED"].includes(status)) offer.respondedAt = new Date();
      attachActor(offer, caller);
      await saveValidated(offer);
      return offer;
    },

    updateAllocationSettings: async (
      _: unknown,
      { agentId, enabled, queueOrder }: { agentId: string; enabled?: boolean; queueOrder?: number },
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      if (!["COMPANY_ADMIN", "MANAGER", "SYSTEM_ADMIN"].includes(caller.role)) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      const agent = await User.findById(agentId);
      if (!agent) throw new GraphQLError("Agent not found", { extensions: { code: "NOT_FOUND" } });
      if (caller.role !== "SYSTEM_ADMIN" && agent.companyId !== caller.companyId) {
        throw new GraphQLError("Forbidden", { extensions: { code: "FORBIDDEN" } });
      }

      if (enabled !== undefined) agent.allocationEnabled = enabled;
      if (queueOrder !== undefined) agent.allocationQueueOrder = queueOrder;
      attachActor(agent, caller);
      await saveValidated(agent);
      return true;
    },
  },

  PropShareOffer: {
    id: (o: { _id: string }) => o._id,
    createdAt: (o: { createdAt?: Date }) => isoDate(o.createdAt),
    updatedAt: (o: { updatedAt?: Date }) => isoDate(o.updatedAt),
    viewedAt: (o: { viewedAt?: Date | null }) => isoDate(o.viewedAt),
    respondedAt: (o: { respondedAt?: Date | null }) => isoDate(o.respondedAt),
    property: async (o: { propertyId: string; _propertyBrief?: unknown }) => {
      if (o._propertyBrief !== undefined) return o._propertyBrief;
      return Property.findById(o.propertyId);
    },
    fromAgentName: async (o: { fromAgentId: string }) => (await agentBrief(o.fromAgentId))?.name ?? null,
    fromAgentAvatarUrl: async (o: { fromAgentId: string }) => (await agentBrief(o.fromAgentId))?.avatarUrl ?? null,
    fromCompanyName: async (o: { fromCompanyId: string }) => (await companyBrief(o.fromCompanyId))?.name ?? null,
    toAgentName: async (o: { toAgentId: string }) => (await agentBrief(o.toAgentId))?.name ?? null,
    toAgentAvatarUrl: async (o: { toAgentId: string }) => (await agentBrief(o.toAgentId))?.avatarUrl ?? null,
    toCompanyName: async (o: { toCompanyId: string }) => (await companyBrief(o.toCompanyId))?.name ?? null,
  },

  Property: {
    ownerCompanyName: async (p: { companyId?: string | null }, __: unknown, { user }: GqlContext) => {
      requireAuth(user);
      return (await companyBrief(p.companyId))?.name ?? null;
    },
    ownerCompanyLogoUrl: async (p: { companyId?: string | null }, __: unknown, { user }: GqlContext) => {
      requireAuth(user);
      return (await companyBrief(p.companyId))?.logoUrl ?? null;
    },
    ownerAgentName: async (p: { agentId?: string | null }, __: unknown, { user }: GqlContext) => {
      requireAuth(user);
      return (await agentBrief(p.agentId))?.name ?? null;
    },
    ownerAgentAvatarUrl: async (p: { agentId?: string | null }, __: unknown, { user }: GqlContext) => {
      requireAuth(user);
      return (await agentBrief(p.agentId))?.avatarUrl ?? null;
    },
    propShareOfferCount: async (
      p: { id?: string; _id?: string; companyId?: string | null },
      __: unknown,
      { user }: GqlContext,
    ) => {
      const caller = requireAuth(user);
      if (caller.role !== "SYSTEM_ADMIN" && caller.companyId !== p.companyId) return null;
      const propertyId = p.id ?? p._id;
      if (!propertyId) return null;
      return PropShareOffer.countDocuments({ propertyId });
    },
  },
};
