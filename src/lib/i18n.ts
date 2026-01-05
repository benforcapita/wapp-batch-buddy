export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    contacts: 'Contacts',
    templates: 'Templates',
    campaigns: 'Campaigns',
    messageLogs: 'Message Logs',
    settings: 'Settings',
    readyToSend: 'Ready to send',
    
    // Dashboard
    welcomeBack: "Welcome back! Here's your messaging overview.",
    totalContacts: 'Total Contacts',
    campaignsLabel: 'Campaigns',
    messagesSent: 'Messages Sent',
    pending: 'Pending',
    quickActions: 'Quick Actions',
    addContact: 'Add Contact',
    importContacts: 'Import Contacts',
    newCampaign: 'New Campaign',
    createTemplate: 'Create Template',
    recentActivity: 'Recent Activity',
    noRecentMessages: 'No recent messages',
    
    // Contacts
    manageContacts: 'Manage your contact list for bulk messaging',
    import: 'Import',
    searchContacts: 'Search contacts...',
    name: 'Name',
    phone: 'Phone',
    tags: 'Tags',
    actions: 'Actions',
    noContactsFound: 'No contacts found. Add your first contact to get started.',
    addNewContact: 'Add New Contact',
    phoneNumber: 'Phone Number',
    tagsCommaSeparated: 'Tags (comma-separated)',
    importContactsTitle: 'Import Contacts',
    importFormat: 'Paste contacts in format: Name, Phone (one per line)',
    
    // Templates
    messageTemplates: 'Message Templates',
    createReusable: 'Create reusable message templates with placeholders',
    newTemplate: 'New Template',
    templateName: 'Template Name',
    messageContent: 'Message Content',
    placeholderHint: 'Use {{name}} as placeholder for contact name',
    noTemplatesYet: 'No templates yet. Create your first template to get started.',
    editTemplate: 'Edit Template',
    updateTemplate: 'Update Template',
    
    // Campaigns
    createManage: 'Create and manage your bulk messaging campaigns',
    campaignName: 'Campaign Name',
    useTemplate: 'Use Template (optional)',
    selectTemplate: 'Select a template',
    message: 'Message',
    selectRecipients: 'Select Recipients',
    selected: 'selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    noContactsAvailable: 'No contacts available. Add contacts first.',
    createCampaign: 'Create Campaign',
    recipients: 'recipients',
    sent: 'sent',
    start: 'Start',
    noCampaignsYet: 'No campaigns yet. Create your first campaign to start messaging.',
    
    // Logs
    trackMessages: 'Track all your sent messages and their delivery status',
    searchMessages: 'Search messages...',
    filterByStatus: 'Filter by status',
    allStatus: 'All Status',
    status: 'Status',
    contact: 'Contact',
    sentAt: 'Sent At',
    noMessagesYet: 'No messages sent yet. Start a campaign to see logs here.',
    noMessagesMatch: 'No messages match your search criteria.',
    
    // Settings
    configurePreferences: 'Configure your WhatsApp messaging preferences',
    howItWorks: 'How it works',
    howItWorksDescription: 'This tool opens WhatsApp Web links for each contact with your pre-filled message. Make sure you\'re logged into WhatsApp Web in your browser. Each message opens in a new tab where you just need to click Send.',
    
    // Settings - General
    generalSettings: 'General Settings',
    businessName: 'Business Name',
    businessNameHint: 'Used for reference in your campaigns',
    language: 'Language',
    languageHint: 'Select your preferred language',
    
    // Settings - WhatsApp Business
    whatsappBusinessSettings: 'WhatsApp Business API Settings',
    whatsappBusinessDescription: 'Configure your WhatsApp Business API credentials for automated messaging',
    phoneNumberId: 'Phone Number ID',
    phoneNumberIdHint: 'Your WhatsApp Business phone number ID from Meta',
    businessAccountId: 'Business Account ID',
    businessAccountIdHint: 'Your WhatsApp Business Account ID (WABA)',
    accessToken: 'Access Token',
    accessTokenHint: 'Your permanent access token from Meta Developer Portal',
    apiVersion: 'API Version',
    apiVersionHint: 'WhatsApp Business API version (e.g., v18.0)',
    webhookUrl: 'Webhook URL',
    webhookUrlHint: 'URL to receive message delivery status updates',
    webhookVerifyToken: 'Webhook Verify Token',
    webhookVerifyTokenHint: 'Token used to verify webhook requests',
    
    // Settings - Messaging
    messagingSettings: 'Messaging Settings',
    defaultCountryCode: 'Default Country Code',
    defaultCountryCodeHint: 'Applied to phone numbers without a country code',
    delayBetweenMessages: 'Delay Between Messages (seconds)',
    delayHint: 'Time to wait between opening each WhatsApp message (1-60 seconds)',
    maxMessagesPerDay: 'Max Messages Per Day',
    maxMessagesHint: 'Recommended limit to avoid WhatsApp restrictions',
    
    // Settings - Warning
    importantNotice: 'Important Notice',
    warningText: 'This tool is for legitimate business communication only. Sending spam or unsolicited messages may result in your WhatsApp account being banned. Always ensure you have consent from recipients before messaging them.',
    
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings Saved',
    settingsSavedDescription: 'Your settings have been saved successfully.',
  },
  he: {
    // Navigation
    dashboard: 'לוח בקרה',
    contacts: 'אנשי קשר',
    templates: 'תבניות',
    campaigns: 'קמפיינים',
    messageLogs: 'היסטוריית הודעות',
    settings: 'הגדרות',
    readyToSend: 'מוכן לשליחה',
    
    // Dashboard
    welcomeBack: 'ברוך הבא! הנה סקירת ההודעות שלך.',
    totalContacts: 'סה"כ אנשי קשר',
    campaignsLabel: 'קמפיינים',
    messagesSent: 'הודעות נשלחו',
    pending: 'ממתין',
    quickActions: 'פעולות מהירות',
    addContact: 'הוסף איש קשר',
    importContacts: 'ייבא אנשי קשר',
    newCampaign: 'קמפיין חדש',
    createTemplate: 'צור תבנית',
    recentActivity: 'פעילות אחרונה',
    noRecentMessages: 'אין הודעות אחרונות',
    
    // Contacts
    manageContacts: 'נהל את רשימת אנשי הקשר שלך לשליחה המונית',
    import: 'ייבוא',
    searchContacts: 'חפש אנשי קשר...',
    name: 'שם',
    phone: 'טלפון',
    tags: 'תגיות',
    actions: 'פעולות',
    noContactsFound: 'לא נמצאו אנשי קשר. הוסף את איש הקשר הראשון שלך כדי להתחיל.',
    addNewContact: 'הוסף איש קשר חדש',
    phoneNumber: 'מספר טלפון',
    tagsCommaSeparated: 'תגיות (מופרדות בפסיק)',
    importContactsTitle: 'ייבא אנשי קשר',
    importFormat: 'הדבק אנשי קשר בפורמט: שם, טלפון (אחד בכל שורה)',
    
    // Templates
    messageTemplates: 'תבניות הודעות',
    createReusable: 'צור תבניות הודעות לשימוש חוזר עם מקומות שמורים',
    newTemplate: 'תבנית חדשה',
    templateName: 'שם התבנית',
    messageContent: 'תוכן ההודעה',
    placeholderHint: 'השתמש ב-{{name}} כמקום שמור לשם איש הקשר',
    noTemplatesYet: 'אין תבניות עדיין. צור את התבנית הראשונה שלך כדי להתחיל.',
    editTemplate: 'ערוך תבנית',
    updateTemplate: 'עדכן תבנית',
    
    // Campaigns
    createManage: 'צור ונהל את קמפייני השליחה ההמונית שלך',
    campaignName: 'שם הקמפיין',
    useTemplate: 'השתמש בתבנית (אופציונלי)',
    selectTemplate: 'בחר תבנית',
    message: 'הודעה',
    selectRecipients: 'בחר נמענים',
    selected: 'נבחרו',
    selectAll: 'בחר הכל',
    deselectAll: 'בטל בחירה',
    noContactsAvailable: 'אין אנשי קשר זמינים. הוסף אנשי קשר קודם.',
    createCampaign: 'צור קמפיין',
    recipients: 'נמענים',
    sent: 'נשלחו',
    start: 'התחל',
    noCampaignsYet: 'אין קמפיינים עדיין. צור את הקמפיין הראשון שלך כדי להתחיל לשלוח.',
    
    // Logs
    trackMessages: 'עקוב אחר כל ההודעות שנשלחו וסטטוס המסירה שלהן',
    searchMessages: 'חפש הודעות...',
    filterByStatus: 'סנן לפי סטטוס',
    allStatus: 'כל הסטטוסים',
    status: 'סטטוס',
    contact: 'איש קשר',
    sentAt: 'נשלח ב',
    noMessagesYet: 'לא נשלחו הודעות עדיין. התחל קמפיין כדי לראות היסטוריה כאן.',
    noMessagesMatch: 'אין הודעות התואמות לקריטריוני החיפוש שלך.',
    
    // Settings
    configurePreferences: 'הגדר את העדפות ההודעות שלך בוואטסאפ',
    howItWorks: 'איך זה עובד',
    howItWorksDescription: 'כלי זה פותח קישורי WhatsApp Web לכל איש קשר עם ההודעה הממולאה מראש שלך. וודא שאתה מחובר ל-WhatsApp Web בדפדפן שלך. כל הודעה נפתחת בלשונית חדשה שבה אתה רק צריך ללחוץ על שלח.',
    
    // Settings - General
    generalSettings: 'הגדרות כלליות',
    businessName: 'שם העסק',
    businessNameHint: 'משמש לייחוס בקמפיינים שלך',
    language: 'שפה',
    languageHint: 'בחר את השפה המועדפת עליך',
    
    // Settings - WhatsApp Business
    whatsappBusinessSettings: 'הגדרות WhatsApp Business API',
    whatsappBusinessDescription: 'הגדר את פרטי ה-API של WhatsApp Business להודעות אוטומטיות',
    phoneNumberId: 'מזהה מספר טלפון',
    phoneNumberIdHint: 'מזהה מספר הטלפון העסקי שלך מ-Meta',
    businessAccountId: 'מזהה חשבון עסקי',
    businessAccountIdHint: 'מזהה חשבון WhatsApp Business שלך (WABA)',
    accessToken: 'אסימון גישה',
    accessTokenHint: 'אסימון הגישה הקבוע שלך מפורטל המפתחים של Meta',
    apiVersion: 'גרסת API',
    apiVersionHint: 'גרסת WhatsApp Business API (למשל v18.0)',
    webhookUrl: 'כתובת Webhook',
    webhookUrlHint: 'כתובת URL לקבלת עדכוני סטטוס מסירת הודעות',
    webhookVerifyToken: 'אסימון אימות Webhook',
    webhookVerifyTokenHint: 'אסימון המשמש לאימות בקשות webhook',
    
    // Settings - Messaging
    messagingSettings: 'הגדרות הודעות',
    defaultCountryCode: 'קידומת מדינה ברירת מחדל',
    defaultCountryCodeHint: 'מוחל על מספרי טלפון ללא קידומת מדינה',
    delayBetweenMessages: 'השהייה בין הודעות (שניות)',
    delayHint: 'זמן המתנה בין פתיחת כל הודעת WhatsApp (1-60 שניות)',
    maxMessagesPerDay: 'מקסימום הודעות ביום',
    maxMessagesHint: 'מגבלה מומלצת למניעת חסימות WhatsApp',
    
    // Settings - Warning
    importantNotice: 'הודעה חשובה',
    warningText: 'כלי זה מיועד לתקשורת עסקית לגיטימית בלבד. שליחת ספאם או הודעות לא רצויות עלולה לגרום לחסימת חשבון ה-WhatsApp שלך. תמיד וודא שיש לך הסכמה מהנמענים לפני שאתה שולח להם הודעות.',
    
    saveSettings: 'שמור הגדרות',
    settingsSaved: 'ההגדרות נשמרו',
    settingsSavedDescription: 'ההגדרות שלך נשמרו בהצלחה.',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
