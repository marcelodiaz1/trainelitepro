import Sidebar from "@/components/dashboard/Sidebar";
import IngredientForm from "@/components/dashboard/IngredientForm";
import { Apple } from "lucide-react";

export default function NewIngredient() {
  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      
      <div className="p-12 flex-1">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
            <Apple className="text-orange-500" /> New Ingredient
          </h1>
          <p className="text-slate-500 text-sm">Add a new item to the master nutrition database.</p>
        </div>
        <IngredientForm />
      </div>
    </main>
  );
}