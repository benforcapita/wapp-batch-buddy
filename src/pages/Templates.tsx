import { useState } from 'react';
import { Plus, Trash2, Edit2, Copy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Templates() {
  const templates = useAppStore((state) => state.templates);
  const addTemplate = useAppStore((state) => state.addTemplate);
  const removeTemplate = useAppStore((state) => state.removeTemplate);
  const updateTemplate = useAppStore((state) => state.updateTemplate);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '' });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and content are required.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateTemplate(editingId, formData);
      toast({ title: t('updateTemplate') });
    } else {
      addTemplate(formData);
      toast({ title: t('createTemplate') });
    }

    setFormData({ name: '', content: '' });
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEdit = (template: typeof templates[0]) => {
    setFormData({ name: template.name, content: template.content });
    setEditingId(template.id);
    setIsOpen(true);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <MainLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('messageTemplates')}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t('createReusable')}
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setFormData({ name: '', content: '' });
              setEditingId(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="whatsapp" size="sm" className="sm:size-default w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                {t('newTemplate')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingId ? t('editTemplate') : t('newTemplate')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">{t('templateName')}</Label>
                  <Input
                    id="templateName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome Message"
                  />
                </div>
                <div>
                  <Label htmlFor="templateContent">{t('messageContent')}</Label>
                  <textarea
                    id="templateContent"
                    className="min-h-[150px] w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Hello {{name}}! Welcome to our service..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t('placeholderHint')}
                  </p>
                </div>
                <Button onClick={handleSave} className="w-full" variant="whatsapp">
                  {editingId ? t('updateTemplate') : t('createTemplate')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 transition-all duration-300 hover:shadow-md animate-slide-up"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-card-foreground text-sm sm:text-base truncate">{template.name}</h3>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(template.content)}
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(template)}
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTemplate(template.id)}
                    className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-4">
                {template.content}
              </p>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 sm:p-12 text-center animate-fade-in">
            <p className="text-sm sm:text-base text-muted-foreground">{t('noTemplatesYet')}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
