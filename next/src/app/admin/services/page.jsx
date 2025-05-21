"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ServicesTable from '@/components/admin/ServicesTable';
import ManageServiceModal from '@/components/admin/ManageServiceModal';
import DeleteServiceDialog from '@/components/admin/DeleteServiceDialog';
import { Search, Plus } from 'lucide-react';

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
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOffice, setSelectedOffice] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
    const officeName = service.office_name?.toLowerCase() || '';
    const unitName = service.unit_name?.toLowerCase() || '';
    const typeName = service.service_type_name?.toLowerCase() || '';
    
    const searchTermLower = search.toLowerCase();
    const matchesSearch = 
      name.includes(searchTermLower) ||
      desc.includes(searchTermLower) ||
      officeName.includes(searchTermLower) ||
      unitName.includes(searchTermLower) ||
      typeName.includes(searchTermLower);

    const matchesType = selectedType === 'all' || service.service_type_name === selectedType;
    const matchesOffice = selectedOffice === 'all' || service.office_name === selectedOffice;

    return matchesSearch && matchesType && matchesOffice;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, selectedOffice]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get unique offices and types for filters
  const uniqueTypes = [...new Set(services.map(service => service.service_type_name).filter(Boolean))];
  const uniqueOffices = [...new Set(services.map(service => service.office_name).filter(Boolean))];
  
  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  // Always show the filters and search
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleAddService}
              variant="outline"
              className="h-10 px-4 border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Service
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100"> {/* mb-8 for more space */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search services by name, description, office, unit, type..."
              className="w-full h-10 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 md:col-span-6 w-full">
            <select
              className="flex-1 h-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              className="flex-1 h-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
            >
              <option value="all">All Offices</option>
              {uniqueOffices.map(office => (
                <option key={office} value={office}>{office}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-white border border-blue-100 p-10 rounded-xl shadow flex flex-col items-center max-w-xl w-full">
            <Plus className="text-blue-400 mb-4" size={48} />
            <p className="text-lg text-gray-700 mb-2 font-semibold">No services found for your search or filters.</p>
            <p className="text-gray-500 mb-4 text-center">There are currently no services available for your criteria.</p>
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded text-sm text-center">
              If you believe there should be data here, please check your filters or contact your system administrator.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <ServicesTable 
              services={paginatedServices} 
              onEdit={handleEditService} 
              onDelete={handleDeleteService} 
            />
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredServices.length)} of {filteredServices.length} results
              </div>
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    className={`px-3 py-1 text-sm ${
                      currentPage === i + 1 
                        ? "bg-blue-500 text-white hover:bg-blue-600" 
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </div>
          </div>
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
        </>
      )}
    </div>
  );
}