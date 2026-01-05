import { useState } from 'react';
import { Search, CheckCircle2, XCircle, Clock, Send, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusConfig = {
  pending: { icon: Clock, color: 'text-warning', bg: 'bg-warning/20' },
  sent: { icon: Send, color: 'text-info', bg: 'bg-info/20' },
  delivered: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/20' },
  failed: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/20' },
};

export default function Logs() {
  const logs = useAppStore((state) => state.logs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.contactName.toLowerCase().includes(search.toLowerCase()) ||
      log.contactPhone.includes(search) ||
      log.message.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">Message Logs</h1>
          <p className="mt-1 text-muted-foreground">
            Track all your sent messages and their delivery status
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <div className="rounded-xl border border-border bg-card animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Message</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      {logs.length === 0 
                        ? "No messages sent yet. Start a campaign to see logs here."
                        : "No messages match your search criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const { icon: StatusIcon, color, bg } = statusConfig[log.status];
                    return (
                      <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium", bg, color)}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{log.contactName}</p>
                            <p className="text-xs text-muted-foreground">{log.contactPhone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-muted-foreground max-w-md truncate">
                            {log.message}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.sentAt), 'MMM dd, yyyy HH:mm')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
