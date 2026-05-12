"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';

export default function ServicesTable({ services, onEdit, onDelete }) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No services found.</p>
      </div>
    );
  }

  const getCategoryLabel = (category) => {
    if (category === 'main') return 'Main';
    if (category === 'branch') return 'Branch';
    if (category === 'unit') return 'Unit';
    return category || 'Office';
  };

  const getCategoryClass = (category) => {
    if (category === 'main') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (category === 'branch') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (category === 'unit') return 'bg-violet-100 text-violet-700 border-violet-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[21%] px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
              <th className="w-[34%] px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="w-[12%] px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="w-[21%] px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Offices</th>
              <th className="w-[12%] px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service, index) => {
              const officeAssocs = Array.isArray(service.office_associations) ? service.office_associations : [];
              return (
                <tr 
                  key={service.service_id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}
                >
                  <td className="px-5 py-4 align-top">
                    <div className="text-sm font-semibold text-gray-800 leading-5 break-words">
                      {service.service_name || '-'}
                    </div>
                    {service.unit_name && (
                      <div className="mt-1 text-xs text-gray-500">Unit: {service.unit_name}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="text-sm text-gray-600 leading-5 whitespace-normal break-words">
                      {service.description || '-'}
                    </p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className="inline-flex rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
                      {service.service_type_name || '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {officeAssocs.map(assoc => (
                        <span key={assoc.office_id} className="inline-flex flex-wrap items-center gap-1.5 text-sm text-gray-700">
                          <span className="font-medium">{assoc.office_name}</span>
                          {assoc.office_category && (
                            <Badge className={`text-xs border ${getCategoryClass(assoc.office_category)}`}>
                              {getCategoryLabel(assoc.office_category)}
                            </Badge>
                          )}
                          {assoc.is_process_owner && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded border border-blue-200">Owner</span>
                          )}
                        </span>
                      ))}
                      {officeAssocs.length === 0 && <span className="text-sm text-gray-400">-</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(service)} className="h-8 px-2.5">
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(service)} className="h-8 px-2.5">
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
