import { ArrowUpDown } from "lucide-react";
import { ReactNode } from "react";

interface SortableHeaderProps {
  label: string;
  active: boolean;
  onClick: () => void;
  center?: boolean;
  icon?: ReactNode; // Optional icon (like for the Trainer column)
  variant?: "blue" | "orange"; // Allow switching theme colors
}

export default function SortableHeader({
  label,
  active,
  onClick,
  center = false,
  icon,
  variant = "blue"
}: SortableHeaderProps) {
  
  // Dynamic color logic based on the variant prop
  const activeColor = variant === "orange" ? "text-orange-400" : "text-blue-500";

  return (
    <th
      onClick={onClick}
      className={`px-6 py-4 text-[10px]   uppercase tracking-[0.2em] cursor-pointer select-none transition-colors ${
        active ? activeColor : "text-slate-600 hover:text-slate-200"
      } ${center ? "text-center" : "text-left"}`}
    >
      <div className={`flex items-center gap-2 ${center ? "justify-center" : "justify-start"}`}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{label}</span>
        <ArrowUpDown 
          size={10} 
          className={`transition-opacity ${active ? "opacity-100" : "opacity-20"}`} 
        />
      </div>
    </th>
  );
}