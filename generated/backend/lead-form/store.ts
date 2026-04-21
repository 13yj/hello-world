import { randomUUID } from 'node:crypto';
import type { Lead } from './model.js';

export interface LeadPayload {
  name: string;
  phone: string;
  company?: string;
  message?: string;
  status: string;
}

const items: Lead[] = [];

export const listLeads = (): Lead[] => items;

export const createLead = (payload: LeadPayload): Lead => {
  const now = new Date().toISOString();
  const item: Lead = {
    id: randomUUID(),
      name: payload.name,
      phone: payload.phone,
      company: payload.company,
      message: payload.message,
      status: payload.status,
    createdAt: now,
    updatedAt: now
  };

  items.push(item);
  return item;
};

export const updateLead = (id: string, payload: Partial<LeadPayload>): Lead | null => {
  const item = items.find((current) => current.id === id);
  if (!item) return null;

  Object.assign(item, payload, { updatedAt: new Date().toISOString() });
  return item;
};

export const deleteLead = (id: string): boolean => {
  const index = items.findIndex((current) => current.id === id);
  if (index < 0) return false;
  items.splice(index, 1);
  return true;
};
