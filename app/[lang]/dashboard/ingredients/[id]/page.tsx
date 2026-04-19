"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "@/components/dashboard/Sidebar";
import { Apple, FlaskConical, Activity, Leaf, Church } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Ingredient {
  id: number;
  name: string;
  field_category: number | null;
  field_calories_per_100g_kcal: number;
  field_protein_per_100g_g: number;
  field_carbs_per_100g_g: number;
  field_fat_per_100g_g: number;
  field_dietary_restrictions_ethic: string | null;
  field_dietary_restrictions_medic: string | null;
  field_dietary_restrictions_relig: string | null;
  field_media_image: string | null;
}

export default function IngredientDetailPage() {
  const params = useParams();
  const id = params.id;

  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  const [ethicMap, setEthicMap] = useState<Record<number, string>>({});
  const [medicMap, setMedicMap] = useState<Record<number, string>>({});
  const [religMap, setReligMap] = useState<Record<number, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchLookups = async () => {
      const [ethicRes, medicRes, religRes, catRes] = await Promise.all([
        supabase.from("etical_diet").select("id,name"),
        supabase.from("medical_diet").select("id,name"),
        supabase.from("religious_diet").select("id,name"),
        supabase.from("ingred_category").select("id,name"),
      ]);

      const createMap = (data: any[] | null) =>
        (data || []).reduce((acc, item) => {
          acc[item.id] = item.name;
          return acc;
        }, {} as Record<number, string>);

      if (ethicRes.data) setEthicMap(createMap(ethicRes.data));
      if (medicRes.data) setMedicMap(createMap(medicRes.data));
      if (religRes.data) setReligMap(createMap(religRes.data));
      if (catRes.data) setCategoryMap(createMap(catRes.data));
    };

    fetchLookups();
  }, []);

  useEffect(() => {
    const fetchIngredient = async () => {
      const { data } = await supabase
        .from("ingredients")
        .select("*")
        .eq("id", id)
        .single();

      setIngredient(data);
      setLoading(false);
    };

    if (id) fetchIngredient();
  }, [id]);

  const renderBadges = (raw: string | null, map: Record<number, string>, color: string) => {
    if (!raw) return <span className="text-xs text-slate-500">None</span>;

    const ids = raw.split("|").filter(Boolean);

    return (
      <div className="flex flex-wrap gap-2">
        {ids.map((i) => (
          <span
            key={i}
            className={`px-2 py-1 text-[10px] uppercase font-bold border rounded ${color}`}
          >
            {map[Number(i)] || i}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <main className="bg-[#0b0b0b] text-white min-h-screen flex">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-orange-500 rounded-full" />
        </div>
      </main>
    );
  }

  if (!ingredient) return null;

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      

      <div className="flex-1 p-10 max-w-5xl">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          {ingredient.field_media_image ? (
            <img
              src={ingredient.field_media_image}
              className="w-20 h-20 rounded-lg object-cover border border-slate-800"
            />
          ) : (
            <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <FlaskConical className="text-orange-500" size={30} />
            </div>
          )}

          <div>
            <h1 className="text-4xl font-extrabold uppercase italic flex items-center gap-2">
              <Apple className="text-orange-500" /> {ingredient.name}
            </h1>

            <p className="text-slate-500 text-sm mt-1">
              Category:{" "}
              {ingredient.field_category
                ? categoryMap[ingredient.field_category]
                : "Uncategorized"}
            </p>
          </div>
        </div>

        {/* MACROS */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 text-xs uppercase mb-2">Calories</p>
            <p className="text-3xl font-bold text-emerald-400">
              {ingredient.field_calories_per_100g_kcal}
            </p>
            <p className="text-xs text-slate-600">per 100g</p>
          </div>

          <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 text-xs uppercase mb-2">Protein</p>
            <p className="text-3xl font-bold text-blue-400">
              {ingredient.field_protein_per_100g_g}g
            </p>
          </div>

          <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
            <p className="text-slate-500 text-xs uppercase mb-2">Fat</p>
            <p className="text-3xl font-bold text-rose-400">
              {ingredient.field_fat_per_100g_g}g
            </p>
          </div>

        </div>

        {/* DIETARY */}
        <div className="grid grid-cols-3 gap-6">

          <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
            <h3 className="flex items-center gap-2 font-bold mb-4">
              <Leaf size={18} className="text-emerald-400" />
              Ethical Diet
            </h3>

            {renderBadges(
              ingredient.field_dietary_restrictions_ethic,
              ethicMap,
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            )}
          </div>

          <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
            <h3 className="flex items-center gap-2 font-bold mb-4">
              <Activity size={18} className="text-blue-400" />
              Medical Diet
            </h3>

            {renderBadges(
              ingredient.field_dietary_restrictions_medic,
              medicMap,
              "bg-blue-500/10 text-blue-400 border-blue-500/20"
            )}
          </div>

          <div className="bg-[#111] border border-slate-800 rounded-xl p-6">
            <h3 className="flex items-center gap-2 font-bold mb-4">
              <Church size={18} className="text-amber-400" />
              Religious Diet
            </h3>

            {renderBadges(
              ingredient.field_dietary_restrictions_relig,
              religMap,
              "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}
          </div>

        </div>

        {/* ACTIONS */}
        <div className="mt-12 flex gap-4">
          <LocalizedLink href={`/dashboard/ingredients/${ingredient.id}/edit`}>
            <button className="bg-orange-600 hover:bg-orange-500 px-6 py-3 rounded-lg text-xs font-bold uppercase">
              Edit Ingredient
            </button>
          </LocalizedLink>

          <LocalizedLink href="/dashboard/ingredients">
            <button className="border border-slate-700 px-6 py-3 rounded-lg text-xs font-bold uppercase">
              Back
            </button>
          </LocalizedLink>
        </div>

      </div>
    </main>
  );
}