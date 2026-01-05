import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { dir } = useLanguage();

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Sidebar />
      <main className={cn(
        "min-h-screen p-6 transition-all duration-300",
        dir === 'rtl' ? 'mr-64' : 'ml-64'
      )}>
        {children}
      </main>
    </div>
  );
}
