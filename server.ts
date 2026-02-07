/**
 * Simple Bun server for WhatsApp webhook handling
 * Stores conversations as local JSON files - no database needed
 * Configuration is received from the frontend
 */

import { serve, file } from "bun";
import { readdir, mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const PORT = process.env.PORT || 3001;
const CONVERSATIONS_DIR = "./conversations";
const DIST_DIR = "./dist";
const CONFIG_FILE = "./server-config.json";

// Server configuration (loaded from frontend settings)
interface ServerConfig {
  webhookVerifyToken: string;
  phoneNumberId: string;
  accessToken: string;
}

let serverConfig: ServerConfig = {
  webhookVerifyToken: "whatsapp_webhook_verify_token",
  phoneNumberId: "",
  accessToken: "",
};

// Load config from file if exists
async function loadConfig() {
  try {
    if (existsSync(CONFIG_FILE)) {
      const data = await readFile(CONFIG_FILE, "utf-8");
      serverConfig = { ...serverConfig, ...JSON.parse(data) };
      console.log("📋 Loaded configuration from file");
    }
  } catch (e) {
    console.log("⚠️ Could not load config file, using defaults");
  }
}

// Save config to file
async function saveConfig(config: Partial<ServerConfig>) {
  serverConfig = { ...serverConfig, ...config };
  await writeFile(CONFIG_FILE, JSON.stringify(serverConfig, null, 2));
  console.log("💾 Configuration saved");
}

// Load config on startup
await loadConfig();

// Ensure conversations directory exists
if (!existsSync(CONVERSATIONS_DIR)) {
  await mkdir(CONVERSATIONS_DIR, { recursive: true });
}

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: "text" | "image" | "document" | "audio" | "video" | "sticker" | "reaction" | "unknown";
  text?: string;
  caption?: string;
  direction: "incoming" | "outgoing";
}

interface Conversation {
  phoneNumber: string;
  contactName?: string;
  messages: WhatsAppMessage[];
  lastMessageAt: string;
  createdAt: string;
}

// Load or create conversation file
async function getConversation(phoneNumber: string): Promise<Conversation> {
  const filePath = join(CONVERSATIONS_DIR, `${phoneNumber}.json`);
  
  if (existsSync(filePath)) {
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  }
  
  return {
    phoneNumber,
    messages: [],
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// Save conversation to file
async function saveConversation(conversation: Conversation): Promise<void> {
  const filePath = join(CONVERSATIONS_DIR, `${conversation.phoneNumber}.json`);
  await writeFile(filePath, JSON.stringify(conversation, null, 2));
}

// Add message to conversation
async function addMessage(phoneNumber: string, message: WhatsAppMessage, contactName?: string): Promise<void> {
  const conversation = await getConversation(phoneNumber);
  
  // Check for duplicate message ID
  if (conversation.messages.some(m => m.id === message.id)) {
    console.log(`Duplicate message ${message.id} ignored`);
    return;
  }
  
  conversation.messages.push(message);
  conversation.lastMessageAt = message.timestamp;
  if (contactName) {
    conversation.contactName = contactName;
  }
  
  await saveConversation(conversation);
  console.log(`Message saved to ${phoneNumber}.json`);
}

// Parse incoming WhatsApp webhook payload
function parseWebhookMessage(entry: any): { phoneNumber: string; message: WhatsAppMessage; contactName?: string } | null {
  try {
    const changes = entry.changes?.[0];
    const value = changes?.value;
    
    if (!value?.messages?.[0]) {
      return null;
    }
    
    const msg = value.messages[0];
    const contact = value.contacts?.[0];
    
    const message: WhatsAppMessage = {
      id: msg.id,
      from: msg.from,
      timestamp: new Date(parseInt(msg.timestamp) * 1000).toISOString(),
      type: msg.type || "unknown",
      direction: "incoming",
    };
    
    // Extract text content based on message type
    if (msg.type === "text") {
      message.text = msg.text?.body;
    } else if (msg.type === "image" || msg.type === "video" || msg.type === "document") {
      message.caption = msg[msg.type]?.caption;
      message.text = `[${msg.type.toUpperCase()}]${msg[msg.type]?.caption ? `: ${msg[msg.type].caption}` : ""}`;
    } else if (msg.type === "audio") {
      message.text = "[AUDIO MESSAGE]";
    } else if (msg.type === "sticker") {
      message.text = "[STICKER]";
    } else if (msg.type === "reaction") {
      message.text = `[REACTION: ${msg.reaction?.emoji}]`;
    }
    
    return {
      phoneNumber: msg.from,
      message,
      contactName: contact?.profile?.name,
    };
  } catch (error) {
    console.error("Error parsing webhook message:", error);
    return null;
  }
}

console.log(`🚀 Starting WhatsApp Webhook Server on port ${PORT}`);
console.log(`📁 Conversations stored in: ${CONVERSATIONS_DIR}/`);
console.log(`🔑 Webhook verify token: ${serverConfig.webhookVerifyToken}`);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // CORS headers for API requests
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // ===== WEBHOOK ENDPOINTS =====
    
    // Webhook verification (GET)
    if (path === "/webhook" && req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");
      
      console.log(`📥 Webhook verification request: mode=${mode}, token=${token}`);
      
      if (mode === "subscribe" && token === serverConfig.webhookVerifyToken) {
        console.log("✅ Webhook verified successfully");
        return new Response(challenge, { status: 200 });
      }
      
      console.log("❌ Webhook verification failed");
      return new Response("Forbidden", { status: 403 });
    }
    
    // Webhook messages (POST)
    if (path === "/webhook" && req.method === "POST") {
      try {
        const body = await req.json();
        console.log("📨 Webhook received:", JSON.stringify(body, null, 2));
        
        // Process each entry
        if (body.entry) {
          for (const entry of body.entry) {
            const parsed = parseWebhookMessage(entry);
            if (parsed) {
              await addMessage(parsed.phoneNumber, parsed.message, parsed.contactName);
            }
          }
        }
        
        return new Response("OK", { status: 200 });
      } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Error", { status: 500 });
      }
    }
    
    // ===== API ENDPOINTS =====
    
    // List all conversations
    if (path === "/api/conversations" && req.method === "GET") {
      try {
        const files = await readdir(CONVERSATIONS_DIR);
        const conversations: Conversation[] = [];
        
        for (const file of files) {
          if (file.endsWith(".json")) {
            const data = await readFile(join(CONVERSATIONS_DIR, file), "utf-8");
            conversations.push(JSON.parse(data));
          }
        }
        
        // Sort by last message time (newest first)
        conversations.sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
        
        return new Response(JSON.stringify(conversations), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (error) {
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }
    
    // Get single conversation
    if (path.startsWith("/api/conversations/") && req.method === "GET") {
      const phoneNumber = path.split("/").pop();
      if (!phoneNumber) {
        return new Response("Not Found", { status: 404 });
      }
      
      try {
        const conversation = await getConversation(phoneNumber);
        return new Response(JSON.stringify(conversation), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (error) {
        return new Response("Not Found", { status: 404, headers: corsHeaders });
      }
    }
    
    // Add outgoing message (when sending from app)
    if (path === "/api/messages/outgoing" && req.method === "POST") {
      try {
        const body = await req.json();
        const { phoneNumber, messageId, text, contactName } = body;
        
        const message: WhatsAppMessage = {
          id: messageId || `out_${Date.now()}`,
          from: "me",
          timestamp: new Date().toISOString(),
          type: "text",
          text,
          direction: "outgoing",
        };
        
        await addMessage(phoneNumber, message, contactName);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to save message" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }
    
    // Get server configuration
    if (path === "/api/config" && req.method === "GET") {
      return new Response(JSON.stringify({
        webhookVerifyToken: serverConfig.webhookVerifyToken,
        configured: !!serverConfig.webhookVerifyToken,
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    // Update server configuration (from frontend settings)
    if (path === "/api/config" && req.method === "POST") {
      try {
        const body = await req.json();
        await saveConfig(body);
        console.log(`🔧 Config updated from frontend: verifyToken=${serverConfig.webhookVerifyToken}`);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to save config" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }
    
    // ===== STATIC FILE SERVING =====
    
    // Serve static files from dist
    let filePath = path === "/" ? "/index.html" : path;
    const staticPath = join(DIST_DIR, filePath);
    
    if (existsSync(staticPath)) {
      return new Response(file(staticPath));
    }
    
    // SPA fallback - serve index.html for all routes
    const indexPath = join(DIST_DIR, "index.html");
    if (existsSync(indexPath)) {
      return new Response(file(indexPath));
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                  WhatsApp Webhook Server                       ║
╠════════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                     ║
║  Webhook URL: http://YOUR_PUBLIC_URL/webhook                   ║
║                                                                ║
║  Configure everything in the app's Settings page!              ║
║                                                                ║
║  To expose locally (for testing):                              ║
║    npx ngrok http ${PORT}                                        ║
╚════════════════════════════════════════════════════════════════╝
`);
