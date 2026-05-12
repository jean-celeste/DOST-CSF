"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormCard from '@/components/admin/FormCard';
import { Card } from '@/components/ui/card';
import { Plus, Search, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminFormsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'active', 'draft', 'archived'
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', description: '', status_id: 2 });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
    } else if (status === 'authenticated' && !session.user.role?.toLowerCase().includes('admin')) {
      router.replace('/admin');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchForms();
    }
  }, [status, filter]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/forms';
      const params = [];
      if (filter === 'my' && session.user.role === 'Division Administrator') {
        params.push('mine=true');
      } else if (filter === 'active') {
        params.push('status=active');
      } else if (filter === 'draft') {
        params.push('status=draft');
      } else if (filter === 'archived') {
        params.push('status=archived');
      }
      if (params.length > 0) url += '?' + params.join('&');

      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setForms(data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newForm.title.trim()) {
      toast.error('Form title is required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_title: newForm.title.trim(),
          description: newForm.description.trim(),
          status_id: parseInt(newForm.status_id)
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Form created successfully');
      setShowCreateDialog(false);
      setNewForm({ title: '', description: '', status_id: 2 });
      fetchForms();
      router.push(`/admin/forms/${data.data.form_id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create form');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (formId) => {
    if (!confirm('Are you sure you want to delete this form? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/forms/${formId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Form deleted');
      fetchForms();
    } catch (err) {
      toast.error(err.message || 'Failed to delete form');
    }
  };

  const filteredForms = forms.filter(form =>
    form.form_title?.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = session.user.role === 'Regional Administrator' || session.user.role === 'Division Administrator';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Form Management</h1>
          <p className="text-muted-foreground">
            Create and manage feedback forms for your services.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="my">My Forms</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredForms.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No forms found</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {canCreate ? 'Create your first form to get started.' : 'No forms are available.'}
          </p>
          {canCreate && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map(form => (
            <FormCard
              key={form.form_id}
              form={form}
              onView={(f) => router.push(`/admin/forms/${f.form_id}`)}
              onEdit={(f) => router.push(`/admin/forms/${f.form_id}`)}
              onDelete={(f) => handleDelete(f.form_id)}
            />
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Form Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Customer Satisfaction Survey"
                value={newForm.title}
                onChange={(e) => setNewForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the form's purpose..."
                value={newForm.description}
                onChange={(e) => setNewForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newForm.status_id.toString()}
                onValueChange={(val) => setNewForm(f => ({ ...f, status_id: parseInt(val) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Draft</SelectItem>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="3">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
