"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Users, Dumbbell, Star, Calendar, CheckCircle2, 
  AlertTriangle, UtensilsCrossed, Clock, ChevronRight,
  TrendingUp, Zap, Activity
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES & INTERFACES ---
interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture?: string;
  specialty?: string;
}

interface GenericData {
  id: string;
  title?: string;
  message?: string;
  client?: string;
  time?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  specialty?: string;
}

export default function Dashboard() {
  const [role, setRole] = useState<"admin" | "trainer" | "trainee" | null>(null);
  const [loading, setLoading] = useState(true);

  // Top-level State Hooks (Must be here, not inside useEffect)
  const [trainersData, setTrainersData] = useState<UserProfile[]>([]);
  const [traineesData, setTraineesData] = useState<UserProfile[]>([]);
  const [alertsData, setAlertsData] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any[]>([]);

  useEffect(() => {
    async function initializeDashboard() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // 1. Fetch User Role from public.users
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        const currentRole = profile?.role || "trainee";
        setRole(currentRole as any);

        // 2. Conditional Data Fetching based on Role
        if (currentRole === "admin") {
          const { data: trainers } = await supabase.from("users").select("*").eq("role", "trainer").limit(3);
          const { data: trainees } = await supabase.from("users").select("*").eq("role", "trainee").limit(3);
          setTrainersData(trainers || []);
          setTraineesData(trainees || []);
        } 
        
        else if (currentRole === "trainer") {
          // Example: Fetch sessions where this user is the trainer
          const { data: sessions } = await supabase.from("sessions").select("*").eq("trainer_id", user.id).limit(3);
          setSessionData(sessions || []);
        }

        else if (currentRole === "trainee") {
          // Example: Fetch the trainer assigned to this trainee
          const { data: myTrainers } = await supabase.from("users").select("*").eq("role", "trainer").limit(3);
          setTrainersData(myTrainers || []);
        }

      } catch (error) {
        console.error("Dashboard Init Error:", error);
      } finally {
        setLoading(false);
      }
    }

    initializeDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-[#ff6b1a] rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Initializing Portal</p>
      </div>
    );
  }

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen">
      <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <div className="border-l-4 border-[#ff6b1a] pl-6">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            {role === "admin" && "System Command"}
            {role === "trainer" && "Coach Hub"}
            {role === "trainee" && "Performance"}
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
            Status: Active Access • {role} Mode
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {role === "admin" && (
            <>
              <StatCard title="Total Trainers" value="42" icon={<Dumbbell size={20}/>} />
              <StatCard title="Total Trainees" value="183" icon={<Users size={20}/>} />
              <StatCard title="Revenue" value="$12.4k" icon={<TrendingUp size={20}/>} />
              <StatCard title="Alerts" value="2" icon={<AlertTriangle size={20}/>} warning />
            </>
          )}
          {role === "trainer" && (
            <>
              <StatCard title="Clients" value="12" icon={<Users size={20}/>} />
              <StatCard title="Sessions" value="28" icon={<Calendar size={20}/>} />
              <StatCard title="Rating" value="4.9" icon={<Star size={20}/>} />
              <StatCard title="Earnings" value="$3.2k" icon={<Activity size={20}/>} />
            </>
          )}
          {role === "trainee" && (
            <>
              <StatCard title="Workouts" value="14" icon={<CheckCircle2 size={20}/>} />
              <StatCard title="Streak" value="5 Days" icon={<Zap size={20}/>} />
              <StatCard title="Next Up" value="2pm" icon={<Clock size={20}/>} />
              <StatCard title="Calories" value="12k" icon={<TrendingUp size={20}/>} />
            </>
          )}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {role === "admin" && (
            <>
              <DashboardSection title="New Trainers" data={trainersData} type="trainer" />
              <DashboardSection title="Recent Trainees" data={traineesData} type="trainee" />
              <DashboardSection title="Critical Alerts" data={alertsData} type="alert" />
            </>
          )}

          {role === "trainer" && (
            <>
              <DashboardSection title="Upcoming Sessions" data={sessionData} type="session" />
              <DashboardSection title="Client Requests" data={[]} type="request" />
              <DashboardSection title="Recent Feedback" data={[]} type="feedback" />
            </>
          )}

          {role === "trainee" && (
            <>
              <DashboardSection title="Active Meal Plan" data={[]} type="meal" />
              <DashboardSection title="Workout of the Day" data={[]} type="workout" />
              <DashboardSection title="Your Trainers" data={trainersData} type="trainer" />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// --- SUB-COMPONENTS ---

function StatCard({ title, value, icon, warning }: any) {
  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#ff6b1a]/50 transition-all cursor-default shadow-xl">
      <div>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black italic mt-1">{value}</p>
      </div>
      <div className={`${warning ? "text-red-500" : "text-[#ff6b1a]"} bg-black/40 p-3 rounded-xl shadow-inner`}>
        {icon}
      </div>
    </div>
  );
}

function DashboardSection({ title, data, type }: { title: string, data: any[], type: string }) {
  return (
    <section className="bg-[#111] border border-white/5 p-6 rounded-[2rem] shadow-2xl transition-all">
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#ff6b1a] rounded-full shadow-[0_0_5px_#ff6b1a]" /> {title}
      </h2>

      <div className="space-y-3">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-black rounded-xl text-[#ff6b1a] group-hover:scale-110 transition-transform">
                   {type === 'trainer' && <Dumbbell size={16} />}
                   {type === 'trainee' && <Users size={16} />}
                   {type === 'session' && <Clock size={16} />}
                   {type === 'meal' && <UtensilsCrossed size={16} />}
                   {type === 'alert' && <AlertTriangle size={16} className="text-red-500" />}
                   {(!['trainer', 'trainee', 'session', 'meal', 'alert'].includes(type)) && <Activity size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold uppercase italic leading-none">
                    {item.first_name ? `${item.first_name} ${item.last_name}` : (item.title || item.message || "Unknown Entry")}
                  </p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                    {item.specialty || item.role || item.time || "Active Status"}
                  </p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-700 group-hover:text-[#ff6b1a] group-hover:translate-x-1 transition-all" />
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center opacity-20">
            <Activity size={32} className="mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">No Recent Activity</p>
          </div>
        )}
      </div>
    </section>
  );
}