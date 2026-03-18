"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import IngredientForm from "@/components/dashboard/IngredientForm";
import { Apple } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditIngredient() {
  const { id } = useParams();
  const [ingredient, setIngredient] = useState(null);

  useEffect(() => {
    const fetchIngredient = async () => {
      const { data } = await supabase.from("ingredients").select("*").eq("id", id).single();
      if (data) setIngredient(data);
    };
    fetchIngredient();
  }, [id]);

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      
      <div className="p-12 flex-1">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
            <Apple className="text-orange-500" /> Edit Ingredient
          </h1>
        </div>
        {ingredient ? (
          <IngredientForm initialData={ingredient} isEditing />
        ) : (
          <div className="text-slate-500 animate-pulse">Loading ingredient data...</div>
        )}
      </div>
    </main>
  );
}