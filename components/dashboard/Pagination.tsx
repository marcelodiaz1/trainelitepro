import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  label?: string; // e.g., "TRAINEES" or "TRAINERS"
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  label = "RECORDS"
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  // Calculate the range (e.g., 1-10)
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 px-2 text-slate-500">
      {/* Dynamic Labeling */}
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase">
        INDEXing {start} — {end} OF {totalItems} {label}
      </p>

      <div className="flex gap-2">
        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 bg-[#111] border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        
        {/* Page Indicator */}
        <div className="flex items-center px-5 bg-[#111] border border-slate-800 rounded-xl text-[11px] font-black text-slate-200 tracking-[0.3em]">
          {currentPage} / {totalPages}
        </div>

        {/* Next Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 bg-[#111] border border-slate-800 rounded-xl hover:bg-slate-800 hover:border-slate-700 disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}