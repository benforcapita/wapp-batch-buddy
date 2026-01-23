import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { fetchWhatsAppTemplates, WhatsAppTemplate } from '@/lib/whatsapp-api';
import { cn } from '@/lib/utils';

const statusConfig = {
  APPROVED: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
  PENDING: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  REJECTED: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
};

export default function Templates() {
  const settings = useAppStore((state) => state.settings);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async () => {
    if (!settings.businessAccountId || !settings.accessToken) {
      setError(t('configureCredentials'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWhatsAppTemplates();
      setTemplates(data);
      toast({ title: t('templatesLoaded'), description: `${t('foundTemplates')}: ${data.length}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error');
      setError(message);
      toast({ title: t('error'), description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (settings.businessAccountId && settings.accessToken) {
      loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.businessAccountId, settings.accessToken]);

  const getTemplateBody = (template: WhatsAppTemplate): string => {
    const bodyComponent = template.components.find(c => c.type === 'BODY');
    return bodyComponent?.text || '';
  };

  const getTemplateVariables = (template: WhatsAppTemplate): number => {
    const body = getTemplateBody(template);
    const matches = body.match(/\{\{\d+\}\}/g);
    return matches?.length || 0;
  };

  const approvedTemplates = templates.filter(t => t.status === 'APPROVED');
  const pendingTemplates = templates.filter(t => t.status === 'PENDING');
  const rejectedTemplates = templates.filter(t => t.status === 'REJECTED');

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('messageTemplates')}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t('templatesFromAccount')}
            </p>
          </div>
          <Button 
            variant="whatsapp" 
            size="sm" 
            className="sm:size-default w-full sm:w-auto"
            onClick={loadTemplates}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            {isLoading ? t('loading') : t('refreshTemplates')}
          </Button>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-info/30 bg-info/10 p-3 sm:p-4 animate-slide-up">
          <div className="flex gap-3">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-info shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm sm:text-base font-medium text-card-foreground">{t('aboutTemplates')}</h4>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {t('aboutTemplatesDescription')}
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 animate-fade-in">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Stats */}
        {templates.length > 0 && (
          <div className="grid gap-3 grid-cols-3 animate-slide-up">
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-success">{approvedTemplates.length}</p>
              <p className="text-xs text-muted-foreground">{t('approved')}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-warning">{pendingTemplates.length}</p>
              <p className="text-xs text-muted-foreground">{t('pendingStatus')}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-2xl font-bold text-destructive">{rejectedTemplates.length}</p>
              <p className="text-xs text-muted-foreground">{t('rejected')}</p>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && templates.length > 0 && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const status = statusConfig[template.status];
              const StatusIcon = status.icon;
              const variableCount = getTemplateVariables(template);

              return (
                <div
                  key={template.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 transition-all duration-300 hover:shadow-md animate-slide-up"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-card-foreground text-sm sm:text-base truncate">
                        {template.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={cn("flex items-center gap-1 text-xs", status.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {template.status === 'APPROVED' ? t('approved') : template.status === 'PENDING' ? t('pendingStatus') : t('rejected')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {template.language}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                    {getTemplateBody(template)}
                  </p>
                  {variableCount > 0 && (
                    <p className="mt-2 text-xs text-info">
                      {variableCount} {t('variablesRequired')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && templates.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center animate-fade-in">
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('noTemplatesFound')}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.open('https://business.facebook.com/wa/manage/message-templates/', '_blank')}
            >
              {t('openMetaBusinessManager')}
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5 animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                <div className="h-16 bg-muted rounded w-full mt-3"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
