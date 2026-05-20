"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

export default function DeleteServiceDialog({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
  isLoading,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md rounded-xl border border-gray-200 p-0 shadow-xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">Archive Service</DialogTitle>
          <DialogDescription>
            Are you sure you want to archive the service "<b>{serviceName}</b>"? Existing responses will remain available.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-t border-gray-100 px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Archiving...' : 'Archive'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
