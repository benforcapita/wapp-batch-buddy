import { useMemo } from 'react';
import { Users, Send, CheckCircle2, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Dashboard() {
  const contacts = useAppStore((state) => state.contacts);
  const campaigns = useAppStore((state) => state.campaigns);
  const logs = useAppStore((state) => state.logs);
  const { t } = useLanguage();
  
  const totalContacts = contacts.length;
  const totalCampaigns = campaigns.length;
  const messagesSent = useMemo(() => logs.filter(l => l.status === 'sent' || l.status === 'delivered').length, [logs]);
  const pendingMessages = useMemo(() => logs.filter(l => l.status === 'pending').length, [logs]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="mt-1 text-muted-foreground">
            {t('welcomeBack')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('totalContacts')}
            value={totalContacts}
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title={t('campaignsLabel')}
            value={totalCampaigns}
            icon={<Send className="h-5 w-5" />}
          />
          <StatsCard
            title={t('messagesSent')}
            value={messagesSent}
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title={t('pending')}
            value={pendingMessages}
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  );
}
