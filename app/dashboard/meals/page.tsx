"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  MoreVertical, 
  Search, 
  Plus, 
  ChefHat, 
  Utensils,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Flame,
  Dna,
  Edit2,
  Trash2,
  Eye,
  X,
  Salad
} from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";

// Supabase Initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Types
interface IngredientDetails {
  name: string;
  field_calories_per_100g_kcal: number;
  field_protein_per_100g_g: number;
  field_carbs_per_100g_g: number;
  field_fat_per_100g_g: number;
  field_dietary_restrictions_ethic: string | null;
  field_dietary_restrictions_medic: string | null;
  field_dietary_restrictions_relig: string | null;
}

interface MealIngredient {
  id: number;
  amount: number;
  measure: string;
  ingredients: IngredientDetails;
}

interface Meal {
  id: number;
  name: string;
  picture_url: string;
  recipe: string;
  ingredients: number[]; 
  meal_ingredients?: MealIngredient[]; 
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFullMealData = async () => {
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // 1. Fetch meals
      const { data: mealsData, error: mealsError, count } = await supabase
        .from("meals")
        .select("*", { count: "exact" })
        .ilike('name', `%${searchTerm}%`)
        .range(from, to)
        .order('id', { ascending: false });

      if (mealsError || !mealsData) {
        console.error("Error fetching meals:", mealsError);
        setLoading(false);
        return;
      }

      // 2. Map ingredient relationship IDs
      const allIngredientRelIds = Array.from(
        new Set(mealsData.flatMap((m: Meal) => m.ingredients || []))
      );

      let ingredientLookup: Record<number, MealIngredient> = {};

      // 3. Fetch detailed ingredient data
      if (allIngredientRelIds.length > 0) {
        const { data: relData, error: relError } = await supabase
          .from("meal_ingredients")
          .select(`
            id, amount, measure,
            ingredients (
              name,
              field_calories_per_100g_kcal,
              field_protein_per_100g_g,
              field_carbs_per_100g_g,
              field_fat_per_100g_g,
              field_dietary_restrictions_ethic,
              field_dietary_restrictions_medic,
              field_dietary_restrictions_relig
            )
          `)
          .in("id", allIngredientRelIds);

        if (!relError && relData) {
          relData.forEach((item: any) => {
            ingredientLookup[item.id] = item;
          });
        }
      }

      // 4. Combine data for the state
      const finalMeals = mealsData.map((meal: Meal) => ({
        ...meal,
        meal_ingredients: (meal.ingredients || [])
          .map(id => ingredientLookup[id])
          .filter(Boolean)
      }));

      setMeals(finalMeals);
      setTotal(count || 0);
      setLoading(false);
    };

    fetchFullMealData();
  }, [page, searchTerm, pageSize]);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this meal from the database?")) return;
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (!error) {
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => prev - 1);
    }
    setDropdownOpen(null);
  };

  const getMealStats = (mealIngredients: MealIngredient[] = []) => {
    let totals = { cal: 0, pro: 0, carb: 0, fat: 0 };
    let restrictionsSet = new Set<string>();

    mealIngredients.forEach((mi) => {
      const ing = mi.ingredients;
      if (!ing) return;
      
      const multiplier = mi.amount / 100;
      totals.cal += (ing.field_calories_per_100g_kcal || 0) * multiplier;
      totals.pro += (ing.field_protein_per_100g_g || 0) * multiplier;
      totals.carb += (ing.field_carbs_per_100g_g || 0) * multiplier;
      totals.fat += (ing.field_fat_per_100g_g || 0) * multiplier;

      [ing.field_dietary_restrictions_ethic, ing.field_dietary_restrictions_medic, ing.field_dietary_restrictions_relig]
        .forEach(r => { if (r) restrictionsSet.add(r); });
    });

    return {
      calories: Math.round(totals.cal),
      protein: totals.pro.toFixed(1),
      carbs: totals.carb.toFixed(1),
      fat: totals.fat.toFixed(1),
      restrictions: Array.from(restrictionsSet)
    };
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
     <main className="bg-[#0b0b0b] text-white min-h-screen flex">
        
        <div className="p-8 flex-1 max-w-1xl   w-full">  
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <Salad className="text-orange-500" />Meal Planner</h1>
            <p className="text-slate-500 text-sm">Calculated nutrition and restriction monitoring.</p>
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
            
            <Link href="/dashboard/meals/new">
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                <Salad size={16} /> Add Meal  
              </button>
            </Link> 
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="h-10 w-10 border-b-2 border-orange-500 rounded-full animate-spin mb-4" />
            <p className="tracking-widest text-[10px] text-slate-500 animate-pulse">LOADING MEAL PLANS</p>
          </div>
        ) : meals.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-2xl p-20 text-center text-slate-500">
            <p className="uppercase italic tracking-widest text-xs">No matching recipes found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {meals.map((meal) => {
                const stats = getMealStats(meal.meal_ingredients);
                
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={meal.id} 
                    className="bg-[#111] border border-slate-800 rounded-2xl overflow-visible group hover:border-orange-500/30 transition-all shadow-2xl relative"
                  >
                    {/* Restriction Alert 
                    {stats.restrictions.length > 0 && (
                      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1 max-w-[150px]">
                        {stats.restrictions.map((res, i) => (
                          <div key={i} className="flex items-center gap-1 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 text-amber-500 px-2 py-1 rounded-lg text-[8px] font-black uppercase">
                            <AlertTriangle size={10} /> {res}
                          </div>
                        ))}
                      </div>
                    )}
*/}
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Image container with localized rounding */}
                      <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-slate-900 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
                        <img 
                          src={meal.picture_url} 
                          alt={meal.name}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      </div>

                      <div className="flex-1 p-6 flex flex-col relative">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors uppercase italic tracking-tighter">{meal.name}</h3>
                            <div className="flex gap-4 mt-2">
                              <div className="flex items-center gap-1 text-orange-400">
                                <Flame size={12} />
                                <span className="text-[10px] font-bold uppercase">{stats.calories} kcal</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-400">
                                <Dna size={12} />
                                <span className="text-[10px] font-bold uppercase">{stats.protein}g Pro</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Dropdown Logic */}
                          <div className="relative">
                            <button 
                              onClick={() => setDropdownOpen(dropdownOpen === meal.id ? null : meal.id)}
                              className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
                            >
                              <MoreVertical size={18} />
                            </button>

                            <AnimatePresence>
                              {dropdownOpen === meal.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden text-left"
                                  >
                                    <Link href={`/dashboard/meals/${meal.id}`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors text-slate-300">
                                      <Eye size={14} className="text-orange-400" /> View Recipe
                                    </Link>
                                    <Link href={`/dashboard/meals/${meal.id}/edit`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors text-slate-300">
                                     
                                         <Edit2 size={14} className="text-blue-400" /> Edit Meal
                                     
                                    </Link> 
                                    <button
                                      onClick={() => handleDelete(meal.id)}
                                      className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 border-t border-slate-800 transition-colors"
                                    >
                                      <Trash2 size={14} /> Delete Recipe
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="mb-6 flex-1">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Utensils size={10} /> Ingredient Mix
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.meal_ingredients?.map((mi, idx) => (
                              <span key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-400">
                                <span className="text-orange-500/80 font-bold">{mi.amount}{mi.measure}</span> {mi.ingredients.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center">
                          <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase">
                            <span>Carbs: {stats.carbs}g</span>
                            <span>Fat: {stats.fat}g</span>
                          </div>
                          <Link href={`/dashboard/meals/${meal.id}`}>
                            <button className="text-[10px] font-black uppercase text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 group/btn">
                              Full Recipe <ChefHat size={14} className="group-hover/btn:rotate-12 transition-transform" />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

         
                           <Pagination 
                            currentPage={page}
                            totalItems={total}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            label="Meals"
                            />
          </>
        )}
      </div>
    </main>
  );
}