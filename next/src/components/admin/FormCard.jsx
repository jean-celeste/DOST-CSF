"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';

export default function FormCard({ form, onEdit, onDelete, onView, showActions = true }) {
  const getStatusBadgeVariant = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{form.form_title}</CardTitle>
          <Badge variant={getStatusBadgeVariant(form.status_name)}>
            {form.status_name}
          </Badge>
        </div>
        {form.version && form.version > 1 && (
          <Badge variant="outline" className="text-xs">v{form.version}</Badge>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        {form.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No description</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
          <span>Created by: {form.added_by_name || 'Unknown'}</span>
          <span>•</span>
          <span>{form.linked_services?.length || 0} services</span>
          {form.linked_services && form.linked_services.length > 0 && (
            <>
              <span>•</span>
              <div className="flex flex-wrap gap-1">
                {form.linked_services.slice(0, 2).map(ls => (
                  <span key={ls.service_form_id} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                    {ls.service_name}
                  </span>
                ))}
                {form.linked_services.length > 2 && (
                  <span className="text-xs">+{form.linked_services.length - 2} more</span>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="pt-0 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(form)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(form)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(form)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
