"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/forms-resources/LoadingSpinner';

export default function ManageOfficeModal({
  isOpen,
  onClose,
  onSubmit,
  officeToEdit,
  isFormSubmitting,
  officeTypes,
}) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    office_name: '',
    office_type_id: '',
    office_category: 'main',
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (officeToEdit) {
        setFormData({
          office_name: officeToEdit.office_name || '',
          office_type_id: officeToEdit.office_type_id ? String(officeToEdit.office_type_id) : '',
          office_category: officeToEdit.office_category || 'main',
        });
      } else {
        setFormData({
          office_name: '',
          office_type_id: '',
          office_category: 'main',
        });
      }
    }
  }, [isOpen, officeToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.office_name.trim()) {
      setError('Office name is required');
      return;
    }
    if (!formData.office_type_id.trim()) {
      setError('Office type is required');
      return;
    }

    onSubmit(formData);
  };

  const title = officeToEdit ? 'Edit Office' : 'Add New Office';

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-xl rounded-xl border border-gray-200 p-0 shadow-xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
        </DialogHeader>

        {internalLoading ? (
          <div className="flex flex-col items-center justify-center h-40 px-6 py-5">
            <LoadingSpinner />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="space-y-4 px-6 py-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office Name *
              </label>
              <Input
                type="text"
                name="office_name"
                value={formData.office_name}
                onChange={handleInputChange}
                placeholder="e.g., DMC Main Office"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office Type *
              </label>
              <select
                name="office_type_id"
                value={formData.office_type_id}
                onChange={handleInputChange}
                className="w-full h-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select office type</option>
                {(officeTypes || []).map(type => (
                  <option key={type.office_type_id} value={String(type.office_type_id)}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="office_category"
                value={formData.office_category}
                onChange={handleInputChange}
                className="w-full h-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="main">Main Office</option>
                <option value="branch">Branch Office</option>
                <option value="unit">Unit</option>
              </select>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-gray-100 px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" disabled={isFormSubmitting || internalLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={isFormSubmitting || internalLoading}
            className="bg-blue-600 text-white"
          >
            {isFormSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
