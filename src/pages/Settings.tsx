import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Save, AlertCircle, Info, Globe } from 'lucide-react';
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
  const { toast } = useToast();
  const { t, setLanguage, language } = useLanguage();

  const handleSave = () => {
    toast({
      title: t('settingsSaved'),
      description: t('settingsSavedDescription'),
    });
  };

  const handleLanguageChange = (value: 'en' | 'he') => {
    setLanguage(value);
    updateSettings({ language: value });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">{t('settings')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('configurePreferences')}
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-info/30 bg-info/10 p-4 animate-slide-up">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-card-foreground">{t('howItWorks')}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('howItWorksDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('generalSettings')}
          </h3>
          
          <div>
            <Label htmlFor="businessName">{t('businessName')}</Label>
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
            <Label>{t('language')}</Label>
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
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 animate-slide-up">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              {t('whatsappBusinessSettings')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('whatsappBusinessDescription')}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phoneNumberId">{t('phoneNumberId')}</Label>
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
              <Label htmlFor="businessAccountId">{t('businessAccountId')}</Label>
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
          </div>

          <div>
            <Label htmlFor="accessToken">{t('accessToken')}</Label>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="apiVersion">{t('apiVersion')}</Label>
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

            <div>
              <Label htmlFor="webhookUrl">{t('webhookUrl')}</Label>
              <Input
                id="webhookUrl"
                value={settings.webhookUrl}
                onChange={(e) => updateSettings({ webhookUrl: e.target.value })}
                placeholder="https://your-domain.com/webhook"
                className="mt-2"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {t('webhookUrlHint')}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="webhookVerifyToken">{t('webhookVerifyToken')}</Label>
            <Input
              id="webhookVerifyToken"
              value={settings.webhookVerifyToken}
              onChange={(e) => updateSettings({ webhookVerifyToken: e.target.value })}
              placeholder="your-verify-token"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('webhookVerifyTokenHint')}
            </p>
          </div>
        </div>

        {/* Messaging Settings */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-card-foreground">
            {t('messagingSettings')}
          </h3>
          
          <div>
            <Label htmlFor="countryCode">{t('defaultCountryCode')}</Label>
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
            <Label htmlFor="delay">{t('delayBetweenMessages')}</Label>
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
            <Label htmlFor="maxMessages">{t('maxMessagesPerDay')}</Label>
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
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 animate-slide-up">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-card-foreground">{t('importantNotice')}</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('warningText')}
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} variant="whatsapp" className="w-full">
          <Save className="h-4 w-4" />
          {t('saveSettings')}
        </Button>
      </div>
    </MainLayout>
  );
}
