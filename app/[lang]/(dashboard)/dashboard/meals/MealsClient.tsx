"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import LocalizedLink from "@/components/LocalizedLink";
import { 
  MoreVertical, Search, ChefHat, Utensils, Flame, Dna,
  Edit2, Trash2, Eye, Salad, Loader2, Lock, Zap
} from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface IngredientDetails {
  name: string;
  field_calories_per_100g_kcal: number;
  field_protein_per_100g_g: number;
  field_carbs_per_100g_g: number;
  field_fat_per_100g_g: number;
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
  trainer_id: string;
  meal_ingredients?: MealIngredient[]; 
}

export default function MealsClient({ dict, lang }: { dict: any; lang: string }) {
  const t = dict?.meals || {};
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isAtLimit, setIsAtLimit] = useState(false);
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFullMealData = async () => {
      try {
        setLoading(true);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data: profile } = await supabase
          .from("users")
          .select("selected_plan")
          .eq("id", authUser.id)
          .single();

        const { data: mealsData, error: mealsError, count } = await supabase
          .from("meals")
          .select("*", { count: "exact" })
          .eq("trainer_id", authUser.id)
          .ilike('name', `%${searchTerm}%`)
          .range(from, to)
          .order('id', { ascending: false });

        if (mealsError || !mealsData) throw mealsError;

        if (profile?.selected_plan) {
          const { data: planData } = await supabase
            .from("plans")
            .select("meal_limit")
            .eq("id", profile.selected_plan)
            .single();

          if (planData) {
            setIsAtLimit((count || 0) >= planData.meal_limit);
          }
        }

        const allIngredientRelIds = Array.from(
          new Set(mealsData.flatMap((m: Meal) => m.ingredients || []))
        );

        let ingredientLookup: Record<number, MealIngredient> = {};

        if (allIngredientRelIds.length > 0) {
          const { data: relData } = await supabase
            .from("meal_ingredients")
            .select(`
              id, amount, measure,
              ingredients (
                name,
                field_calories_per_100g_kcal,
                field_protein_per_100g_g,
                field_carbs_per_100g_g,
                field_fat_per_100g_g
              )
            `)
            .in("id", allIngredientRelIds);

          if (relData) {
            relData.forEach((item: any) => {
              ingredientLookup[item.id] = item;
            });
          }
        }

        const finalMeals = mealsData.map((meal: Meal) => ({
          ...meal,
          meal_ingredients: (meal.ingredients || [])
            .map(id => ingredientLookup[id])
            .filter(Boolean)
        }));

        setMeals(finalMeals);
        setTotal(count || 0);
      } catch (err) {
        console.error("Meal Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFullMealData();
  }, [page, searchTerm, pageSize]);

  const handleDelete = async (id: number) => {
    if (!confirm(t.actions?.deleteConfirm)) return;
    const { error } = await supabase.from("meals").delete().eq("id", id);
    if (!error) {
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => prev - 1);
      setIsAtLimit(false); 
    }
    setDropdownOpen(null);
  };

  const getMealStats = (mealIngredients: MealIngredient[] = []) => {
    let totals = { cal: 0, pro: 0, carb: 0, fat: 0 };
    mealIngredients.forEach((mi) => {
      const ing = mi.ingredients;
      if (!ing) return;
      const multiplier = mi.amount / 100;
      totals.cal += (ing.field_calories_per_100g_kcal || 0) * multiplier;
      totals.pro += (ing.field_protein_per_100g_g || 0) * multiplier;
      totals.carb += (ing.field_carbs_per_100g_g || 0) * multiplier;
      totals.fat += (ing.field_fat_per_100g_g || 0) * multiplier;
    });

    return {
      calories: Math.round(totals.cal),
      protein: totals.pro.toFixed(1),
      carbs: totals.carb.toFixed(1),
      fat: totals.fat.toFixed(1)
    };
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 max-w-7xl mx-auto w-full"> 
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <Salad className="text-orange-500" /> {t.title}
            </h1>
            <p className="text-slate-500 text-sm">
              {isAtLimit ? t.limitReached : t.subtitle}
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder} 
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-orange-500 outline-none transition-all placeholder:text-slate-700 text-white"
              />
            </div> 
            
            {isAtLimit ? (
              <LocalizedLink href={`/${lang}/pricing`}>
                <button className="bg-white/5 border border-white/10 hover:border-orange-500/50 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all group shadow-lg">
                  <Lock size={16} className="text-orange-500" /> 
                  {t.upgrade}
                  <Zap size={14} className="text-orange-500 animate-pulse" />
                </button>
              </LocalizedLink>
            ) : (
              <LocalizedLink href={`/${lang}/dashboard/meals/new`}>
                <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                  <Salad size={16} /> {t.addMeal}
                </button>
              </LocalizedLink>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="tracking-widest text-[10px] uppercase font-bold animate-pulse">{t.syncing}</p>
          </div>
        ) : meals.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-2xl p-20 text-center text-slate-500">
            <p className="uppercase italic tracking-widest text-xs">{t.noResults}</p>
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
                    <div className="flex flex-col sm:flex-row h-full">
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
                                <span className="text-[10px] font-bold uppercase">{stats.calories} {t.stats?.calories}</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-400">
                                <Dna size={12} />
                                <span className="text-[10px] font-bold uppercase">{stats.protein}g {t.stats?.protein}</span>
                              </div>
                            </div>
                          </div>
                          
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
                                    <LocalizedLink href={`/${lang}/dashboard/meals/${meal.id}`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors text-slate-300">
                                      <Eye size={14} className="text-orange-400" /> {t.actions?.view}
                                    </LocalizedLink>
                                    <LocalizedLink href={`/${lang}/dashboard/meals/${meal.id}/edit`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800/50">
                                      <Edit2 size={14} className="text-blue-400" /> {t.actions?.edit}
                                    </LocalizedLink> 
                                    <button
                                      onClick={() => handleDelete(meal.id)}
                                      className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 border-t border-slate-800 transition-colors"
                                    >
                                      <Trash2 size={14} /> {t.actions?.delete}
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="mb-6 flex-1 text-left">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Utensils size={10} /> {t.labels?.ingredientMix}
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
                            <span>{t.stats?.carbs}: {stats.carbs}g</span>
                            <span>{t.stats?.fat}: {stats.fat}g</span>
                          </div>
                          <LocalizedLink href={`/${lang}/dashboard/meals/${meal.id}`}>
                            <button className="text-[10px] font-black uppercase text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 group/btn">
                              {t.labels?.fullRecipe} <ChefHat size={14} className="group-hover/btn:rotate-12 transition-transform" />
                            </button>
                          </LocalizedLink>
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
              label={t.title}
            />
          </>
        )}
      </div>
    </main>
  );
}