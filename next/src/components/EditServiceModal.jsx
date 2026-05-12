"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 p-0 shadow-xl">
        {title && (
          <DialogHeader className="border-b border-gray-100 px-6 py-4">
            <DialogTitle className="text-xl font-semibold text-gray-900">{title}</DialogTitle>
          </DialogHeader>
        )}
        <div className="px-6 py-5">{children}</div>
      </DialogContent>
    </Dialog>
  );
} 