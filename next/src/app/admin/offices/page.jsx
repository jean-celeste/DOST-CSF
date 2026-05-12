"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import OfficesTable from '@/components/admin/OfficesTable';
import ManageOfficeModal from '@/components/admin/ManageOfficeModal';
import DeleteOfficeDialog from '@/components/admin/DeleteOfficeDialog';
import { Search, Plus } from 'lucide-react';

function Spinner() {
  return (
    <div className="flex justify-center items-center h-16">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

export default function AdminOfficesPage() {
  const [offices, setOffices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [showManageModal, setShowManageModal] = useState(false);
  const [officeToEdit, setOfficeToEdit] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/offices');
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to fetch offices');
      setOffices(data.data || []);
    } catch (err) {
      setError(err.message);
      setOffices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffice = () => {
    setOfficeToEdit(null);
    setShowManageModal(true);
  };

  const handleEditOffice = (office) => {
    setOfficeToEdit(office);
    setShowManageModal(true);
  };

  const handleDeleteOffice = (office) => {
    setOfficeToDelete(office);
    setShowDeleteDialog(true);
  };

  const handleManageModalClose = () => {
    setShowManageModal(false);
    setOfficeToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsFormSubmitting(true);
    setError(null);
    try {
      const method = officeToEdit ? 'PUT' : 'POST';
      const url = officeToEdit
        ? `/api/admin/offices/${officeToEdit.office_id}`
        : '/api/admin/offices';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to save office');
      
      setShowManageModal(false);
      setOfficeToEdit(null);
      fetchOffices();
    } catch (err) {
      setError(err.message); 
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!officeToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/offices/${officeToDelete.office_id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete office');
      
      setShowDeleteDialog(false);
      setOfficeToDelete(null);
      fetchOffices();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOffices = offices.filter(office => {
    const name = office.office_name?.toLowerCase() || '';
    const location = office.location?.toLowerCase() || '';
    const officeType = (office.office_type_id || '')?.toString().toLowerCase() || '';

    const searchTermLower = search.toLowerCase();
    const matchesSearch =
      name.includes(searchTermLower) ||
      location.includes(searchTermLower) ||
      officeType.includes(searchTermLower);

    const matchesCategory = selectedCategory === 'all' || office.office_category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOffices.length / itemsPerPage);
  const paginatedOffices = filteredOffices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Office Management</h1>
          <div className="flex gap-2">
            <Button className="h-10 px-4 bg-gray-200 text-gray-400" disabled>
              <Plus size={18} />
              Add Office
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
          <div className="h-10 bg-gray-200 rounded col-span-6" />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
        <div className="h-64" />
      </div>
    </div>
  );
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Office Management</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleAddOffice}
              variant="outline"
              className="h-10 px-4 border-blue-500 text-blue-500 hover:bg-blue-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Office
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="relative md:col-span-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search offices by name, location, type..."
              className="w-full h-10 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 md:col-span-6 w-full flex-wrap">
            <select
              className="flex-1 min-w-[150px] h-10 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="main">Main Office</option>
              <option value="branch">Branch Office</option>
            </select>
          </div>
        </div>
      </div>
      {filteredOffices.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="text-4xl mb-2">🙁</div>
          <div className="text-gray-700 font-semibold mb-1">No offices found</div>
          <div className="text-gray-500 text-sm">Try adjusting your search or filters, or check back later.</div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <OfficesTable 
              offices={paginatedOffices} 
              onEdit={handleEditOffice} 
              onDelete={handleDeleteOffice} 
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'outline'}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <ManageOfficeModal
        isOpen={showManageModal}
        onClose={handleManageModalClose}
        onSubmit={handleFormSubmit}
        officeToEdit={officeToEdit}
        isFormSubmitting={isFormSubmitting}
      />

      <DeleteOfficeDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        officeName={officeToDelete?.office_name}
        isLoading={isDeleting}
      />
    </div>
  );
}
