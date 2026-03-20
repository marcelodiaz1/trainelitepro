"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  Users, Dumbbell, Activity, UtensilsCrossed, 
  ClipboardList, UserPlus, PlusCircle, Zap, Clock, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- INTERFACES ---
interface TrainerPlan {
  name: string;
  trainee_limit: number;
  routine_limit: number;
  evaluation_limit: number;
  meal_plan_limit: number;
  meal_limit: number;
  plan_limit: number;
}

export default function Dashboard() {
  const [role, setRole] = useState<"admin" | "trainer" | "trainee" | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [traineesData, setTraineesData] = useState<any[]>([]);
  const [trainerPlan, setTrainerPlan] = useState<TrainerPlan | null>(null);
  const [sessionData, setSessionData] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    routines: 0,
    evaluations: 0,
    meals: 0,
    mealPlans: 0,
    customPlans: 0 // Añadido para planes personalizados
  });

  useEffect(() => {
    async function initializeDashboard() {
      try {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;
        setUser(authUser);

        // 1. Obtenemos perfil para saber el rol y el plan activo
        const { data: profile } = await supabase
          .from("users")
          .select("role, selected_plan, own_plans")
          .eq("id", authUser.id)
          .single();

        const currentRole = profile?.role || "trainee";
        setRole(currentRole as any);

        if (currentRole === "trainer") {
          // 2. Fetch de conteos y datos en paralelo
          const [
            routines,
            evals,
            meals,
            mealPlans,
            trainees,
            sessions
          ] = await Promise.all([
            supabase.from("workout_routines").select("*", { count: 'exact', head: true }).eq("trainer_id", authUser.id),
            supabase.from("evaluations").select("*", { count: 'exact', head: true }).eq("trainer_id", authUser.id),
            supabase.from("meals").select("*", { count: 'exact', head: true }).eq("trainer_id", authUser.id),
            supabase.from("meal_plans").select("*", { count: 'exact', head: true }).eq("trainer_id", authUser.id),
            supabase.from("users").select("*").eq("role", "trainee").eq("trainer_id", authUser.id),
            supabase.from("sessions").select("*").eq("trainer_id", authUser.id).limit(3)
          ]);

          // 3. Fetch del Plan (Límites)
          if (profile?.selected_plan) {
            const { data: planData } = await supabase
              .from("plans")
              .select("*")
              .eq("id", profile.selected_plan)
              .single();
            
            if (planData) {
              setTrainerPlan({
                name: planData.title,
                trainee_limit: planData.trainee_limit,
                routine_limit: planData.routine_limit,
                evaluation_limit: planData.evaluation_limit,
                meal_plan_limit: planData.meal_plan_limit,
                meal_limit: planData.meal_limit,
                plan_limit: planData.plan_limit
              });
            }
          }

          setStats({
            routines: routines.count || 0,
            evaluations: evals.count || 0,
            meals: meals.count || 0,
            mealPlans: mealPlans.count || 0,
            customPlans: profile?.own_plans?.length || 0
          });
          setTraineesData(trainees.data || []);
          setSessionData(sessions.data || []);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    }
    initializeDashboard();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen font-sans">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="border-l-4 border-[#ff6b1a] pl-6">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            {role === "trainer" ? "Coach Hub" : "System Command"}
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
            {user?.email} • {role} Mode
          </p>
        </div>

        {/* CAPACITY GRID */}
        {role === "trainer" && trainerPlan && (
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6"> 
               <CapacityCard 
                title="Active Trainees" 
                current={traineesData.length} 
                limit={trainerPlan.trainee_limit} 
                icon={Users} 
                label="Trainees" 
                isLarge 
                tierName={trainerPlan.name}
                actionHref="/dashboard/trainees/new"
                actionLabel="Add Trainee"
                actionIcon={<UserPlus size={14} />}
              /> 

            <CapacityCard 
              title="Routines" 
              current={stats.routines} 
              limit={trainerPlan.routine_limit} 
              icon={Dumbbell} 
              label="Routines" 
              actionHref="/dashboard/routines/new"
              actionLabel="New"
            />
            <CapacityCard 
              title="Evaluations" 
              current={stats.evaluations} 
              limit={trainerPlan.evaluation_limit} 
              icon={Activity} 
              label="Evals" 
              actionHref="/dashboard/evaluations/new"
              actionLabel="New"
            />
            <CapacityCard 
              title="Meal Plans" 
              current={stats.mealPlans} 
              limit={trainerPlan.meal_plan_limit} 
              icon={ClipboardList} 
              label="Plans" 
              actionHref="/dashboard/meal-plans/new"
              actionLabel="New"
            />
            <CapacityCard 
              title="Individual Meals" 
              current={stats.meals} 
              limit={trainerPlan.meal_limit} 
              icon={UtensilsCrossed} 
              label="Meals" 
              actionHref="/dashboard/meals/new"
              actionLabel="New"
            />
            <CapacityCard 
              title="Subscription Tiers" 
              current={stats.customPlans} 
              limit={trainerPlan.plan_limit} 
              icon={Zap} 
              label="Slots" 
              actionHref="/dashboard/plans/new"
              actionLabel="Configure"
            />
          </div>
        )}
 
        {role === "admin" &&  ( 
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <DashboardList title="Upcoming Sessions" data={sessionData} type="session" />
            <DashboardList title="Recent Trainees" data={traineesData.slice(0, 3)} type="trainee" />
          </div> 
        )} 
      </div>
    </main>
  );
}

// --- COMPONENTES AUXILIARES ---

function CapacityCard({ title, current, limit, icon: Icon, label, isLarge, tierName, actionHref, actionLabel, actionIcon }: any) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isAtLimit = current >= limit;

  return (
    <section className={`bg-[#111] border border-white/5 rounded-[2.5rem] relative overflow-hidden shadow-2xl p-7 ${isLarge ? 'lg:p-10' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className={`${isLarge ? 'text-2xl' : 'text-lg'} font-black italic uppercase tracking-tighter flex items-center gap-3`}>
            <Icon className="text-[#ff6b1a]" size={isLarge ? 28 : 20} /> {title}
          </h2>
          {isLarge && <p className="text-[#ff6b1a] text-[10px] font-black uppercase tracking-widest mt-1">Tier: {tierName}</p>}
        </div>
        
        <Link 
          href={isAtLimit ? "/pricing" : actionHref}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${
            isAtLimit ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-[#ff6b1a] text-black"
          }`}
        >
          {isAtLimit ? "Upgrade Required" : actionLabel} {isAtLimit ? <Zap size={14}/> : actionIcon || <PlusCircle size={14} />}
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={`${isLarge ? 'text-6xl' : 'text-4xl'} font-black italic text-white`}>{current}</span>
          <span className="text-gray-600 font-black uppercase italic text-sm">/ {limit} {label}</span>
        </div>

        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full rounded-full ${percentage > 90 ? 'bg-red-500' : 'bg-[#ff6b1a]'}`}
          />
        </div>
      </div>
    </section>
  );
}

function DashboardList({ title, data, type }: any) {
  return (
    <section className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem]">
      <h2 className="text-[10px] font-black uppercase tracking-widest mb-6 text-gray-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#ff6b1a] rounded-full" /> {title}
      </h2>
      <div className="space-y-3">
        {data.length > 0 ? data.map((item: any, idx: number) => (
          <div key={idx} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-black rounded-lg text-[#ff6b1a]">
                  {type === 'session' ? <Clock size={16} /> : <Users size={16} />}
               </div>
               <div>
                  <p className="text-sm font-bold uppercase italic">{item.first_name ? `${item.first_name} ${item.last_name}` : (item.title || "No Title")}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-black">{item.email || "Recent Activity"}</p>
               </div>
            </div>
            <ChevronRight size={14} className="text-gray-700 group-hover:text-[#ff6b1a]" />
          </div>
        )) : <p className="text-center py-10 text-[10px] font-black uppercase text-gray-700 tracking-[.2em]">No Data Available</p>}
      </div>
    </section>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-t-2 border-[#ff6b1a] rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syncing Systems</p>
    </div>
  );
}