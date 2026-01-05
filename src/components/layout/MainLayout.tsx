import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { dir } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Sidebar />
      <main className={cn(
        "min-h-screen p-4 transition-all duration-300",
        isMobile 
          ? 'pt-20' // Account for mobile header
          : dir === 'rtl' ? 'mr-64 p-6' : 'ml-64 p-6'
      )}>
        {children}
      </main>
    </div>
  );
}
