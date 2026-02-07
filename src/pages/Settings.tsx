import { useRef, useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, Info, Globe, Download, Upload, RefreshCw, FileJson, CheckCircle, Loader2, Webhook } from 'lucide-react';
import { validateWhatsAppCredentials } from '@/lib/whatsapp-api';

// API base URL for webhook server
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

// Sync webhook config with backend server
const syncWebhookConfig = async (webhookVerifyToken: string) => {
  try {
    await fetch(`${API_BASE}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookVerifyToken }),
    });
  } catch (e) {
    console.log('Could not sync webhook config with server:', e);
  }
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Settings() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const loadFromStorage = useAppStore((state) => state.loadFromStorage);
  const { toast } = useToast();
  const { t, setLanguage, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check if webhook server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/config`);
        if (response.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  // Sync webhook config with backend when it changes
  useEffect(() => {
    if (settings.webhookVerifyToken && serverStatus === 'online') {
      syncWebhookConfig(settings.webhookVerifyToken);
    }
  }, [settings.webhookVerifyToken, serverStatus]);

  const handleTestConnection = async () => {
    if (!settings.phoneNumberId || !settings.accessToken) {
      toast({
        title: t('missingCredentials'),
        description: t('missingCredentialsDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setConnectionStatus('idle');

    try {
      const isValid = await validateWhatsAppCredentials();
      if (isValid) {
        setConnectionStatus('success');
        toast({
          title: t('connectionSuccessful'),
          description: t('connectionSuccessfulDescription'),
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: t('connectionFailed'),
          description: t('connectionFailedDescription'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: t('connectionError'),
        description: error instanceof Error ? error.message : t('connectionFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleLanguageChange = (value: 'en' | 'he') => {
    setLanguage(value);
    updateSettings({ language: value });
  };

  const handleExportConfig = () => {
    const config = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: settings,
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-buddy-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t('configExported'),
      description: t('configExportedDescription'),
    });
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const config = JSON.parse(content);
        
        if (!config.settings) {
          throw new Error('Invalid config file: missing settings');
        }
        
        updateSettings(config.settings);
        
        // Sync webhook config with backend server
        if (config.settings.webhookVerifyToken) {
          await syncWebhookConfig(config.settings.webhookVerifyToken);
        }
        
        toast({
          title: t('configImported'),
          description: t('configImportedDescription'),
        });
      } catch (error) {
        toast({
          title: t('importFailed'),
          description: error instanceof Error ? error.message : t('importFailed'),
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReloadFromStorage = () => {
    loadFromStorage();
    toast({
      title: t('settingsReloaded'),
      description: t('settingsReloadedDescription'),
    });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('settings')}</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            {t('configurePreferences')}
          </p>
        </div>

        {/* Config Management */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 sm:h-5 sm:w-5" />
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
              {t('configuration')}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('configDescription')}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportConfig}>
              <Download className="h-4 w-4" />
              {t('exportConfig')}
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {t('importConfig')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
            
            <Button variant="outline" size="sm" onClick={handleReloadFromStorage}>
              <RefreshCw className="h-4 w-4" />
              {t('reload')}
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-info/30 bg-info/10 p-3 sm:p-4 animate-slide-up">
          <div className="flex gap-3">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-info shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm sm:text-base font-medium text-card-foreground">{t('howItWorks')}</h4>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {t('howItWorksDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 sm:space-y-6 animate-slide-up">
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
            {t('generalSettings')}
          </h3>
          
          <div>
            <Label htmlFor="businessName" className="text-sm">{t('businessName')}</Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => updateSettings({ businessName: e.target.value })}
              placeholder="My Business"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('businessNameHint')}
            </p>
          </div>

          <div>
            <Label className="text-sm">{t('language')}</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="he">עברית</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('languageHint')}
            </p>
          </div>
        </div>

        {/* WhatsApp Business API Settings */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 sm:space-y-6 animate-slide-up">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
              {t('whatsappBusinessSettings')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('whatsappBusinessDescription')}
            </p>
          </div>
          
          <div>
            <Label htmlFor="phoneNumberId" className="text-sm">{t('phoneNumberId')} *</Label>
            <Input
              id="phoneNumberId"
              value={settings.phoneNumberId}
              onChange={(e) => updateSettings({ phoneNumberId: e.target.value })}
              placeholder="123456789012345"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('phoneNumberIdHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="businessAccountId" className="text-sm">{t('businessAccountId')} *</Label>
            <Input
              id="businessAccountId"
              value={settings.businessAccountId}
              onChange={(e) => updateSettings({ businessAccountId: e.target.value })}
              placeholder="123456789012345"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('businessAccountIdHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="accessToken" className="text-sm">{t('accessToken')} *</Label>
            <Input
              id="accessToken"
              type="password"
              value={settings.accessToken}
              onChange={(e) => updateSettings({ accessToken: e.target.value })}
              placeholder="EAAxxxxxxxxxxxxxxxx"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('accessTokenHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="apiVersion" className="text-sm">{t('apiVersion')}</Label>
            <Input
              id="apiVersion"
              value={settings.apiVersion}
              onChange={(e) => updateSettings({ apiVersion: e.target.value })}
              placeholder="v18.0"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('apiVersionHint')}
            </p>
          </div>

          {/* Connection status indicator */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className={`h-2 w-2 rounded-full ${settings.phoneNumberId && settings.businessAccountId && settings.accessToken ? 'bg-success' : 'bg-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">
              {settings.phoneNumberId && settings.businessAccountId && settings.accessToken 
                ? t('apiConfigured')
                : t('missingRequired')}
            </span>
          </div>
        </div>

        {/* Webhook Settings */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 sm:space-y-6 animate-slide-up">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground flex items-center gap-2">
              <Webhook className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('webhookSettings') || 'Webhook Settings'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('webhookDescription') || 'Configure webhook to receive incoming messages'}
            </p>
          </div>

          {/* Server status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <div className={`h-2 w-2 rounded-full ${
              serverStatus === 'online' ? 'bg-success' : 
              serverStatus === 'checking' ? 'bg-warning animate-pulse' : 'bg-destructive'
            }`} />
            <span className="text-xs text-muted-foreground">
              {serverStatus === 'online' 
                ? (t('serverOnline') || 'Webhook server is running')
                : serverStatus === 'checking'
                ? (t('checkingServer') || 'Checking server...')
                : (t('serverOffline') || 'Webhook server is offline - run: bun run dev')}
            </span>
          </div>
          
          <div>
            <Label htmlFor="webhookVerifyToken" className="text-sm">
              {t('webhookVerifyToken') || 'Webhook Verify Token'}
            </Label>
            <Input
              id="webhookVerifyToken"
              value={settings.webhookVerifyToken}
              onChange={(e) => updateSettings({ webhookVerifyToken: e.target.value })}
              placeholder="whatsapp_webhook_verify_token"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('webhookVerifyTokenHint') || 'Use this token when configuring the webhook in Meta Developer Dashboard'}
            </p>
          </div>

          <div>
            <Label htmlFor="webhookUrl" className="text-sm">
              {t('webhookUrl') || 'Webhook URL (for reference)'}
            </Label>
            <Input
              id="webhookUrl"
              value={settings.webhookUrl}
              onChange={(e) => updateSettings({ webhookUrl: e.target.value })}
              placeholder="https://your-domain.com/webhook"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('webhookUrlHint') || 'Your public webhook URL. Use ngrok for local testing: npx ngrok http 3001'}
            </p>
          </div>
        </div>

        {/* Messaging Settings */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 sm:space-y-6 animate-slide-up">
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
            {t('messagingSettings')}
          </h3>
          
          <div>
            <Label htmlFor="countryCode" className="text-sm">{t('defaultCountryCode')}</Label>
            <Input
              id="countryCode"
              value={settings.defaultCountryCode}
              onChange={(e) => updateSettings({ defaultCountryCode: e.target.value })}
              placeholder="+1"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('defaultCountryCodeHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="delay" className="text-sm">{t('delayBetweenMessages')}</Label>
            <Input
              id="delay"
              type="number"
              min="1"
              max="60"
              value={settings.delayBetweenMessages}
              onChange={(e) => updateSettings({ delayBetweenMessages: parseInt(e.target.value) || 3 })}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('delayHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="maxMessages" className="text-sm">{t('maxMessagesPerDay')}</Label>
            <Input
              id="maxMessages"
              type="number"
              min="1"
              max="1000"
              value={settings.maxMessagesPerDay}
              onChange={(e) => updateSettings({ maxMessagesPerDay: parseInt(e.target.value) || 100 })}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('maxMessagesHint')}
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 sm:p-4 animate-slide-up">
          <div className="flex gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm sm:text-base font-medium text-card-foreground">{t('importantNotice')}</h4>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {t('warningText')}
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleTestConnection} 
          variant="whatsapp" 
          className="w-full"
          disabled={isTesting || !settings.phoneNumberId || !settings.accessToken}
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : connectionStatus === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isTesting ? t('testing') : connectionStatus === 'success' ? t('connectionVerified') : t('testConnection')}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {t('settingsAutoSave')}
        </p>
      </div>
    </MainLayout>
  );
}
