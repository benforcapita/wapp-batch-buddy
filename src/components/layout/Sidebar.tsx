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
  Zap,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t, dir } = useLanguage();
  const isMobile = useIsMobile();

  const navItems = [
    { path: '/', icon: MessageSquare, labelKey: 'dashboard' as const },
    { path: '/contacts', icon: Users, labelKey: 'contacts' as const },
    { path: '/templates', icon: FileText, labelKey: 'templates' as const },
    { path: '/campaigns', icon: Send, labelKey: 'campaigns' as const },
    { path: '/logs', icon: History, labelKey: 'messageLogs' as const },
    { path: '/settings', icon: Settings, labelKey: 'settings' as const },
  ];

  const CollapseIcon = dir === 'rtl' 
    ? (collapsed ? ChevronLeft : ChevronRight)
    : (collapsed ? ChevronRight : ChevronLeft);

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Mobile header bar
  if (isMobile) {
    return (
      <>
        {/* Mobile header */}
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">
              WA Sender
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <aside 
          className={cn(
            "fixed top-14 z-50 h-[calc(100vh-3.5rem)] w-64 bg-sidebar transition-transform duration-300 ease-in-out",
            dir === 'rtl' ? 'right-0' : 'left-0',
            mobileOpen 
              ? 'translate-x-0' 
              : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col gradient-dark">
            <nav className="flex-1 space-y-1 p-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Connection Status */}
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse-soft" />
                  <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-primary opacity-50 animate-ping" />
                </div>
                <span className="text-xs text-sidebar-foreground">
                  {t('readyToSend')}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside 
      className={cn(
        "fixed top-0 z-40 h-screen bg-sidebar transition-all duration-300",
        dir === 'rtl' ? 'right-0' : 'left-0',
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
            <CollapseIcon className="h-4 w-4" />
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
                  <span className="animate-fade-in">{t(item.labelKey)}</span>
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
                {t('readyToSend')}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
