"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

const QUESTION_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'rating', label: 'Rating' },
  { value: 'checkmark', label: 'Checkmark' },
  { value: 'radio', label: 'Radio' }
];

const getQuestionTypeLabel = (type) => QUESTION_TYPE_OPTIONS.find(option => option.value === type)?.label || 'Text';

export default function FormBuilder({ formId, questions, onQuestionUpdate, onQuestionAdd, onQuestionDelete }) {
  const [localQuestions, setLocalQuestions] = useState(questions || []);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState('text');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('text');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLocalQuestions(questions || []);
  }, [questions]);

  const handleAdd = async () => {
    if (!newQuestionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    try {
      const result = await onQuestionAdd(formId, { question_text: newQuestionText.trim(), question_type: newQuestionType });
      if (result && result.success) {
        setLocalQuestions(prev => [...prev, result.data]);
        setNewQuestionText('');
        setNewQuestionType('text');
        setAdding(false);
        toast.success('Question added');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add question');
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) {
      toast.error('Question text is required');
      return;
    }
    try {
      const result = await onQuestionUpdate(editingId, { question_text: editText.trim(), question_type: editType });
      if (result && result.success) {
        setLocalQuestions(prev => prev.map(q => q.question_id === editingId ? result.data : q));
        setEditingId(null);
        setEditText('');
        setEditType('text');
        toast.success('Question updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update question');
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const result = await onQuestionDelete(formId, questionId);
      if (result && result.success) {
        setLocalQuestions(prev => prev.filter(q => q.question_id !== questionId));
        toast.success('Question deleted');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete question');
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Questions */}
      {localQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Questions ({localQuestions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {localQuestions.map((question, index) => (
              <div key={question.question_id} className="flex items-start gap-2 group">
                <GripVertical className="h-5 w-5 text-gray-300 mt-1 cursor-grab" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-500 mr-2">Q{index + 1}.</span>
                    <span className="mr-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      {getQuestionTypeLabel(question.question_type)}
                    </span>
                  {editingId === question.question_id ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {QUESTION_TYPE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdate}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">{question.question_text}</p>
                  )}
                </div>
                {editingId !== question.question_id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(question.question_id); setEditText(question.question_text); setEditType(question.question_type || 'text'); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(question.question_id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add New Question */}
      {adding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Enter question text..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              rows={3}
            />
            <select
              value={newQuestionType}
              onChange={(e) => setNewQuestionType(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {QUESTION_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!newQuestionText.trim()}>
                Add Question
              </Button>
              <Button variant="ghost" onClick={() => { setAdding(false); setNewQuestionText(''); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      )}
    </div>
  );
}
