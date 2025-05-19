"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

export default function ServicesTable({ services, onEdit, onDelete }) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No services found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Office</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service, index) => (
              <tr 
                key={service.service_id} 
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.service_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.service_type_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.office_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{service.unit_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(service)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(service)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
