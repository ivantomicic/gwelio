import React from 'react';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">{title}</h2>
      {children}
    </div>
  );
}