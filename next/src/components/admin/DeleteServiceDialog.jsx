"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Assuming you have these ShadCN components

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Service</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the service "<b>{serviceName}</b>"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
