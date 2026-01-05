import { Users, Send, CheckCircle2, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAppStore } from '@/store/appStore';

export default function Dashboard() {
  const { contacts, campaigns, logs } = useAppStore();
  
  const totalContacts = contacts.length;
  const totalCampaigns = campaigns.length;
  const messagesSent = logs.filter(l => l.status === 'sent' || l.status === 'delivered').length;
  const pendingMessages = logs.filter(l => l.status === 'pending').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back! Here's your messaging overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Contacts"
            value={totalContacts}
            icon={<Users className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Campaigns"
            value={totalCampaigns}
            icon={<Send className="h-5 w-5" />}
          />
          <StatsCard
            title="Messages Sent"
            value={messagesSent}
            icon={<CheckCircle2 className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Pending"
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
