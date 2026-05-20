"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OfficesTable({ offices, onEdit, onDelete, onActivate }) {
  if (!offices || offices.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No offices found.</p>
      </div>
    );
  }

  const categoryBadgeVariant = (category) => {
    return category === 'main' ? 'default' : 'secondary';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offices.map((office, index) => (
              <tr 
                key={office.office_id} 
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {office.office_name}
                  {office.is_archived && (
                    <span className="ml-2 inline-flex">
                      <Badge className="text-xs border bg-amber-100 text-amber-800 border-amber-200">
                        Archived
                      </Badge>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Badge variant={categoryBadgeVariant(office.office_category)}>
                    {office.office_category === 'main' ? 'Main Office' : 'Branch Office'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {office.office_type_name || office.office_type_id || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(office)}>Edit</Button>
                  {office.is_archived ? (
                    <Button size="sm" variant="outline" onClick={() => onActivate(office)}>
                      Activate
                    </Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => onDelete(office)}>
                      Archive
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
