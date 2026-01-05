import { useState, useMemo } from 'react';
import { Plus, Send, Play, Users, MessageSquare } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-info/20 text-info',
  sending: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
};

export default function Campaigns() {
  const campaigns = useAppStore((state) => state.campaigns);
  const contacts = useAppStore((state) => state.contacts);
  const templates = useAppStore((state) => state.templates);
  const settings = useAppStore((state) => state.settings);
  const addCampaign = useAppStore((state) => state.addCampaign);
  const updateCampaign = useAppStore((state) => state.updateCampaign);
  const addLog = useAppStore((state) => state.addLog);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    message: '',
    templateId: '',
  });

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({ ...formData, templateId, message: template.content });
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.message.trim() || selectedContacts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and select at least one contact.",
        variant: "destructive",
      });
      return;
    }

    addCampaign({
      name: formData.name,
      message: formData.message,
      contacts: selectedContacts,
      status: 'draft',
      totalCount: selectedContacts.length,
    });

    setFormData({ name: '', message: '', templateId: '' });
    setSelectedContacts([]);
    setIsOpen(false);
    toast({ title: t('createCampaign') });
  };

  const startCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    updateCampaign(campaignId, { status: 'sending' });

    for (let i = 0; i < campaign.contacts.length; i++) {
      const contactId = campaign.contacts[i];
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) continue;

      const personalizedMessage = campaign.message.replace(/\{\{name\}\}/g, contact.name);
      
      // Open WhatsApp Web with the message
      const encodedMessage = encodeURIComponent(personalizedMessage);
      const phoneNumber = contact.phone.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
      
      window.open(whatsappUrl, '_blank');

      addLog({
        campaignId,
        contactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phone,
        message: personalizedMessage,
        status: 'sent',
        sentAt: new Date().toISOString(),
      });

      updateCampaign(campaignId, { sentCount: i + 1 });

      // Delay between messages
      if (i < campaign.contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, settings.delayBetweenMessages * 1000));
      }
    }

    updateCampaign(campaignId, { status: 'completed' });
    toast({ title: "Campaign Completed", description: `Sent ${campaign.contacts.length} messages.` });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('campaigns')}</h1>
            <p className="mt-1 text-muted-foreground">
              {t('createManage')}
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="whatsapp">
                <Plus className="h-4 w-4" />
                {t('newCampaign')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('newCampaign')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="campaignName">{t('campaignName')}</Label>
                  <Input
                    id="campaignName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="New Year Promotion"
                  />
                </div>

                <div>
                  <Label>{t('useTemplate')}</Label>
                  <Select value={formData.templateId} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectTemplate')} />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">{t('message')}</Label>
                  <textarea
                    id="message"
                    className="min-h-[120px] w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Hello {{name}}! ..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('placeholderHint')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>{t('selectRecipients')} ({selectedContacts.length} {t('selected')})</Label>
                    <Button variant="ghost" size="sm" onClick={selectAllContacts}>
                      {selectedContacts.length === contacts.length ? t('deselectAll') : t('selectAll')}
                    </Button>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto rounded-lg border border-input bg-muted/30 p-3">
                    {contacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('noContactsAvailable')}</p>
                    ) : (
                      <div className="space-y-2">
                        {contacts.map((contact) => (
                          <label
                            key={contact.id}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer transition-colors"
                          >
                            <Checkbox
                              checked={selectedContacts.includes(contact.id)}
                              onCheckedChange={() => toggleContact(contact.id)}
                            />
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{contact.name}</p>
                              <p className="text-xs text-muted-foreground" dir="ltr">{contact.phone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button onClick={handleCreate} className="w-full" variant="whatsapp">
                  {t('createCampaign')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center animate-fade-in">
              <Send className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">{t('noCampaignsYet')}</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-md animate-slide-up"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <MessageSquare className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{campaign.name}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {campaign.totalCount} {t('recipients')}
                        </span>
                        <span>•</span>
                        <span>{campaign.sentCount}/{campaign.totalCount} {t('sent')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", statusColors[campaign.status])}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                    {campaign.status === 'draft' && (
                      <Button variant="whatsapp" size="sm" onClick={() => startCampaign(campaign.id)}>
                        <Play className="h-4 w-4" />
                        {t('start')}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                  {campaign.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
