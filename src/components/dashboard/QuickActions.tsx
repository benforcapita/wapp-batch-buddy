import { Link } from 'react-router-dom';
import { Plus, Upload, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-slide-up">
      <h3 className="mb-4 text-lg font-semibold text-card-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/contacts">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </Link>
        <Link to="/contacts">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Upload className="h-4 w-4" />
            Import Contacts
          </Button>
        </Link>
        <Link to="/campaigns">
          <Button variant="whatsapp" className="w-full justify-start gap-2">
            <Send className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
        <Link to="/templates">
          <Button variant="outline" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Create Template
          </Button>
        </Link>
      </div>
    </div>
  );
}
