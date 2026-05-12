import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ServiceForm({ initialValues = {}, onSubmit, onCancel, loading, offices = [], serviceTypes = [], units = [], onOfficeChange, clientTypes = [] }) {
  const [form, setForm] = useState({
    service_name: '',
    description: '',
    service_type_id: '',
    unit_id: '',
    office_associations: [],
    ...initialValues,
  });
  const [error, setError] = useState(null);
  const [selectedClientTypes, setSelectedClientTypes] = useState([]);
  const [selectedOffices, setSelectedOffices] = useState([]);
  const lastNotifiedParentOfficeId = useRef(null);

  useEffect(() => {
    setForm(f => ({ ...f, ...initialValues }));
    if (Array.isArray(initialValues.client_types)) {
      setSelectedClientTypes(initialValues.client_types.map(ct => ct.client_type_id));
    } else {
      setSelectedClientTypes([]);
    }
    if (Array.isArray(initialValues.office_associations)) {
      setSelectedOffices(initialValues.office_associations.map(oa => ({
        office_id: oa.office_id,
        is_process_owner: oa.is_process_owner || false,
      })));
    } else if (initialValues.office_id) {
      setSelectedOffices([{ office_id: initialValues.office_id, is_process_owner: true }]);
    } else {
      setSelectedOffices([]);
    }
  }, [initialValues]);

  useEffect(() => {
    if (!onOfficeChange || !offices?.length) return;
    const processOwner = selectedOffices.find((o) => o.is_process_owner);
    if (!processOwner) return;
    const meta = offices.find((o) => o.office_id === processOwner.office_id);
    if (!(meta && meta.office_category === 'main')) return;
    const id = processOwner.office_id;
    if (lastNotifiedParentOfficeId.current === id) return;
    lastNotifiedParentOfficeId.current = id;
    onOfficeChange(String(id));
  }, [selectedOffices, offices, onOfficeChange]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'office_id' && onOfficeChange) {
      onOfficeChange(value);
      setForm(f => ({ ...f, unit_id: '' }));
    }
  };

  const handleClientTypeChange = (clientTypeId) => {
    setSelectedClientTypes(prev =>
      prev.includes(clientTypeId)
        ? prev.filter(id => id !== clientTypeId)
        : [...prev, clientTypeId]
    );
  };

  const handleAddOffice = () => {
    const availableOffices = offices.filter(o => !selectedOffices.find(so => so.office_id === o.office_id));
    if (availableOffices.length === 0) return;
    setSelectedOffices(prev => [
      ...prev,
      { office_id: availableOffices[0].office_id, is_process_owner: false }
    ]);
  };

  const handleRemoveOffice = (officeId) => {
    const remaining = selectedOffices.filter(o => o.office_id !== officeId);
    // Ensure at least one office exists and one process owner
    if (remaining.length === 0) return;
    const hasProcessOwner = remaining.some(o => o.is_process_owner);
    if (!hasProcessOwner) {
      remaining[0].is_process_owner = true;
    }
    setSelectedOffices(remaining);
  };

  const handleProcessOwnerChange = (officeId) => {
    setSelectedOffices(prev => prev.map(o => ({
      ...o,
      is_process_owner: o.office_id === officeId
    })));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (selectedOffices.length === 0) {
      setError('At least one office must be selected');
      return;
    }
    const processOwners = selectedOffices.filter(o => o.is_process_owner);
    if (processOwners.length !== 1) {
      setError('Exactly one office must be designated as process owner');
      return;
    }
    setError(null);
    onSubmit({ ...form, client_types: selectedClientTypes, office_associations: selectedOffices });
  };

  const availableOffices = offices.filter(o => !selectedOffices.find(so => so.office_id === o.office_id));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <label className="block font-medium mb-1">Service Name</label>
        <Input name="service_name" value={form.service_name} onChange={handleChange} required disabled={loading} />
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" rows={3} disabled={loading} />
      </div>
      <div>
        <label className="block font-medium mb-1">Service Type</label>
        <select name="service_type_id" value={form.service_type_id ?? ""} onChange={handleChange} required disabled={loading} className="w-full border rounded p-2">
          <option value="">Select type</option>
          {serviceTypes.map(type => (
            <option key={type.service_type_id} value={type.service_type_id}>{type.service_type_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Unit</label>
        <select name="unit_id" value={form.unit_id ?? ""} onChange={handleChange} disabled={loading} className="w-full border rounded p-2">
          <option value="">Select unit</option>
          {units.map(unit => (
            <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Office Associations</label>
        <div className="space-y-2">
          {selectedOffices.map((assoc) => {
            const office = offices.find(o => o.office_id === assoc.office_id);
            return (
              <div key={assoc.office_id} className="flex items-center gap-2 p-2 border rounded">
                <span className="flex-1">{office?.office_name || 'Unknown Office'}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {office?.office_category || 'main'}
                </Badge>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="process_owner"
                    checked={assoc.is_process_owner}
                    onChange={() => handleProcessOwnerChange(assoc.office_id)}
                    disabled={loading}
                  />
                  Process Owner
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveOffice(assoc.office_id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          {availableOffices.length > 0 && (
            <div className="flex gap-2">
              <select
                value={availableOffices[0]?.office_id || ''}
                onChange={(e) => {
                  const officeId = parseInt(e.target.value);
                  if (!selectedOffices.find(o => o.office_id === officeId)) {
                    setSelectedOffices(prev => [...prev, { office_id: officeId, is_process_owner: false }]);
                  }
                }}
                disabled={loading}
                className="flex-1 border rounded p-2"
              >
                <option value="">Select office to add</option>
               {availableOffices.map(office => (
                 <option key={office.office_id} value={office.office_id}>
                   {office.office_name} ({office.office_category})
                 </option>
               ))}
              </select>
              <Button type="button" size="sm" onClick={handleAddOffice} disabled={loading}>
                <Plus size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1">Client Types</label>
        <div className="flex flex-wrap gap-4">
          {clientTypes.map(type => (
            <label key={type.client_type_id} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={type.client_type_id}
                checked={selectedClientTypes.includes(type.client_type_id)}
                onChange={() => handleClientTypeChange(type.client_type_id)}
                disabled={loading}
              />
              {type.client_type_name.charAt(0).toUpperCase() + type.client_type_name.slice(1)}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}