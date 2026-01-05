export interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  createdAt: Date;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  contacts: string[];
  template?: string;
  message: string;
  scheduledAt?: Date;
  sentCount: number;
  totalCount: number;
  createdAt: Date;
}

export interface MessageLog {
  id: string;
  campaignId?: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt: Date;
  error?: string;
}

export interface Settings {
  delayBetweenMessages: number;
  maxMessagesPerDay: number;
  businessName: string;
  defaultCountryCode: string;
}
