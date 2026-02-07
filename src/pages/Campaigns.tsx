import { useState, useEffect, useMemo } from 'react';
import { Plus, Send, Play, Users, MessageSquare, RefreshCw, Filter, X } from 'lucide-react';
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
import { fetchWhatsAppTemplates, sendWhatsAppTemplateMessage, WhatsAppTemplate } from '@/lib/whatsapp-api';

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
  const settings = useAppStore((state) => state.settings);
  const addCampaign = useAppStore((state) => state.addCampaign);
  const updateCampaign = useAppStore((state) => state.updateCampaign);
  const addLog = useAppStore((state) => state.addLog);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [templateVariables, setTemplateVariables] = useState<string[]>([]);
  const [apiTemplates, setApiTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    templateName: '',
    templateLanguage: '',
    templateBody: '',
  });

  // Get all unique tags from contacts
  const allTags = Array.from(
    new Set(contacts.flatMap((contact) => contact.tags))
  ).sort((a, b) => a.localeCompare(b));
  const filteredContacts = selectedTags.length === 0
    ? contacts
    : contacts.filter((contact) => contact.tags.some((tag) => selectedTags.includes(tag)));
  const filteredContactIds = filteredContacts.map((contact) => contact.id);
  const areAllFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((contact) => selectedContacts.includes(contact.id));

  // Load templates from API
  const loadTemplates = async () => {
    if (!settings.businessAccountId || !settings.accessToken) return;
    
    setIsLoadingTemplates(true);
    try {
      const templates = await fetchWhatsAppTemplates();
      // Only show approved templates
      setApiTemplates(templates.filter(t => t.status === 'APPROVED'));
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (settings.businessAccountId && settings.accessToken) {
      loadTemplates();
    }
  }, [settings.businessAccountId, settings.accessToken]);

  const getTemplateBody = (template: WhatsAppTemplate): string => {
    const bodyComponent = template.components.find(c => c.type === 'BODY');
    return bodyComponent?.text || '';
  };

  // Count how many parameters ({{1}}, {{2}}, etc.) a template has
  const countTemplateParameters = (template: WhatsAppTemplate): number => {
    const bodyComponent = template.components.find(c => c.type === 'BODY');
    const bodyText = bodyComponent?.text || '';
    const matches = bodyText.match(/\{\{\d+\}\}/g);
    return matches ? matches.length : 0;
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = apiTemplates.find(t => t.id === templateId);
    if (template) {
      const paramCount = countTemplateParameters(template);
      setFormData({ 
        ...formData, 
        templateId,
        templateName: template.name,
        templateLanguage: template.language,
        templateBody: getTemplateBody(template),
      });
      setTemplateVariables(Array.from({ length: paramCount }, () => ''));
    }
  };

  const updateTemplateVariable = (index: number, value: string) => {
    setTemplateVariables((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const resolveTemplateVariable = (
    index: number,
    overrides: string[] | undefined,
    fallback: { name: string; phone: string }
  ) => {
    const override = overrides?.[index];
    if (override && override.trim()) return override;
    if (index === 0) return fallback.name;
    if (index === 1) return fallback.phone;
    return '';
  };

  const renderTemplateMessage = (templateBody: string, values: string[]) =>
    values.reduce(
      (message, value, index) =>
        message.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), value),
      templateBody
    );

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const selectAllContacts = () => {
    if (filteredContacts.length === 0) return;

    if (areAllFilteredSelected) {
      setSelectedContacts((prev) => prev.filter((id) => !filteredContactIds.includes(id)));
      return;
    }

    setSelectedContacts((prev) => Array.from(new Set([...prev, ...filteredContactIds])));
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !formData.templateId || selectedContacts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields and select at least one contact.",
        variant: "destructive",
      });
      return;
    }

    addCampaign({
      name: formData.name,
      message: formData.templateBody,
      template: formData.templateId,
      contacts: selectedContacts,
      status: 'draft',
      totalCount: selectedContacts.length,
      templateVariables,
    });

    setFormData({ name: '', templateId: '', templateName: '', templateLanguage: '', templateBody: '' });
    setSelectedContacts([]);
    setTemplateVariables([]);
    setIsOpen(false);
    toast({ title: t('createCampaign') });
  };

  const startCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // Check if API credentials are configured
    if (!settings.phoneNumberId || !settings.accessToken) {
      toast({
        title: "API Not Configured",
        description: "Please configure your WhatsApp Business API credentials in Settings.",
        variant: "destructive",
      });
      return;
    }

    // Find the template for this campaign
    const template = apiTemplates.find(t => t.id === campaign.template);
    if (!template) {
      toast({
        title: "Template Not Found",
        description: "The template for this campaign is no longer available. Please refresh templates.",
        variant: "destructive",
      });
      return;
    }

    updateCampaign(campaignId, { status: 'sending' });
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < campaign.contacts.length; i++) {
      const contactId = campaign.contacts[i];
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) continue;

      // Build variables array based on how many parameters the template needs
      // {{1}} = contact name, {{2}} = contact phone, {{3}}+ = empty string
      const paramCount = countTemplateParameters(template);
      const variables = Array.from({ length: paramCount }, (_, index) =>
        resolveTemplateVariable(index, campaign.templateVariables, contact)
      );
      const renderedMessage = renderTemplateMessage(campaign.message, variables);
      
      try {
        // Send via WhatsApp Business API using template
        await sendWhatsAppTemplateMessage(
          contact.phone,
          template.name,
          template.language,
          variables
        );

        addLog({
          campaignId,
          contactId: contact.id,
          contactName: contact.name,
          contactPhone: contact.phone,
          message: `[Template: ${template.name}] ${renderedMessage}`,
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
        successCount++;
      } catch (error) {
        addLog({
          campaignId,
          contactId: contact.id,
          contactName: contact.name,
          contactPhone: contact.phone,
          message: `[Template: ${template.name}] ${renderedMessage}`,
          status: 'failed',
          sentAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failCount++;
      }

      updateCampaign(campaignId, { sentCount: i + 1 });

      // Delay between messages
      if (i < campaign.contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, settings.delayBetweenMessages * 1000));
      }
    }

    updateCampaign(campaignId, { 
      status: failCount === campaign.contacts.length ? 'failed' : 'completed' 
    });
    
    toast({ 
      title: "Campaign Completed", 
      description: `Sent ${successCount} messages successfully${failCount > 0 ? `, ${failCount} failed` : ''}.`,
      variant: failCount > 0 ? "destructive" : "default",
    });
  };

  const previewContact = contacts.find((contact) => selectedContacts.includes(contact.id)) ?? contacts[0];
  const previewFallback = {
    name: previewContact?.name ?? t('contactNamePlaceholder'),
    phone: previewContact?.phone ?? t('contactPhonePlaceholder'),
  };
  const previewValues = templateVariables.map((_, index) =>
    resolveTemplateVariable(index, templateVariables, previewFallback)
  );
  const templatePreview = formData.templateBody
    ? renderTemplateMessage(formData.templateBody, previewValues)
    : '';

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('campaigns')}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t('createManage')}
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="whatsapp" size="sm" className="sm:size-default w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                {t('newCampaign')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <div className="flex items-center justify-between mb-2">
                    <Label>WhatsApp Template</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={loadTemplates}
                      disabled={isLoadingTemplates}
                    >
                      <RefreshCw className={cn("h-3 w-3 mr-1", isLoadingTemplates && "animate-spin")} />
                      Refresh
                    </Button>
                  </div>
                  <Select value={formData.templateId} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder={apiTemplates.length === 0 ? "No approved templates found" : "Select a template"} />
                    </SelectTrigger>
                    <SelectContent>
                      {apiTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.language})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {apiTemplates.length === 0 && !isLoadingTemplates && (
                    <p className="mt-1 text-xs text-warning">
                      No approved templates found. Create templates in Meta Business Manager.
                    </p>
                  )}
                </div>

                {formData.templateBody && (
                  <div className="space-y-4">
                    {templateVariables.length > 0 && (
                      <div>
                        <Label>{t('templateVariables')}</Label>
                        <div className="mt-2 space-y-3">
                          {templateVariables.map((value, index) => (
                            <div key={`template-variable-${index}`} className="space-y-1">
                              <Label
                                htmlFor={`template-variable-${index}`}
                                className="text-xs sm:text-sm"
                              >
                                {t('templateVariable')} {index + 1}
                              </Label>
                              <Input
                                id={`template-variable-${index}`}
                                value={value}
                                onChange={(event) => updateTemplateVariable(index, event.target.value)}
                                placeholder={
                                  index === 0
                                    ? t('contactNamePlaceholder')
                                    : index === 1
                                      ? t('contactPhonePlaceholder')
                                      : t('optionalValue')
                                }
                              />
                              <p className="text-xs text-muted-foreground">
                                {index === 0
                                  ? t('defaultContactName')
                                  : index === 1
                                    ? t('defaultContactPhone')
                                    : t('optionalValue')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label>{t('templatePreview')}</Label>
                      <div className="mt-2 p-3 rounded-lg border border-border bg-muted/30 text-sm whitespace-pre-wrap">
                        {templatePreview}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('templatePreviewHint')}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>{t('selectRecipients')} ({selectedContacts.length} {t('selected')})</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllContacts}
                      disabled={filteredContacts.length === 0}
                    >
                      {areAllFilteredSelected ? t('deselectAll') : t('selectAll')}
                    </Button>
                  </div>
                  <div className="mb-3 rounded-lg border border-input bg-muted/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs sm:text-sm">{t('filterByTags')}</Label>
                      {selectedTags.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearTagFilters}>
                          {t('clearFilters')}
                        </Button>
                      )}
                    </div>
                    {allTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('noTagsAvailable')}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {allTags.map((tag) => (
                          <label
                            key={tag}
                            className="flex items-center gap-2 rounded-md border border-input px-2 py-1 text-xs sm:text-sm text-muted-foreground"
                          >
                            <Checkbox
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => toggleTag(tag)}
                            />
                            <span>{tag}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="max-h-[200px] overflow-y-auto rounded-lg border border-input bg-muted/30 p-3">
                    {contacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('noContactsAvailable')}</p>
                    ) : filteredContacts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('noContactsMatchFilters')}</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredContacts.map((contact) => (
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

                <Button 
                  onClick={handleCreate} 
                  className="w-full" 
                  variant="whatsapp"
                  disabled={!formData.templateId}
                >
                  {t('createCampaign')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns List */}
        <div className="space-y-3 sm:space-y-4">
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center animate-fade-in">
              <Send className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <p className="mt-4 text-sm sm:text-base text-muted-foreground">{t('noCampaignsYet')}</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-6 transition-all duration-300 hover:shadow-md animate-slide-up"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-accent shrink-0">
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-card-foreground text-sm sm:text-base truncate">{campaign.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          {campaign.totalCount} {t('recipients')}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{campaign.sentCount}/{campaign.totalCount} {t('sent')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className={cn("rounded-full px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium", statusColors[campaign.status])}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                    {campaign.status === 'draft' && (
                      <Button variant="whatsapp" size="sm" onClick={() => startCampaign(campaign.id)}>
                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">{t('start')}</span>
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground line-clamp-2">
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
