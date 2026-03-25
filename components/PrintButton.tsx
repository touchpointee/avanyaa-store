'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <div className="fixed top-5 right-5 no-print z-50">
      <button 
        onClick={() => {
          setTimeout(() => {
            window.print();
          }, 100);
        }} 
        className="bg-primary text-primary-foreground shadow-lg px-6 py-3 rounded-full flex items-center gap-2 hover:bg-primary/90 transition-all font-semibold"
      >
        <Printer className="h-5 w-5" />
        Print / Download PDF
      </button>
    </div>
  );
}
