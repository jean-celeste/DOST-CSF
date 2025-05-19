"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServicesTable from '@/components/admin/ServicesTable';
import ManageServiceModal from '@/components/admin/ManageServiceModal';
import DeleteServiceDialog from '@/components/admin/DeleteServiceDialog';
import { Search } from 'lucide-react';

function Spinner() {
  return (
    <div className="flex justify-center items-center h-16">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showManageModal, setShowManageModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch services');
      setServices(data.data || []);
    } catch (err) {
      setError(err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setServiceToEdit(null);
    setShowManageModal(true);
  };

  const handleEditService = (service) => {
    setServiceToEdit(service);
    setShowManageModal(true);
  };

  const handleDeleteService = (service) => {
    setServiceToDelete(service);
    setShowDeleteDialog(true);
  };

  const handleManageModalClose = () => {
    setShowManageModal(false);
    setServiceToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsFormSubmitting(true);
    setError(null);
    try {
      const method = serviceToEdit ? 'PUT' : 'POST';
      const url = serviceToEdit
        ? `/api/admin/services/${serviceToEdit.service_id}`
        : '/api/admin/services';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to save service');
      
      setShowManageModal(false);
      setServiceToEdit(null);
      fetchServices();
    } catch (err) {
      setError(err.message); 
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/services/${serviceToDelete.service_id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete service');
      
      setShowDeleteDialog(false);
      setServiceToDelete(null);
      fetchServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = services.filter(service => {
    const name = service.service_name?.toLowerCase() || '';
    const desc = service.description?.toLowerCase() || '';
    // Add other fields to search if necessary, e.g., office_name, unit_name, service_type_name
    const officeName = service.office_name?.toLowerCase() || '';
    const unitName = service.unit_name?.toLowerCase() || '';
    const typeName = service.service_type_name?.toLowerCase() || '';
    
    const searchTermLower = search.toLowerCase();

    return (
      name.includes(searchTermLower) ||
      desc.includes(searchTermLower) ||
      officeName.includes(searchTermLower) ||
      unitName.includes(searchTermLower) ||
      typeName.includes(searchTermLower)
    );
  });
  
  // Consistent loading and error display
  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="mb-8"> {/* Outer container for title and controls */}
        <h1 className="text-2xl font-bold mb-4">Service Management</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center"> {/* Container for search and button, added items-center for md */}
          <div className="relative w-full md:w-3/5"> {/* Search input with icon - Changed from flex-1 */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search services by name, description, office, unit, type..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex md:ml-auto"> {/* Container for buttons, md:ml-auto to push to right if space allows */}
            <Button onClick={handleAddService} className="bg-blue-500 hover:bg-blue-600 text-white">
              Add Service
            </Button>
          </div>
        </div>
      </div>

      <ServicesTable 
        services={filteredServices} 
        onEdit={handleEditService} 
        onDelete={handleDeleteService} 
      />

      <ManageServiceModal
        isOpen={showManageModal}
        onClose={handleManageModalClose}
        onSubmit={handleFormSubmit}
        serviceToEdit={serviceToEdit}
        isFormSubmitting={isFormSubmitting}
      />

      <DeleteServiceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        serviceName={serviceToDelete?.service_name}
        isLoading={isDeleting}
      />
    </div>
  );
}