import { useAppStore } from '@/store/appStore';

export interface WhatsAppMessageResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

export interface WhatsAppErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    error_data?: unknown;
  };
}

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  example?: {
    body_text?: string[][];
    header_text?: string[];
  };
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }>;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category: string;
  language: string;
  components: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplatesResponse {
  data: WhatsAppTemplate[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export class WhatsAppAPIError extends Error {
  constructor(
    message: string,
    public code?: number,
    public type?: string
  ) {
    super(message);
    this.name = 'WhatsAppAPIError';
  }
}

/**
 * Fetch all message templates from WhatsApp Business API
 */
export const fetchWhatsAppTemplates = async (): Promise<WhatsAppTemplate[]> => {
  const settings = useAppStore.getState().settings;
  
  if (!settings.businessAccountId || !settings.accessToken) {
    throw new WhatsAppAPIError(
      'WhatsApp Business API credentials are not configured',
      400,
      'CONFIGURATION_ERROR'
    );
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${settings.apiVersion}/${settings.businessAccountId}/message_templates?limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as WhatsAppErrorResponse;
      throw new WhatsAppAPIError(
        errorData.error.message,
        errorData.error.code,
        errorData.error.type
      );
    }

    return (data as WhatsAppTemplatesResponse).data || [];
  } catch (error) {
    if (error instanceof WhatsAppAPIError) {
      throw error;
    }
    throw new WhatsAppAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      'NETWORK_ERROR'
    );
  }
};

/**
 * Send a WhatsApp template message using the Business API
 */
export const sendWhatsAppTemplateMessage = async (
  phoneNumber: string,
  templateName: string,
  languageCode: string,
  variables: string[] = []
): Promise<WhatsAppMessageResponse> => {
  const settings = useAppStore.getState().settings;
  
  if (!settings.phoneNumberId || !settings.accessToken) {
    throw new WhatsAppAPIError(
      'WhatsApp Business API credentials are not configured',
      400,
      'CONFIGURATION_ERROR'
    );
  }

  // Ensure phone number has international format (digits only)
  const formattedPhone = phoneNumber.startsWith('+') 
    ? phoneNumber.replace(/[^0-9]/g, '')
    : `${settings.defaultCountryCode.replace(/[^0-9]/g, '')}${phoneNumber.replace(/[^0-9]/g, '')}`;

  // Build template components with variables
  const components: Array<{ type: string; parameters: Array<{ type: string; text: string }> }> = [];
  
  if (variables.length > 0) {
    components.push({
      type: 'body',
      parameters: variables.map(text => ({ type: 'text', text }))
    });
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${settings.apiVersion}/${settings.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            ...(components.length > 0 && { components })
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as WhatsAppErrorResponse;
      throw new WhatsAppAPIError(
        errorData.error.message,
        errorData.error.code,
        errorData.error.type
      );
    }

    return data as WhatsAppMessageResponse;
  } catch (error) {
    if (error instanceof WhatsAppAPIError) {
      throw error;
    }
    throw new WhatsAppAPIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      'NETWORK_ERROR'
    );
  }
};

/**
 * Check if WhatsApp API credentials are valid
 */
export const validateWhatsAppCredentials = async (): Promise<boolean> => {
  const settings = useAppStore.getState().settings;
  
  if (!settings.phoneNumberId || !settings.accessToken) {
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${settings.apiVersion}/${settings.phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${settings.accessToken}`,
        }
      }
    );

    return response.ok;
  } catch {
    return false;
  }
};