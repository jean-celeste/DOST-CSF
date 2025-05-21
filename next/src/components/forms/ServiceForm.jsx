import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ServiceForm({ initialValues = {}, onSubmit, onCancel, loading, offices = [], serviceTypes = [], units = [], onOfficeChange }) {
  const [form, setForm] = useState({
    service_name: '',
    description: '',
    service_type_id: '',
    office_id: '',
    unit_id: '',
    ...initialValues,
  });
  const [error, setError] = useState(null);

  // Update form when initialValues change (for edit)
  useEffect(() => {
    setForm(f => ({ ...f, ...initialValues }));
  }, [initialValues]);

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (name === 'office_id' && onOfficeChange) {
      onOfficeChange(value);
      setForm(f => ({ ...f, unit_id: '' })); // Reset unit when office changes
    }
  };

  // Handle submit
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

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
        <select name="service_type_id" value={form.service_type_id} onChange={handleChange} required disabled={loading} className="w-full border rounded p-2">
          <option value="">Select type</option>
          {serviceTypes.map(type => (
            <option key={type.service_type_id} value={type.service_type_id}>{type.service_type_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Office</label>
        <select name="office_id" value={form.office_id} onChange={handleChange} required disabled={loading} className="w-full border rounded p-2">
          <option value="">Select office</option>
          {offices.map(office => (
            <option key={office.office_id} value={office.office_id}>{office.office_name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Unit</label>
        <select name="unit_id" value={form.unit_id} onChange={handleChange} disabled={loading || !form.office_id} className="w-full border rounded p-2">
          <option value="">{form.office_id ? 'Select unit' : 'Select office first'}</option>
          {units.map(unit => (
            <option key={unit.unit_id} value={unit.unit_id}>{unit.unit_name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
} 