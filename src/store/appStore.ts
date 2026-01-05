import { create } from 'zustand';
import { Contact, MessageTemplate, Campaign, MessageLog, Settings } from '@/types';

interface AppState {
  contacts: Contact[];
  templates: MessageTemplate[];
  campaigns: Campaign[];
  logs: MessageLog[];
  settings: Settings;
  
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
  
  // Persistence
  loadFromStorage: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const STORAGE_KEY = 'whatsapp-cms-data';

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

const defaultSettings: Settings = {
  delayBetweenMessages: 3,
  maxMessagesPerDay: 100,
  businessName: 'My Business',
  defaultCountryCode: '+1',
};

const saveToStorage = (state: Partial<AppState>) => {
  try {
    const data = {
      contacts: state.contacts,
      templates: state.templates,
      campaigns: state.campaigns,
      logs: state.logs,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

const loadFromStorageData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
};

export const useAppStore = create<AppState>((set, get) => ({
  contacts: [],
  templates: defaultTemplates,
  campaigns: [],
  logs: [],
  settings: defaultSettings,
  
  loadFromStorage: () => {
    const data = loadFromStorageData();
    if (data) {
      set({
        contacts: data.contacts || [],
        templates: data.templates?.length > 0 ? data.templates : defaultTemplates,
        campaigns: data.campaigns || [],
        logs: data.logs || [],
        settings: data.settings || defaultSettings,
      });
    }
  },
  
  addContact: (contact) => {
    set((state) => {
      const newState = {
        contacts: [...state.contacts, {
          ...contact,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  removeContact: (id) => {
    set((state) => {
      const newState = { contacts: state.contacts.filter((c) => c.id !== id) };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateContact: (id, contact) => {
    set((state) => {
      const newState = {
        contacts: state.contacts.map((c) => c.id === id ? { ...c, ...contact } : c),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  importContacts: (contacts) => {
    set((state) => {
      const newState = {
        contacts: [
          ...state.contacts,
          ...contacts.map((c) => ({
            ...c,
            id: generateId(),
            createdAt: new Date().toISOString(),
          })),
        ],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  addTemplate: (template) => {
    set((state) => {
      const newState = {
        templates: [...state.templates, {
          ...template,
          id: generateId(),
          createdAt: new Date().toISOString(),
        }],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  removeTemplate: (id) => {
    set((state) => {
      const newState = { templates: state.templates.filter((t) => t.id !== id) };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateTemplate: (id, template) => {
    set((state) => {
      const newState = {
        templates: state.templates.map((t) => t.id === id ? { ...t, ...template } : t),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  addCampaign: (campaign) => {
    set((state) => {
      const newState = {
        campaigns: [...state.campaigns, {
          ...campaign,
          id: generateId(),
          createdAt: new Date().toISOString(),
          sentCount: 0,
        }],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateCampaign: (id, campaign) => {
    set((state) => {
      const newState = {
        campaigns: state.campaigns.map((c) => c.id === id ? { ...c, ...campaign } : c),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  addLog: (log) => {
    set((state) => {
      const newState = {
        logs: [{ ...log, id: generateId() }, ...state.logs].slice(0, 500),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
  
  updateSettings: (settings) => {
    set((state) => {
      const newState = { settings: { ...state.settings, ...settings } };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },
}));

// Load from storage on app start
if (typeof window !== 'undefined') {
  // Clean up old storage keys
  localStorage.removeItem('whatsapp-cms-storage');
  localStorage.removeItem('whatsapp-cms-v2');
  
  // Load data after a tick to avoid hydration issues
  setTimeout(() => {
    useAppStore.getState().loadFromStorage();
  }, 0);
}
