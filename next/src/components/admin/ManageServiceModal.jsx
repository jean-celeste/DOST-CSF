"use client";

import { useEffect, useState } from 'react';
import EditServiceModal from '@/components/EditServiceModal'; // Assuming this is a generic modal wrapper
import ServiceForm from '@/components/forms/ServiceForm';
import LoadingSpinner from '@/components/forms-resources/LoadingSpinner';

export default function ManageServiceModal({
  isOpen,
  onClose,
  onSubmit,
  serviceToEdit, // This will be the full service object for editing, or null for adding
  isFormSubmitting, // Loading state for the submission process, controlled by parent
}) {
  const [internalLoading, setInternalLoading] = useState(false); // For loading dropdowns etc.
  const [error, setError] = useState(null);

  const [offices, setOffices] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [currentService, setCurrentService] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setInternalLoading(true);
      setCurrentService(serviceToEdit); // Set current service for the form

      const fetchData = async () => {
        try {
          const [officesRes, typesRes] = await Promise.all([
            fetch('/api/admin/offices'),
            fetch('/api/admin/services_types'),
          ]);

          const officesData = await officesRes.json();
          const typesData = await typesRes.json();

          if (!officesData.success) throw new Error(officesData.error || 'Failed to fetch offices');
          if (!typesData.success) throw new Error(typesData.error || 'Failed to fetch service types');
          
          setOffices(officesData.data || []);
          setServiceTypes(typesData.data || []);

          // If editing and office_id is present, fetch initial units
          if (serviceToEdit && serviceToEdit.office_id) {
            const unitsRes = await fetch(`/api/admin/units?office_id=${serviceToEdit.office_id}`);
            const unitsData = await unitsRes.json();
            if (!unitsData.success) throw new Error(unitsData.error || 'Failed to fetch units');
            setUnits(unitsData.data || []);
          } else {
            setUnits([]); // Clear units if no office selected or adding new
          }
        } catch (err) {
          setError(err.message);
          setOffices([]);
          setServiceTypes([]);
          setUnits([]);
        } finally {
          setInternalLoading(false);
        }
      };

      fetchData();
    } else {
      // Reset states when modal is closed
      setInternalLoading(false);
      setError(null);
      setOffices([]);
      setServiceTypes([]);
      setUnits([]);
      setCurrentService(null);
    }
  }, [isOpen, serviceToEdit]);

  const handleOfficeChange = async (officeId) => {
    if (!officeId) {
      setUnits([]);
      return;
    }
    // setError(null); // Clear previous errors
    try {
      // setInternalLoading(true); // Optionally show loading for units
      const unitsRes = await fetch(`/api/admin/units?office_id=${officeId}`);
      const unitsData = await unitsRes.json();
      if (!unitsData.success) throw new Error(unitsData.error || 'Failed to fetch units');
      setUnits(unitsData.data || []);
    } catch (err) {
      setError(err.message); // Display error related to units fetching
      setUnits([]);
    } finally {
      // setInternalLoading(false);
    }
  };

  const title = serviceToEdit ? 'Edit Service' : 'Add New Service';

  if (!isOpen) {
    return null;
  }

  return (
    <EditServiceModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      {internalLoading ? (
        <div className="flex flex-col items-center justify-center h-40">
          <LoadingSpinner />
          <span>Loading data...</span>
        </div>
      ) : error ? (
         <div className="text-red-500 p-4">Error: {error} <button onClick={onClose} className="text-blue-500 underline ml-2">Close</button></div>
      ) : (
        <ServiceForm
          initialValues={currentService} // Use currentService which is set from serviceToEdit
          onSubmit={onSubmit}
          onCancel={onClose}
          loading={isFormSubmitting} // This is the loading state for the actual form submission
          offices={offices}
          serviceTypes={serviceTypes}
          units={units}
          onOfficeChange={handleOfficeChange}
        />
      )}
    </EditServiceModal>
  );
}
