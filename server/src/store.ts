import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import type { LeadItem, LeadStatus, CreateLeadInput } from './types.js'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'leads.json')

async function ensureDataFile(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8')
  }
}

export async function readLeads(): Promise<LeadItem[]> {
  await ensureDataFile()
  const raw = await readFile(DATA_FILE, 'utf-8')
  return JSON.parse(raw) as LeadItem[]
}

export async function writeLeads(leads: LeadItem[]): Promise<void> {
  await ensureDataFile()
  await writeFile(DATA_FILE, JSON.stringify(leads, null, 2), 'utf-8')
}

export async function createLead(input: CreateLeadInput): Promise<LeadItem> {
  const leads = await readLeads()
  const now = new Date().toISOString()
  const lead: LeadItem = {
    id: uuidv4(),
    name: input.name,
    phone: input.phone,
    company: input.company ?? '',
    message: input.message ?? '',
    status: 'new',
    createdAt: now,
    updatedAt: now,
  }
  leads.push(lead)
  await writeLeads(leads)
  return lead
}

export async function getAllLeads(): Promise<LeadItem[]> {
  return readLeads()
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<LeadItem | null> {
  const leads = await readLeads()
  const index = leads.findIndex((l) => l.id === id)
  if (index === -1) {
    return null
  }
  leads[index].status = status
  leads[index].updatedAt = new Date().toISOString()
  await writeLeads(leads)
  return leads[index]
}
