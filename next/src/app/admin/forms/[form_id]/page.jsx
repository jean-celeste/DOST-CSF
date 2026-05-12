"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Save, Link2, Package } from 'lucide-react';
import FormBuilder from '@/components/admin/FormBuilder';
import FormServiceLinkModal from '@/components/admin/FormServiceLinkModal';

export default function FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const formId = parseInt(params.form_id);

  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Form edit state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFormData();
    }
  }, [status, formId]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/forms/${formId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setForm(data.data);
      setQuestions(data.data.questions || []);
      setEditTitle(data.data.form_title);
      setEditDescription(data.data.description || '');
      setEditStatus(data.data.status_id.toString());
    } catch (err) {
      toast.error(err.message || 'Failed to fetch form');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMetadata = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_title: editTitle,
          description: editDescription,
          status_id: parseInt(editStatus)
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Form updated successfully (new version created)');
      setEditMode(false);
      // If a new form version was created, redirect to the new form's page
      if (data.meta?.new_form_id) {
        router.push(`/admin/forms/${data.meta.new_form_id}`);
      } else {
        fetchFormData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update form');
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionAdd = async (formId, questionData) => {
    const res = await fetch(`/api/admin/forms/${formId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  };

  const handleQuestionUpdate = async (questionId, questionData) => {
    const res = await fetch(`/api/admin/forms/${formId}/questions/${questionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  };

  const handleQuestionDelete = async (formId, questionId) => {
    const res = await fetch(`/api/admin/forms/${formId}/questions/${questionId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data;
  };

  const handleServiceLinkSuccess = () => {
    fetchFormData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!form) {
    return <div className="p-8 text-center">Form not found</div>;
  }

  const canEdit = session.user.role === 'Regional Administrator' ||
                  (session.user.role === 'Division Administrator' && form.added_by === session.user.id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{form.form_title}</h1>
              <Badge variant={form.status_name === 'active' ? 'default' : form.status_name === 'draft' ? 'secondary' : 'destructive'}>
                {form.status_name}
              </Badge>
              {form.version > 1 && (
                <Badge variant="outline">v{form.version}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Created by {form.added_by_name} • {form.linked_services?.length || 0} services linked
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowLinkModal(true)}>
            <Link2 className="h-4 w-4 mr-2" />
            Link to Services
          </Button>
          {canEdit && (
            <Button onClick={() => setEditMode(!editMode)}>
              {editMode ? <><Save className="h-4 w-4 mr-2" /> Save Changes</> : <><Package className="h-4 w-4 mr-2" /> Edit Details</>}
            </Button>
          )}
        </div>
      </div>

      {/* Edit Metadata */}
      {editMode && canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Edit Form Details</CardTitle>
            <CardDescription>
              Editing will create a new version. Existing responses remain linked to the old version.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="1">Active</option>
                <option value="2">Draft</option>
                <option value="3">Archived</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateMetadata} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes (New Version)'}
              </Button>
              <Button variant="ghost" onClick={() => setEditMode(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            Manage the questions for this form. Adding, editing, or deleting questions will affect the form structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormBuilder
            formId={formId}
            questions={questions}
            onQuestionAdd={handleQuestionAdd}
            onQuestionUpdate={handleQuestionUpdate}
            onQuestionDelete={handleQuestionDelete}
          />
        </CardContent>
      </Card>

      {/* Linked Services */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Services</CardTitle>
          <CardDescription>
            Services that this form is assigned to. Offices offering these services will have access to this form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {form.linked_services && form.linked_services.length > 0 ? (
            <div className="space-y-2">
              {form.linked_services.map(ls => (
                <div key={ls.service_form_id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{ls.service_name}</span>
                    {ls.form_order && <span className="text-sm text-muted-foreground ml-2">(Order: {ls.form_order})</span>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (!confirm('Unlink this service?')) return;
                      const res = await fetch(`/api/admin/forms/${formId}/services/${ls.service_id}`, { method: 'DELETE' });
                      const data = await res.json();
                      if (data.success) {
                        toast.success('Service unlinked');
                        fetchFormData();
                      } else {
                        toast.error(data.error);
                      }
                    }}
                  >
                    Unlink
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No services linked yet. Click "Link to Services" to get started.</p>
          )}
        </CardContent>
      </Card>

      {/* Service Link Modal */}
      <FormServiceLinkModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        formId={formId}
        linkedServices={form.linked_services || []}
        onSuccess={handleServiceLinkSuccess}
      />
    </div>
  );
}
