"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServiceForm from '@/components/forms/ServiceForm';
import LoadingSpinner from '@/components/forms-resources/LoadingSpinner';
import EditServiceModal from '@/components/EditServiceModal';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deletingService, setDeletingService] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModalLoading, setEditModalLoading] = useState(false);

  const [offices, setOffices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch services');
      setServices(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEdit = async (service) => {
    setEditModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch service data
      const serviceRes = await fetch(`/api/admin/services/${service.service_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const serviceData = await serviceRes.json();
      if (!serviceData.success) throw new Error(serviceData.error || 'Failed to fetch service');

      // Fetch dropdowns
      const [officesRes, typesRes] = await Promise.all([
        fetch('/api/admin/offices', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/services_types', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const officesData = await officesRes.json();
      const typesData = await typesRes.json();

      // Fetch units for the selected office
      let unitsData = { data: [] };
      if (serviceData.data.office_id) {
        const unitsRes = await fetch(`/api/admin/units?office_id=${serviceData.data.office_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        unitsData = await unitsRes.json();
      }

      setEditingService(serviceData.data);
      setOffices(officesData.data || []);
      setServiceTypes(typesData.data || []);
      setUnits(unitsData.data || []);
      setShowForm(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEditModalLoading(false);
    }
  };

  const handleDelete = (service) => {
    setDeletingService(service);
    setShowDelete(true);
  };

  const handleFormSubmit = async (form) => {
    setFormLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const method = editingService ? 'PUT' : 'POST';
      const url = editingService
        ? `/api/admin/services/${editingService.service_id}`
        : '/api/admin/services';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to save service');
      setShowForm(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/services/${deletingService.service_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete service');
      setShowDelete(false);
      setDeletingService(null);
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOfficeChange = async (officeId) => {
    if (!officeId) {
      setUnits([]);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const unitsRes = await fetch(`/api/admin/units?office_id=${officeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unitsData = await unitsRes.json();
      setUnits(unitsData.data || []);
    } catch (err) {
      setUnits([]);
    }
  };

  const filteredServices = services.filter(service => {
    const name = service.service_name?.toLowerCase() || '';
    const desc = service.description?.toLowerCase() || '';
    return (
      name.includes(search.toLowerCase()) ||
      desc.includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Service Management</h1>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleAdd} className="ml-2">Add Service</Button>
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Office</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No services found.</td>
                </tr>
              ) : (
                filteredServices.map(service => (
                  <tr key={service.service_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{service.service_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{service.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{service.service_type_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{service.office_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{service.unit_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(service)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(service)}>Delete</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {editModalLoading && (
        <EditServiceModal isOpen={true} onClose={() => { setShowForm(false); setEditingService(null); }} title={null}>
          <LoadingSpinner />
          <span>Loading service data...</span>
        </EditServiceModal>
      )}
      {showForm && !editModalLoading && (
        <EditServiceModal
          isOpen={true}
          onClose={() => { setShowForm(false); setEditingService(null); }}
          title={editingService ? 'Edit Service' : 'Add Service'}
        >
          <ServiceForm
            initialValues={editingService}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingService(null); }}
            loading={formLoading}
            offices={offices}
            serviceTypes={serviceTypes}
            units={units}
            onOfficeChange={handleOfficeChange}
          />
        </EditServiceModal>
      )}

      {/* Delete Confirmation Dialog */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Service</h2>
            <p>Are you sure you want to delete <b>{deletingService?.service_name}</b>?</p>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => { setShowDelete(false); setDeletingService(null); }} disabled={deleteLoading}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 