# WhatsApp Batch Buddy

A Progressive Web App (PWA) for sending batch WhatsApp messages via the WhatsApp Business API.

## Features

- **Batch Messaging** - Send template messages to multiple contacts at once
- **Contact Management** - Import contacts via CSV, manage with tags
- **Template Integration** - Fetch and use approved templates from Meta Business Manager
- **Campaign Tracking** - Monitor sent/failed messages with detailed logs
- **PWA Support** - Install on mobile/desktop, works offline
- **Config Export/Import** - Backup and restore your settings

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

---

## WhatsApp Business API Setup

### Prerequisites

1. **Meta Business Account** - [business.facebook.com](https://business.facebook.com)
2. **WhatsApp Business Account** - Created through Meta Business Suite
3. **Meta Developer App** - [developers.facebook.com](https://developers.facebook.com)

### Step-by-Step Setup

#### 1. Create a Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Create App" → Select "Business" type
3. Add "WhatsApp" product to your app
4. Go to WhatsApp → API Setup

#### 2. Get Your Credentials

| Credential | Where to Find |
|------------|---------------|
| **Phone Number ID** | WhatsApp → API Setup → Phone number ID |
| **Business Account ID** | WhatsApp → API Setup → WhatsApp Business Account ID |
| **Access Token** | WhatsApp → API Setup → Generate token (or System User for permanent token) |

#### 3. Create Message Templates

1. Go to [Meta Business Manager → WhatsApp → Message Templates](https://business.facebook.com/wa/manage/message-templates/)
2. Click "Create Template"
3. Choose category (Marketing, Utility, Authentication)
4. Add template content with variables: `{{1}}`, `{{2}}`, etc.
5. Submit for approval (usually 24-48 hours)

#### 4. Configure the App

1. Open the app → Go to **Settings**
2. Enter your Phone Number ID, Business Account ID, and Access Token
3. Go to **Templates** → Click "Refresh" to fetch your approved templates
4. Go to **Contacts** → Import your contact list
5. Go to **Campaigns** → Create and send!

---

## Message Limits & Tiers

WhatsApp Business API has messaging limits based on your **tier level** and **quality rating**.

### Messaging Tiers

| Tier | Daily Limit | How to Reach |
|------|-------------|--------------|
| **Unverified** | 250 messages/day | Default for new accounts |
| **Tier 1** | 1,000 messages/day | Verify your business |
| **Tier 2** | 10,000 messages/day | Send 2x your current limit with good quality |
| **Tier 3** | 100,000 messages/day | Send 2x your current limit with good quality |
| **Tier 4** | Unlimited | Send 2x your current limit with good quality |

### What You Need for Each Volume

#### 100 Messages/Day
- ✅ Unverified business account (free tier)
- ✅ Basic Meta Developer App
- ✅ At least 1 approved template
- ✅ Temporary access token (valid 24 hours)

**Estimated Cost:** Free (within free tier limits)

#### 1,000 Messages/Day
- ✅ **Verified business** in Meta Business Manager
- ✅ Display name approved
- ✅ Good quality rating (green)
- ✅ System User with permanent access token

**Verification Steps:**
1. Go to Meta Business Settings → Security Center
2. Complete business verification (requires business documents)
3. Wait for approval (1-5 business days)

**Estimated Cost:** ~$0.005-0.08 per message (varies by country)

#### 10,000 Messages/Day
- ✅ **Tier 2 status** - Achieved by sending 2,000+ messages with good quality
- ✅ Consistent high-quality rating
- ✅ Low block/report rate
- ✅ Official Business Account (green checkmark recommended)

**Requirements:**
1. Start at Tier 1 (1,000/day)
2. Send at least 2,000 messages over 7 days
3. Maintain quality rating of "High" or "Medium"
4. System automatically upgrades you

**Estimated Cost:** ~$50-800/day (varies by country and template type)

---

## Quality Rating

Your quality rating affects your messaging limits:

| Rating | Status | Effect |
|--------|--------|--------|
| 🟢 **High** | Green | Eligible for tier upgrades |
| 🟡 **Medium** | Yellow | Stable, no changes |
| 🔴 **Low** | Red | Risk of tier downgrade or restriction |

### How to Maintain High Quality

1. **Only message opted-in users** - Never send unsolicited messages
2. **Use relevant templates** - Match content to user expectations
3. **Respect unsubscribes** - Remove users who opt out immediately
4. **Monitor block rates** - Keep below 2% of recipients
5. **Avoid spam patterns** - Don't send identical messages in bursts

---

## Pricing

WhatsApp Business API charges per conversation (24-hour window):

| Conversation Type | Typical Cost (USD) |
|-------------------|-------------------|
| **Marketing** | $0.02 - $0.15 |
| **Utility** | $0.01 - $0.08 |
| **Authentication** | $0.01 - $0.05 |
| **Service** (user-initiated) | Free or lower cost |

*Prices vary by country. Check [Meta's pricing page](https://developers.facebook.com/docs/whatsapp/pricing) for exact rates.*

### Free Tier
- 1,000 free service conversations per month
- Free tier does NOT include business-initiated (marketing) messages

---

## App Usage

### Importing Contacts

**Format:** One contact per line, comma-separated

```
John Doe, +1234567890
Jane Smith, +0987654321
Bob Wilson, 5551234567
```

- Phone numbers without `+` will use your default country code
- Spaces and dashes are automatically removed

### Creating a Campaign

1. Go to **Campaigns** → Click "New Campaign"
2. Enter campaign name
3. Select an approved template
4. Choose recipients (select all or individually)
5. Click "Create Campaign"
6. Click **Start** to begin sending

### Template Variables

Templates use numbered variables: `{{1}}`, `{{2}}`, etc.

Currently, the app automatically maps:
- `{{1}}` → Contact's name

*Custom variable mapping coming in future updates.*

---

## Configuration Backup

### Export Settings

1. Go to **Settings**
2. Click **Export Config**
3. Save the JSON file securely

### Import Settings

1. Go to **Settings**
2. Click **Import Config**
3. Select your saved JSON file

⚠️ **Security Note:** The config file contains your access token. Keep it secure and never share publicly.

---

## Installing as PWA

### Mobile (iOS/Android)

1. Open the app in your browser
2. Tap the browser menu (⋮ or share icon)
3. Select "Add to Home Screen"
4. The app will appear on your home screen

### Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Click the install icon (⊕) in the address bar
3. Click "Install"

---

## Troubleshooting

### "API Not Configured"
→ Go to Settings and enter your Phone Number ID, Business Account ID, and Access Token

### "No approved templates found"
→ Create templates in [Meta Business Manager](https://business.facebook.com/wa/manage/message-templates/) and wait for approval

### "Template Not Found"
→ Click "Refresh" on the Templates page to reload from the API

### Messages failing with error code
| Code | Meaning | Solution |
|------|---------|----------|
| 131030 | User not on WhatsApp | Remove from contact list |
| 131047 | Re-engagement required | User must message you first |
| 131051 | Unsupported message type | Check template format |
| 131056 | Rate limit exceeded | Wait and slow down sending |
| 190 | Invalid access token | Generate new token |

---

## Tech Stack

- **React 18** + TypeScript
- **Vite** + PWA Plugin
- **Tailwind CSS** + shadcn/ui
- **Zustand** for state management
- **WhatsApp Cloud API** (Meta Graph API)

---

## License

MIT

---

## Support

For WhatsApp Business API issues:
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)

For app issues:
- Open an issue in this repository
