export interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  createdAt: Date | string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: Date | string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  contacts: string[];
  template?: string;
  templateVariables?: string[];
  message: string;
  scheduledAt?: Date | string;
  sentCount: number;
  totalCount: number;
  createdAt: Date | string;
}

export interface MessageLog {
  id: string;
  campaignId?: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt: Date | string;
  error?: string;
}

export interface Settings {
  // General
  businessName: string;
  language: 'en' | 'he';
  
  // WhatsApp Business API
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  apiVersion: string;
  webhookUrl: string;
  webhookVerifyToken: string;
  
  // Messaging
  defaultCountryCode: string;
  delayBetweenMessages: number;
  maxMessagesPerDay: number;
}
