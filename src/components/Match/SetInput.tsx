import React from 'react';
import { Set } from '../../types';
import { X } from 'lucide-react';

interface SetInputProps {
  index: number;
  set: Set;
  onChange: (index: number, set: Set) => void;
  onRemove: (index: number) => void;
  opponentName: string;
  showRemoveButton: boolean;
}

export function SetInput({ index, set, onChange, onRemove, opponentName, showRemoveButton }: SetInputProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500 w-16">Set {index + 1}</span>
      <div className="flex-1 grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          max="99"
          value={set.player1Score}
          onChange={(e) => onChange(index, { ...set, player1Score: parseInt(e.target.value) || 0 })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-center"
          required
        />
        <input
          type="number"
          min="0"
          max="99"
          value={set.player2Score}
          onChange={(e) => onChange(index, { ...set, player2Score: parseInt(e.target.value) || 0 })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-center"
          required
        />
      </div>
      {showRemoveButton && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-gray-400 hover:text-red-500"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}