"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function FormServiceLinkModal({ open, onClose, formId, linkedServices, onSuccess }) {
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Load all available services
  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open]);

  // Initialize selected services from linkedServices prop
  useEffect(() => {
    if (linkedServices && Array.isArray(linkedServices)) {
      setSelectedServices(linkedServices.map(ls => ({
        service_id: ls.service_id,
        form_order: ls.form_order || 1
      })));
    } else {
      setSelectedServices([]);
    }
  }, [linkedServices, open]);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (data.success) setServices(data.data || []);
    } catch (err) {
      toast.error('Failed to fetch services');
    }
  };

  const handleServiceToggle = (serviceId, checked) => {
    if (checked) {
      setSelectedServices(prev => prev.some(service => service.service_id === serviceId)
        ? prev
        : [...prev, { service_id: serviceId, form_order: 1 }]);
    } else {
      setSelectedServices(prev => prev.filter(s => s.service_id !== serviceId));
    }
  };

  const handleOrderChange = (serviceId, newOrder) => {
    setSelectedServices(prev =>
      prev.map(s => s.service_id === serviceId ? { ...s, form_order: parseInt(newOrder) || 1 } : s)
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/forms/${formId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: selectedServices })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Services linked successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to link services');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (serviceId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/forms/${formId}/services/${serviceId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      setSelectedServices(prev => prev.filter(s => s.service_id !== serviceId));
      toast.success('Service unlinked');
    } catch (err) {
      toast.error(err.message || 'Failed to unlink service');
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search
  const filteredServices = services.filter(s =>
    s.service_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 p-0 shadow-xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Link Form to Services</DialogTitle>
          <DialogDescription>
            Select which services this form should be available for. Offices offering these services will see the form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          {/* Search */}
          <div>
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Currently linked services */}
          {selectedServices.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-900">Currently Linked Services</h4>
              <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                {selectedServices.map(ls => {
                  const service = services.find(s => s.service_id === ls.service_id);
                  return (
                    <div key={ls.service_id} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={(e) => handleServiceToggle(ls.service_id, e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="flex-1 text-sm">{service?.service_name || `Service ID ${ls.service_id}`}</span>
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-gray-500">Order:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ls.form_order || 1}
                          onChange={(e) => handleOrderChange(ls.service_id, e.target.value)}
                          className="h-7 w-16 text-xs"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUnlink(ls.service_id)}
                        disabled={loading}
                      >
                        Unlink
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available services */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Available Services</h4>
            <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-3">
              {filteredServices.map(service => {
                const isLinked = selectedServices.some(s => s.service_id === service.service_id);
                return (
                  <div key={service.service_id} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={isLinked}
                      onChange={(e) => handleServiceToggle(service.service_id, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="flex-1 text-sm">{service.service_name}</span>
                    {isLinked && (
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-gray-500">Order:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={selectedServices.find(s => s.service_id === service.service_id)?.form_order || 1}
                          onChange={(e) => handleOrderChange(service.service_id, e.target.value)}
                          className="h-7 w-16 text-xs"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-gray-100 px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Links'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
