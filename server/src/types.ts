export type LeadStatus = 'new' | 'contacted' | 'closed'

export interface LeadItem {
  id: string
  name: string
  phone: string
  company: string
  message: string
  status: LeadStatus
  createdAt: string
  updatedAt: string
}

export interface CreateLeadInput {
  name: string
  phone: string
  company?: string
  message?: string
}

export interface UpdateLeadStatusInput {
  status: LeadStatus
}
