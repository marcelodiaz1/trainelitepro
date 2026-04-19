"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Search, 
  Plus,
  FlaskConical,
  Scale,
  Leaf,
  Activity,
  Church,
  Apple
} from "lucide-react";
import SortableHeader from "@/components/dashboard/SortableHeader";
import Pagination from "@/components/dashboard/Pagination";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Ingredient {
  id: number;
  name: string;
  field_category: number | null; // Add this
  field_calories_per_100g_kcal: number;
  field_protein_per_100g_g: number;
  field_carbs_per_100g_g: number;
  field_fat_per_100g_g: number;
  field_dietary_restrictions_ethic: string | null;
  field_dietary_restrictions_medic: string | null;
  field_dietary_restrictions_relig: string | null;
  field_media_image: string | null;
}

// Inside your IngredientsPage component:

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  // Maps to store { id: "Name" } for quick translation
  const [ethicMap, setEthicMap] = useState<Record<number, string>>({});
  const [medicMap, setMedicMap] = useState<Record<number, string>>({});
  const [religMap, setReligMap] = useState<Record<number, string>>({});

  const [categoryMap, setCategoryMap] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Ingredient>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // 1. Fetch Dietary Table Names on Load
useEffect(() => {
  const fetchLookups = async () => {
    const [ethicRes, medicRes, religRes, catRes] = await Promise.all([
      supabase.from("etical_diet").select("id, name"),
      supabase.from("medical_diet").select("id, name"),
      supabase.from("religious_diet").select("id, name"),
      supabase.from("ingred_category").select("id, name"), // New table
    ]);

    const createMap = (data: any[] | null) => 
      (data || []).reduce((acc, item) => ({ ...acc, [item.id]: item.name }), {});

    if (ethicRes.data) setEthicMap(createMap(ethicRes.data));
    if (medicRes.data) setMedicMap(createMap(medicRes.data));
    if (religRes.data) setReligMap(createMap(religRes.data));
    if (catRes.data) setCategoryMap(createMap(catRes.data)); // Set the category map
  };

  fetchLookups();
}, []);

  // 2. Fetch Ingredients Data
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("ingredients")
        .select("*", { count: "exact" })
        .order(sortColumn, { ascending: sortOrder === "asc" })
        .range(from, to);

      if (!error && data) {
        setIngredients(data as Ingredient[]);
        setTotal(count || 0);
      }
      setLoading(false);
    };

    fetchIngredients();
  }, [page, sortColumn, sortOrder]);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this ingredient?")) return;
    const { error } = await supabase.from("ingredients").delete().eq("id", id);
    if (!error) {
      setIngredients((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => prev - 1);
    }
  };

  const handleSort = (column: keyof Ingredient) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Helper to split pipe-separated IDs and return badges
  const renderDietaryBadges = (raw: string | null, map: Record<number, string>, color: string) => {
    if (!raw) return <span className="text-slate-800 text-[10px]">None</span>;
    const ids = raw.split("|").filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1 max-w-[140px]">
        {ids.map(id => (
          <span key={id} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${color}`}>
            {map[Number(id)] || id}
          </span>
        ))}
      </div>
    );
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
           
           <div className="p-8 flex-1 max-w-1xl   w-full">  
    
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <Apple className="text-orange-500" />Ingredients</h1>
            <p className="text-slate-500 text-sm">Ingredient database with cross-referenced dietary classifications.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
           
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder="Search meals..." 
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div> 
            
            <LocalizedLink href="/dashboard/ingredients/new">
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                <Apple size={16} /> Add Ingredient
              </button>
            </LocalizedLink>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <div className="h-10 w-10 border-b-2 border-emerald-500 rounded-full animate-spin mb-4" />
            <p className="animate-pulse font-medium tracking-widest text-[10px]">SYNCING DATABASE</p>
          </div>
        ) : (
          <>
            <div className="bg-[#111] border border-slate-800 rounded-2xl shadow-2xl overflow-visible backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616]/50 border-b border-slate-800 text-white">
                    <SortableHeader onClick={() => handleSort("name")} label="Ingredient" active={sortColumn === "name"} />
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-left">Category</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-left">Ethical</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-left">Medical</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-left"> Religious</th>
                    <SortableHeader onClick={() => handleSort("field_calories_per_100g_kcal")} label="Macros / 100g" active={sortColumn === "field_calories_per_100g_kcal"} center />
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {ingredients.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <LocalizedLink
                          href={`/dashboard/ingredients/${item.id}`}
                          className="flex items-center gap-3 group"
                        >
                          {item.field_media_image ? (
                            <img
                              src={item.field_media_image}
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover border border-slate-800"
                            />
                          ) : (
                            <div className="p-2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <FlaskConical size={14} />
                            </div>
                          )}

                          <span className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                            {item.name}
                          </span>
                        </LocalizedLink>
                      </td>
                      <td className="px-6 py-4">
                        {item.field_category ? (
                          <span className="text-[10px] font-bold py-1 px-2 bg-slate-800 rounded-md text-slate-300 border border-slate-700 uppercase">
                            {categoryMap[item.field_category] || "Other"}
                          </span>
                        ) : (
                          <span className="text-slate-700 text-[10px]">Uncategorized</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {renderDietaryBadges(item.field_dietary_restrictions_ethic, ethicMap, "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}
                      </td>
                      <td className="px-4 py-4">
                        {renderDietaryBadges(item.field_dietary_restrictions_medic, medicMap, "bg-blue-500/10 text-blue-400 border-blue-500/20")}
                      </td>
                      <td className="px-4 py-4">
                        {renderDietaryBadges(item.field_dietary_restrictions_relig, religMap, "bg-amber-500/10 text-amber-400 border-amber-500/20")}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-emerald-400 font-mono font-bold text-xs">{item.field_calories_per_100g_kcal} <span className="text-[10px] opacity-40">KCAL</span></span>
                          <div className="flex gap-3">
                            <span className="text-[9px] font-bold text-blue-500">P {item.field_protein_per_100g_g}g</span>
                            <span className="text-[9px] font-bold text-rose-500">F {item.field_fat_per_100g_g}g</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)} className="p-2 text-slate-500 hover:text-white"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                          {dropdownOpen === item.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-6 mt-2 w-40 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                                
                              <LocalizedLink href={`/dashboard/ingredients/${item.id}/edit`}>
                                <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800/50">
                                  <Edit2 size={14} className="text-slate-400" /> Edit  
                                </button>
                              </LocalizedLink>

                                <button onClick={() => handleDelete(item.id)} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 transition-colors"><Trash2 size={14} /> Delete</button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
 
                            <Pagination 
                             currentPage={page}
                             totalItems={total}
                             pageSize={pageSize}
                             onPageChange={setPage}
                             label="Ingredients"
                             />
          </>
        )}
      </div>
    </main>
  );
}
 