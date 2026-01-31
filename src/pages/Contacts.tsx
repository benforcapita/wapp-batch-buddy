import { useRef, useState } from 'react';
import { Plus, Upload, Search, Trash2, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import type { Contact } from '@/types';
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
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(20),
});

const parseCsv = (input: string): string[][] => {
  const rows: string[][] = [];
  const normalized = input.replace(/^\uFEFF/, '');
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];

    if (char === '"') {
      if (inQuotes && normalized[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && normalized[i + 1] === '\n') {
        i++;
      }
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
};

const splitTags = (value: string) =>
  value
    .split(/[;,|]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

const normalizePhone = (phone: string, defaultCountryCode: string) => {
  const trimmed = phone.trim();
  if (!trimmed) return '';
  const withCountryCode = trimmed.startsWith('+')
    ? trimmed
    : `${defaultCountryCode}${trimmed}`;
  return withCountryCode.replace(/\s/g, '');
};

const parseContactsFromCsv = (
  csvText: string,
  defaultCountryCode: string
): Omit<Contact, 'id' | 'createdAt'>[] => {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const normalizedRows = rows.map((row) => row.map((cell) => cell.trim()));
  const headerRow = normalizedRows[0]?.map((cell) => cell.toLowerCase());
  const hasHeader = headerRow?.some((cell) => ['name', 'phone', 'tags'].includes(cell));

  const nameIndex = hasHeader && headerRow ? headerRow.indexOf('name') : -1;
  const phoneIndex = hasHeader && headerRow ? headerRow.indexOf('phone') : -1;
  const tagsIndex = hasHeader && headerRow ? headerRow.indexOf('tags') : -1;
  const startIndex = hasHeader ? 1 : 0;

  const getCellValue = (row: string[], index: number, fallbackIndex: number) => {
    const value = index >= 0 ? row[index] : row[fallbackIndex];
    return value ?? '';
  };

  const parsedContacts: Omit<Contact, 'id' | 'createdAt'>[] = [];

  normalizedRows.slice(startIndex).forEach((row) => {
    const nameValue = getCellValue(row, nameIndex, 0);
    const phoneValue = getCellValue(row, phoneIndex, 1);
    const tagsValue = getCellValue(row, tagsIndex, 2);
    const phone = normalizePhone(phoneValue, defaultCountryCode);

    if (!phone) return;

    parsedContacts.push({
      name: nameValue || 'Unknown',
      phone,
      tags: tagsValue ? splitTags(tagsValue) : [],
    });
  });

  return parsedContacts;
};

const escapeCsvValue = (value: string) => {
  const normalized = value.replace(/"/g, '""');
  return /[",\n\r]/.test(normalized) ? `"${normalized}"` : normalized;
};

export default function Contacts() {
  const contacts = useAppStore((state) => state.contacts);
  const settings = useAppStore((state) => state.settings);
  const addContact = useAppStore((state) => state.addContact);
  const removeContact = useAppStore((state) => state.removeContact);
  const importContacts = useAppStore((state) => state.importContacts);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', tags: '' });
  const [importText, setImportText] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImport = async () => {
    if (!importFile && !importText.trim()) {
      toast({
        title: "Import Failed",
        description: "Upload a CSV file or paste contact rows to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      let csvText = importText;
      if (importFile) {
        csvText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(reader.error);
          reader.readAsText(importFile);
        });
      }

      const newContacts = parseContactsFromCsv(csvText, settings.defaultCountryCode);

      if (newContacts.length === 0) {
        toast({
          title: "Import Failed",
          description: "No valid contacts found. Check your CSV columns.",
          variant: "destructive",
        });
        return;
      }

      importContacts(newContacts);
      setImportText('');
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsImportOpen(false);
      toast({
        title: "Contacts Imported",
        description: `${newContacts.length} contacts imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Could not read the CSV file.",
        variant: "destructive",
      });
      console.error('CSV import failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    if (filteredContacts.length === 0) {
      toast({
        title: "Export Failed",
        description: "No contacts available to export.",
        variant: "destructive",
      });
      return;
    }

    const header = ['name', 'phone', 'tags'];
    const rows = filteredContacts.map((contact) => [
      contact.name,
      contact.phone,
      contact.tags.join(', '),
    ]);
    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => escapeCsvValue(String(value))).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contacts.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast({
      title: "Contacts Exported",
      description: `${filteredContacts.length} contacts exported to CSV.`,
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('contacts')}</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              {t('manageContacts')}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="sm:size-default">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('importCsv')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t('importContactsTitle')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('importCsvFormat')}
                  </p>
                  <div>
                    <Label htmlFor="csvFile">{t('csvFile')}</Label>
                    <Input
                      id="csvFile"
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
                      className="mt-2"
                    />
                  </div>
                  <textarea
                    className="min-h-[200px] w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="John Doe, +1234567890, vip;customer&#10;Jane Smith, +0987654321"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                  <Button
                    onClick={handleImport}
                    className="w-full"
                    variant="whatsapp"
                    disabled={isImporting}
                  >
                    {t('importContacts')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="sm:size-default" onClick={handleExport}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('exportCsv')}</span>
            </Button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button variant="whatsapp" size="sm" className="sm:size-default">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('addContact')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t('addNewContact')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('name')}</Label>
                    <Input
                      id="name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('phoneNumber')}</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">{t('tagsCommaSeparated')}</Label>
                    <Input
                      id="tags"
                      value={newContact.tags}
                      onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                      placeholder="customer, vip"
                    />
                  </div>
                  <Button onClick={handleAddContact} className="w-full" variant="whatsapp">
                    {t('addContact')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3" />
          <Input
            placeholder={t('searchContacts')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>

        {/* Contacts Table */}
        <div className="rounded-xl border border-border bg-card animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-start text-sm font-semibold text-card-foreground">{t('name')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-card-foreground">{t('phone')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-card-foreground">{t('tags')}</th>
                  <th className="px-6 py-4 text-end text-sm font-semibold text-card-foreground">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      {t('noContactsFound')}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-card-foreground">{contact.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground" dir="ltr">{contact.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-end">
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
