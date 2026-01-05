import { useState } from 'react';
import { Plus, Trash2, Edit2, Copy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
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
  const { templates, addTemplate, removeTemplate, updateTemplate } = useAppStore();
  const { toast } = useToast();
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
      toast({ title: "Template Updated" });
    } else {
      addTemplate(formData);
      toast({ title: "Template Created" });
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Message Templates</h1>
            <p className="mt-1 text-muted-foreground">
              Create reusable message templates with placeholders
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
              <Button variant="whatsapp">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Template' : 'Create Template'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Welcome Message"
                  />
                </div>
                <div>
                  <Label htmlFor="templateContent">Message Content</Label>
                  <textarea
                    id="templateContent"
                    className="min-h-[150px] w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Hello {{name}}! Welcome to our service..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use {"{{name}}"} as placeholder for contact name
                  </p>
                </div>
                <Button onClick={handleSave} className="w-full" variant="whatsapp">
                  {editingId ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md animate-slide-up"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-card-foreground">{template.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(template.content)}
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(template)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTemplate(template.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-4">
                {template.content}
              </p>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center animate-fade-in">
            <p className="text-muted-foreground">No templates yet. Create your first template to get started.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
