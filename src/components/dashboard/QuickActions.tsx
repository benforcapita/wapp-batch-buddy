import { Link } from 'react-router-dom';
import { Plus, Upload, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export function QuickActions() {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 animate-slide-up">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-card-foreground">{t('quickActions')}</h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Link to="/contacts">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs sm:text-sm h-9 sm:h-10">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{t('addContact')}</span>
          </Button>
        </Link>
        <Link to="/contacts">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs sm:text-sm h-9 sm:h-10">
            <Upload className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{t('importContacts')}</span>
          </Button>
        </Link>
        <Link to="/campaigns">
          <Button variant="whatsapp" size="sm" className="w-full justify-start gap-2 text-xs sm:text-sm h-9 sm:h-10">
            <Send className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{t('newCampaign')}</span>
          </Button>
        </Link>
        <Link to="/templates">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs sm:text-sm h-9 sm:h-10">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{t('createTemplate')}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
