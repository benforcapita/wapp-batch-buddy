import { useMemo } from 'react';
import { CheckCircle2, XCircle, Clock, Send } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusIcons = {
  pending: Clock,
  sent: Send,
  delivered: CheckCircle2,
  failed: XCircle,
};

const statusColors = {
  pending: 'text-warning',
  sent: 'text-info',
  delivered: 'text-success',
  failed: 'text-destructive',
};

export function RecentActivity() {
  const allLogs = useAppStore((state) => state.logs);
  const logs = useMemo(() => allLogs.slice(0, 5), [allLogs]);
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-6 animate-slide-up">
      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-card-foreground">{t('recentActivity')}</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noRecentMessages')}</p>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {logs.map((log) => {
            const StatusIcon = statusIcons[log.status];
            return (
              <div 
                key={log.id}
                className="flex items-center gap-2 sm:gap-3 rounded-lg bg-muted/50 p-2 sm:p-3 transition-colors hover:bg-muted"
              >
                <div className={cn("rounded-full p-1 sm:p-1.5", statusColors[log.status])}>
                  <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-card-foreground truncate">
                    {log.contactName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                    {log.message.substring(0, 30)}...
                  </p>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
                  {format(new Date(log.sentAt), 'HH:mm')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
