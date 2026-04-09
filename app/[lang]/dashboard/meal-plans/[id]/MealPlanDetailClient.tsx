"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Clock, LayoutGrid,
  ChevronRight, TrendingUp, Flame, Dna
} from "lucide-react";
import Link from "next/link";

// Singleton Supabase Pattern
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
  const { id } = useParams();
  const router = useRouter();
  const supabase = getSupabase();
  const t = dict.mealPlanDetail;
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const { data: planData } = await supabase
          .from("meal_plans")
          .select(`*, trainer:trainer_id(*), trainee:trainee_id(*)`)
          .eq("id", id)
          .single();

        if (planData) setPlan(planData);
      } catch (err) {
        console.error("Meal plan Fetch Failure:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [id, supabase]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="h-10 w-10 border-t-2 border-orange-500 rounded-full animate-spin" />
    </div>
  );

  if (!plan) return <div className="text-white p-20 text-center font-black uppercase tracking-widest">{t.notFound}</div>;

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
        {/* Header Section */}
        <div className="p-8 border-b border-white/5 bg-[#0a0a0a]">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest mb-8">
            <ChevronLeft size={14} /> {t.back}
          </button>
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-orange-500 text-[10px] font-black px-3 py-1 rounded-full text-black uppercase tracking-tighter">{t.activeTag}</span>
              </div>
              <h1 className="text-6xl font-black text-white tracking-tighter mb-4 leading-none uppercase italic">{plan.title}</h1>
              <div className="flex gap-4">
                <Badge icon={<Clock size={12}/>} label={plan.duration} />
                <Badge icon={<LayoutGrid size={12}/>} label={`${plan.schedule?.length || 0} ${t.dayView}`} />
                <Badge icon={<TrendingUp size={12}/>} label={t.statusLabel} />
              </div>
            </div>

            <div className="flex items-center gap-8 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
               <UserAvatar label={t.coach} name={`${plan.trainer?.first_name || 'N/A'} ${plan.trainer?.last_name || ''}`} img={plan.trainer?.profile_picture} />
               <div className="w-[1px] h-10 bg-white/10" />
               <UserAvatar label={t.athlete} name={`${plan.trainee?.first_name || 'N/A'} ${plan.trainee?.last_name || ''}`} img={plan.trainee?.profile_picture} />
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="p-8 max-w-[1600px] mx-auto">
            <SectionTitle title={t.sectionTitle} color="orange" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plan.schedule.map((dayData: any, idx: number) => {
                const dayTotalCals = dayData.meals.reduce(
                    (sum: number, m: any) => sum + (m.calories || 0), 
                    0
                );

                // Map the English database string (e.g., "Monday") to your dictionary
                // Fallback to dayData.day if the key doesn't exist in the JSON
                const translatedDay = dict.days?.[dayData.day] || dayData.day;

                return (
                    <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-[#0e0e0e] border border-white/5 rounded-[2.5rem] overflow-hidden group"
                    >
                    <div className="bg-white/5 p-4 border-b border-white/5 text-orange-500 font-black uppercase text-[10px] tracking-[0.2em] flex justify-between items-center">
                        {/* Displaying the translated day */}
                        <span>{translatedDay}</span>
                        <span className="text-slate-500 text-[9px]">{dayTotalCals} kcal</span>
                    </div>
                    <div className="p-5 space-y-3">
                        {dayData.meals.length > 0 ? (
                        dayData.meals.map((meal: any, mIdx: number) => (
                            <MealSlot 
                            key={meal.instanceId || mIdx} 
                            mealId={meal.id} 
                            mealData={meal} 
                            lang={lang}
                            />
                        ))
                        ) : (
                        <p className="text-[9px] text-slate-700 uppercase font-bold text-center py-4">
                            {t.noMeals}
                        </p>
                        )}
                    </div>
                    </motion.div>
                );
                })}
            </div>
            </div>
      </div>
    </main>
  );
}

// --- Internal UI Components ---

function UserAvatar({ label, name, img }: { label: string, name: string, img: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-slate-900">
        <img src={img || "https://via.placeholder.com/40"} className="w-full h-full object-cover" alt="" />
      </div>
      <div className="text-left">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-white leading-none truncate max-w-[120px]">{name}</p>
      </div>
    </div>
  );
}

function SectionTitle({ title, color }: { title: string, color: string }) {
  const colorMap: any = { orange: "bg-orange-500" };
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className={`w-8 h-[2px] ${colorMap[color]}`} />
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{title}</h2>
    </div>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
      {icon} {label}
    </span>
  );
}

function MealSlot({ mealId, mealData, lang }: { mealId: number; mealData: any; lang: string }) {
  return (
    <Link href={`/${lang}/dashboard/meals/${mealId}`}>
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-3 flex items-center gap-3 hover:bg-white/[0.05] hover:border-orange-500/30 transition-all cursor-pointer group/slot">
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-bold text-slate-200 truncate group-hover/slot:text-orange-400 transition-colors">
            {mealData.title}
          </p>
          <div className="flex gap-3 mt-1">
            <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1">
               <Flame size={10} className="text-orange-600"/> {mealData.calories}
            </span>
            <span className="text-[9px] font-bold text-slate-600 flex items-center gap-1">
               <Dna size={10} className="text-blue-600"/> {mealData.protein}g
            </span>
          </div>
        </div>
        <ChevronRight size={14} className="text-slate-800 group-hover/slot:text-orange-500 transition-colors" />
      </div>
    </Link>
  );
}