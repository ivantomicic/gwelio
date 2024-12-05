import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteMatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteMatchDialog({ isOpen, onClose, onConfirm, isDeleting }: DeleteMatchDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        {/* Dialog */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
            Izbriši meč
          </h3>
          
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Da li ste sigurni da želite da izbrišete ovaj meč? Ova akcija se ne može poništiti.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Odustani
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Brisanje...' : 'Izbriši'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}