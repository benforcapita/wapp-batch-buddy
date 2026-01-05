import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/appStore';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertCircle, Info } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useAppStore();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure your WhatsApp messaging preferences
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-info/30 bg-info/10 p-4 animate-slide-up">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-info shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-card-foreground">How it works</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                This tool opens WhatsApp Web links for each contact with your pre-filled message. 
                Make sure you're logged into WhatsApp Web in your browser. Each message opens in a new tab 
                where you just need to click Send.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 animate-slide-up">
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => updateSettings({ businessName: e.target.value })}
              placeholder="My Business"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Used for reference in your campaigns
            </p>
          </div>

          <div>
            <Label htmlFor="countryCode">Default Country Code</Label>
            <Input
              id="countryCode"
              value={settings.defaultCountryCode}
              onChange={(e) => updateSettings({ defaultCountryCode: e.target.value })}
              placeholder="+1"
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Applied to phone numbers without a country code
            </p>
          </div>

          <div>
            <Label htmlFor="delay">Delay Between Messages (seconds)</Label>
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
              Time to wait between opening each WhatsApp message (1-60 seconds)
            </p>
          </div>

          <div>
            <Label htmlFor="maxMessages">Max Messages Per Day</Label>
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
              Recommended limit to avoid WhatsApp restrictions
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 animate-slide-up">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-card-foreground">Important Notice</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                This tool is for legitimate business communication only. Sending spam or unsolicited 
                messages may result in your WhatsApp account being banned. Always ensure you have 
                consent from recipients before messaging them.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} variant="whatsapp" className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </MainLayout>
  );
}
