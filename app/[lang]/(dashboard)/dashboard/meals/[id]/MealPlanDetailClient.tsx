"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Flame, 
  Dna, 
  Wheat, 
  Droplets,
  UtensilsCrossed,
  ShoppingCart
} from "lucide-react";

let supabaseInstance: any;
const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseInstance;
};

export default function MealPlanDetailClient({ dict, lang }: { dict: any, lang: string }) {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const supabase = getSupabase();
  const t = dict.mealDetail;
  
  const [meal, setMeal] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealDetail = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const { data: mealData, error: mealError } = await supabase
          .from("meals")
          .select("*")
          .eq("id", id)
          .single();

        if (mealError || !mealData) {
          setError(t.notFound);
          return;
        }

        const ingredientIds = mealData.ingredients?.map(Number).filter(Boolean) || [];

        if (ingredientIds.length > 0) {
          const { data: ingredientsData, error: ingError } = await supabase
            .from("meal_ingredients")
            .select(`
              amount,
              measure,
              ingredients (
                name,
                field_media_image,
                field_calories_per_100g_kcal,
                field_protein_per_100g_g,
                field_carbs_per_100g_g,
                field_fat_per_100g_g
              )
            `)
            .in("id", ingredientIds);

          if (!ingError && ingredientsData) {
            const formatted = ingredientsData.map((item: any) => ({
              amount: item.amount,
              measure: item.measure,
              ingredients: Array.isArray(item.ingredients) ? item.ingredients[0] : item.ingredients
            }));
            setMeal({ ...mealData, meal_ingredients: formatted });
          } else {
            setMeal(mealData);
          }
        } else {
          setMeal(mealData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetail();
  }, [id, t.notFound]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="h-12 w-12 border-t-2 border-orange-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !meal) return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 italic uppercase">{error}</h2>
      <button onClick={() => router.push(`/${lang}/dashboard`)} className="text-orange-500 underline uppercase text-[10px] font-black tracking-widest">
        {t.returnButton}
      </button>
    </div>
  );

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="flex-1 overflow-y-auto">
        <div className="relative h-[45vh] w-full">
          <img 
            src={meal.picture_url || "/api/placeholder/800/400"} 
            className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-700" 
            alt={meal.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          <button 
            onClick={() => router.back()}
            className="absolute top-8 left-8 bg-black/40 backdrop-blur-xl p-3 rounded-full hover:bg-orange-600 transition-all border border-white/10"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-8 -mt-40 relative z-10 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
            <div className="lg:col-span-2 space-y-10">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-7xl font-black text-white mb-6 tracking-tighter leading-none uppercase italic">{meal.name}</h1>
              </motion.div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label={t.calories} val={meal.total_calories} icon={<Flame size={18} />} color="text-orange-500" />
                <StatCard label={t.protein} val={meal.total_protein} icon={<Dna size={18} />} color="text-blue-500" />
                <StatCard label={t.carbs} val={meal.total_carbs} icon={<Wheat size={18} />} color="text-emerald-500" />
                <StatCard label={t.fat} val={meal.total_fat} icon={<Droplets size={18} />} color="text-pink-500" />
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-4 uppercase tracking-tighter italic">
                  <UtensilsCrossed className="text-orange-600" size={28} /> {t.preparation}
                </h2>
                <div className="text-slate-400 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                  {meal.recipe || t.noInstructions}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 sticky top-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingCart size={20} className="text-orange-500" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t.ingredientsTitle}</h3>
                </div>
                <div className="space-y-6">
                  {meal.meal_ingredients && meal.meal_ingredients.length > 0 ? (
                    meal.meal_ingredients.map((mi: any, idx: number) => (
                      <div key={idx} className="flex gap-4 items-center border-b border-white/5 pb-4 last:border-0 group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/10 flex-shrink-0">
                          <img 
                            src={mi.ingredients?.field_media_image || "/api/placeholder/48/48"} 
                            alt=""
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm leading-tight group-hover:text-orange-500 transition-colors">
                            {mi.ingredients?.name || t.unidentifiedResource}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase font-black mt-1 tracking-widest">
                            {mi.amount} {mi.measure}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-600 text-xs italic uppercase tracking-widest text-center py-10">{t.noData}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, val, icon, color }: { label: string, val: number, icon: any, color: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all text-left">
      <div className={`${color} mb-3`}>{icon}</div>
      <div className="text-3xl font-black text-white">{Number(val || 0).toFixed(0)}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}