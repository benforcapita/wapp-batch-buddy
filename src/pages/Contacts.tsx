import { useState } from 'react';
import { Plus, Upload, Search, Trash2, Edit2, X } from 'lucide-react';
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
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(20),
});

export default function Contacts() {
  const { contacts, addContact, removeContact, importContacts, settings } = useAppStore();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', tags: '' });
  const [importText, setImportText] = useState('');

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleAddContact = () => {
    const result = contactSchema.safeParse(newContact);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    const phone = newContact.phone.startsWith('+') 
      ? newContact.phone 
      : `${settings.defaultCountryCode}${newContact.phone}`;
    
    addContact({
      name: newContact.name.trim(),
      phone: phone.replace(/\s/g, ''),
      tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    
    setNewContact({ name: '', phone: '', tags: '' });
    setIsAddOpen(false);
    toast({
      title: "Contact Added",
      description: "Contact has been added successfully.",
    });
  };

  const handleImport = () => {
    const lines = importText.trim().split('\n').filter(Boolean);
    const newContacts = lines.map((line) => {
      const [name, phone] = line.split(',').map(s => s.trim());
      const formattedPhone = phone?.startsWith('+') 
        ? phone 
        : `${settings.defaultCountryCode}${phone}`;
      return {
        name: name || 'Unknown',
        phone: formattedPhone?.replace(/\s/g, '') || '',
        tags: [],
      };
    }).filter(c => c.phone);

    if (newContacts.length === 0) {
      toast({
        title: "Import Failed",
        description: "No valid contacts found. Use format: Name, Phone",
        variant: "destructive",
      });
      return;
    }

    importContacts(newContacts);
    setImportText('');
    setIsImportOpen(false);
    toast({
      title: "Contacts Imported",
      description: `${newContacts.length} contacts imported successfully.`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your contact list for bulk messaging
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Contacts</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Paste contacts in format: Name, Phone (one per line)
                  </p>
                  <textarea
                    className="min-h-[200px] w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="John Doe, +1234567890&#10;Jane Smith, +0987654321"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                  <Button onClick={handleImport} className="w-full" variant="whatsapp">
                    Import Contacts
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button variant="whatsapp">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newContact.tags}
                      onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                      placeholder="customer, vip"
                    />
                  </div>
                  <Button onClick={handleAddContact} className="w-full" variant="whatsapp">
                    Add Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contacts Table */}
        <div className="rounded-xl border border-border bg-card animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Tags</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No contacts found. Add your first contact to get started.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-card-foreground">{contact.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{contact.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContact(contact.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
