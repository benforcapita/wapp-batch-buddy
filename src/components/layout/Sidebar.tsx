import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Send, 
  History, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', icon: MessageSquare, label: 'Dashboard' },
  { path: '/contacts', icon: Users, label: 'Contacts' },
  { path: '/templates', icon: FileText, label: 'Templates' },
  { path: '/campaigns', icon: Send, label: 'Campaigns' },
  { path: '/logs', icon: History, label: 'Message Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col gradient-dark">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">
                WA Sender
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-glow" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <span className="animate-fade-in">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Connection Status */}
        <div className="border-t border-sidebar-border p-4">
          <div className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}>
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-soft" />
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-primary opacity-50 animate-ping" />
            </div>
            {!collapsed && (
              <span className="text-xs text-sidebar-foreground animate-fade-in">
                Ready to send
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
