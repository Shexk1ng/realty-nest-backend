// Podręczne skróty rekordów (nazwa, avatar) rozwiązywane z identyfikatorów i cache'owane na minutę


import { Property } from "../../../models/properties.js";
import { Contact } from "../../../models/contacts.js";
import { User } from "../../../models/users.js";
import { Company } from "../../../models/companies.js";
import { Enquiry } from "../../../models/enquiries.js";

const TTL_MS = 60_000;

interface Cached<T> {
  at: number;
  value: T | null;
}

function makeCache<T>() {
  return new Map<string, Cached<T>>();
}

async function memo<T>(
  cache: Map<string, Cached<T>>,
  id: string | null | undefined,
  load: (id: string) => Promise<T | null>,
): Promise<T | null> {
  if (!id) return null;
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;

  const value = await load(id);
  cache.set(id, { at: Date.now(), value });
  return value;
}

export interface PropertyBrief {
  title: string;
  location: string | null;
  imageUrl: string | null;
}
export interface ContactBrief {
  name: string;
  email: string | null;
  phone: string | null;
}
export interface AgentBrief {
  name: string;
  avatarUrl: string | null;
}
export interface CompanyBrief {
  name: string;
  logoUrl: string | null;
}
export interface EnquiryBrief {
  name: string;
}

const propertyCache = makeCache<PropertyBrief>();
const contactCache = makeCache<ContactBrief>();
const agentCache = makeCache<AgentBrief>();
const companyCache = makeCache<CompanyBrief>();
const enquiryCache = makeCache<EnquiryBrief>();

export const propertyBrief = (id?: string | null) =>
  memo(propertyCache, id, async (i) => {
    const d = await Property.findById(i).select("title location imageUrl images");
    if (!d) return null;
    return {
      title: d.title as string,
      location: (d.location as string | null) ?? null,
      imageUrl: (d.imageUrl as string | null) ?? (d.images as string[] | undefined)?.[0] ?? null,
    };
  });

export const contactBrief = (id?: string | null) =>
  memo(contactCache, id, async (i) => {
    const d = await Contact.findById(i).select("name email phone");
    if (!d) return null;
    return {
      name: d.name as string,
      email: (d.email as string | null) ?? null,
      phone: (d.phone as string | null) ?? null,
    };
  });

export const agentBrief = (id?: string | null) =>
  memo(agentCache, id, async (i) => {
    const d = await User.findById(i).select("name profile.firstName profile.lastName profile.avatarUrl");
    if (!d) return null;
    return {
      name: d.profile?.firstName
        ? `${d.profile.firstName} ${d.profile.lastName ?? ""}`.trim()
        : (d.name as string),
      avatarUrl: d.profile?.avatarUrl ?? null,
    };
  });

export const companyBrief = (id?: string | null) =>
  memo(companyCache, id, async (i) => {
    const d = await Company.findById(i).select("name logoUrl");
    if (!d) return null;
    return { name: d.name as string, logoUrl: (d.logoUrl as string | null) ?? null };
  });

export const enquiryBrief = (id?: string | null) =>
  memo(enquiryCache, id, async (i) => {
    const d = await Enquiry.findById(i).select("name");
    if (!d) return null;
    return { name: d.name as string };
  });

export const RELATED_FIELDS_SDL = `
    propertyTitle: String
    propertyLocation: String
    propertyImageUrl: String
    contactName: String
    contactEmail: String
    contactPhone: String
    agentName: String
    agentAvatarUrl: String
`;

export const relatedFieldResolvers = {
  propertyTitle: async (r: { propertyId?: string | null }) => (await propertyBrief(r.propertyId))?.title ?? null,
  propertyLocation: async (r: { propertyId?: string | null }) => (await propertyBrief(r.propertyId))?.location ?? null,
  propertyImageUrl: async (r: { propertyId?: string | null }) => (await propertyBrief(r.propertyId))?.imageUrl ?? null,
  contactName: async (r: { contactId?: string | null }) => (await contactBrief(r.contactId))?.name ?? null,
  contactEmail: async (r: { contactId?: string | null }) => (await contactBrief(r.contactId))?.email ?? null,
  contactPhone: async (r: { contactId?: string | null }) => (await contactBrief(r.contactId))?.phone ?? null,
  agentName: async (r: { agentId?: string | null }) => (await agentBrief(r.agentId))?.name ?? null,
  agentAvatarUrl: async (r: { agentId?: string | null }) => (await agentBrief(r.agentId))?.avatarUrl ?? null,
};
