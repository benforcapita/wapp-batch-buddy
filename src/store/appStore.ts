import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Contact, MessageTemplate, Campaign, MessageLog, Settings } from '@/types';

interface AppState {
  contacts: Contact[];
  templates: MessageTemplate[];
  campaigns: Campaign[];
  logs: MessageLog[];
  settings: Settings;
  _hasHydrated: boolean;
  
  // Hydration
  setHasHydrated: (state: boolean) => void;
  
  // Contact actions
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  importContacts: (contacts: Omit<Contact, 'id' | 'createdAt'>[]) => void;
  
  // Template actions
  addTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt'>) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, template: Partial<MessageTemplate>) => void;
  
  // Campaign actions
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount'>) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  
  // Log actions
  addLog: (log: Omit<MessageLog, 'id'>) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const defaultTemplates: MessageTemplate[] = [
  {
    id: 'default-1',
    name: 'Welcome Message',
    content: 'Hello {{name}}! Welcome to our service. We\'re excited to have you!',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-2',
    name: 'Promotion',
    content: 'Hi {{name}}! 🎉 Don\'t miss our special offer this week. Use code SAVE20 for 20% off!',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      contacts: [],
      templates: defaultTemplates,
      campaigns: [],
      logs: [],
      settings: {
        delayBetweenMessages: 3,
        maxMessagesPerDay: 100,
        businessName: 'My Business',
        defaultCountryCode: '+1',
      },
      _hasHydrated: false,
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      addContact: (contact) => set((state) => ({
        contacts: [...state.contacts, {
          ...contact,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }],
      })),
      
      removeContact: (id) => set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
      })),
      
      updateContact: (id, contact) => set((state) => ({
        contacts: state.contacts.map((c) => 
          c.id === id ? { ...c, ...contact } : c
        ),
      })),
      
      importContacts: (contacts) => set((state) => ({
        contacts: [
          ...state.contacts,
          ...contacts.map((c) => ({
            ...c,
            id: generateId(),
            createdAt: new Date().toISOString(),
          })),
        ],
      })),
      
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, {
          ...template,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }],
      })),
      
      removeTemplate: (id) => set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      })),
      
      updateTemplate: (id, template) => set((state) => ({
        templates: state.templates.map((t) => 
          t.id === id ? { ...t, ...template } : t
        ),
      })),
      
      addCampaign: (campaign) => set((state) => ({
        campaigns: [...state.campaigns, {
          ...campaign,
          id: generateId(),
          createdAt: new Date().toISOString(),
          sentCount: 0,
        }],
      })),
      
      updateCampaign: (id, campaign) => set((state) => ({
        campaigns: state.campaigns.map((c) => 
          c.id === id ? { ...c, ...campaign } : c
        ),
      })),
      
      addLog: (log) => set((state) => ({
        logs: [{ ...log, id: generateId() }, ...state.logs].slice(0, 500),
      })),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings },
      })),
    }),
    {
      name: 'whatsapp-cms-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        contacts: state.contacts,
        templates: state.templates,
        campaigns: state.campaigns,
        logs: state.logs,
        settings: state.settings,
      }),
    }
  )
);
