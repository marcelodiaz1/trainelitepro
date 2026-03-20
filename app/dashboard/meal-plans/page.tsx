"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, Trash2, Edit2, Search, Calendar, UtensilsCrossed,
  Lock, Zap
} from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/dashboard/Pagination";
import SortableHeader from "@/components/dashboard/SortableHeader";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Profile {
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

interface MealPlan {
  id: string;
  created_at: string;
  trainer_id: string;
  trainee_id: string;
  title: string;
  duration: 'weekly' | 'fortnightly' | 'monthly';
  trainer: Profile;
  trainee: Profile;
}

export default function MealPlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [isAtLimit, setIsAtLimit] = useState(false);
  const [sortColumn, setSortColumn] = useState<keyof MealPlan>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchPlans();
  }, [page, sortColumn, sortOrder]);

  const fetchPlans = async () => {
    setLoading(true);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Role and Plan
      const { data: profile } = await supabase
        .from("users")
        .select("role, selected_plan")
        .eq("id", user.id)
        .single();
      
      const userRole = profile?.role || 'trainee';
      setRole(userRole);
      
      // 2. Build Base Query
      let query = supabase
        .from("meal_plans")
        .select(`
            *,
            trainer:trainer_id (first_name, last_name, profile_picture),
            trainee:trainee_id (first_name, last_name, profile_picture)
        `, { count: "exact" });
        
      if (userRole === "trainer") {
        query = query.eq("trainer_id", user.id);
      } else if (userRole === "trainee") {
        query = query.eq("trainee_id", user.id);
      } 

      const { data, error, count } = await query
        .range(from, to)
        .order(sortColumn, { ascending: sortOrder === "asc" });

      if (error) throw error;

      // 3. Limit Check Logic
      if (userRole === "trainer" && profile?.selected_plan) {
        const { data: planData } = await supabase
          .from("plans")
          .select("meal_plan_limit")
          .eq("id", profile.selected_plan)
          .single();

        if (planData) {
          setIsAtLimit((count || 0) >= planData.meal_plan_limit);
        }
      }

      setPlans(data as any);
      setTotal(count || 0);
    } catch (err: any) {
      console.error("Error fetching plans:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof MealPlan) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const getDurationColor = (duration: string) => {
    switch(duration) {
      case 'weekly': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case 'fortnightly': return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case 'monthly': return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal plan?")) return;
    const { error } = await supabase.from("meal_plans").delete().eq("id", id);
    if (!error) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        setTotal((prev) => prev - 1);
    }
    setDropdownOpen(null);
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 w-full">  
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <UtensilsCrossed className="text-orange-500" /> Meal Plans
            </h1>
            <p className="text-slate-500 text-sm">
              {isAtLimit && role === "trainer" 
                ? "You have reached the meal plan limit for your current subscription." 
                : "Manage and assign nutritional schedules to trainees."}
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder="Search meal plans..." 
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-orange-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div> 
             
            {role !== "trainee" && (
              isAtLimit ? (
                <Link href="/pricing">
                  <button className="bg-white/5 border border-white/10 hover:border-orange-500/50 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all group shadow-lg">
                    <Lock size={16} className="text-orange-500" /> 
                    Limit Reached
                    <Zap size={14} className="text-orange-500 animate-pulse" />
                  </button>
                </Link>
              ) : (
                <Link href="/dashboard/meal-plans/new">
                  <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                    <UtensilsCrossed size={16} /> Add Meal plan
                  </button>
                </Link>
              )
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="h-10 w-10 border-b-2 border-orange-500 rounded-full animate-spin mb-4" />
          </div>
        ) : (
          <>
            <div className="bg-[#111] border border-slate-800 rounded-2xl shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#161616]/50 border-b border-slate-800">
                    <SortableHeader onClick={() => handleSort("title")} label="Plan Title" active={sortColumn === "title"} />
                    <SortableHeader onClick={() => handleSort("trainer_id")} label="Trainer" active={sortColumn === "trainer_id"} />
                    <SortableHeader onClick={() => handleSort("trainee_id")} label="Trainee" active={sortColumn === "trainee_id"} />
                    <SortableHeader onClick={() => handleSort("duration")} label="Duration" active={sortColumn === "duration"} /> 
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {plans.length > 0 ? (
                    plans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <Link href={`/dashboard/meal-plans/${plan.id}`} className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 group-hover:bg-orange-500 group-hover:text-white transition-all">
                              <Calendar size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm group-hover:text-orange-500 transition-colors">
                                {plan.title}
                              </div>
                              <div className="text-[10px] text-slate-500 uppercase font-mono">
                                {plan.id.slice(0, 8)}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-5">
                          <UserAvatar profile={plan.trainer} />
                        </td>
                        <td className="px-6 py-5">
                          <UserAvatar profile={plan.trainee} />
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getDurationColor(plan.duration)}`}>
                            {plan.duration}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button 
                            onClick={() => setDropdownOpen(dropdownOpen === plan.id ? null : plan.id)} 
                            className="p-2 text-slate-500 hover:text-white transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                          <AnimatePresence>
                            {dropdownOpen === plan.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  exit={{ opacity: 0 }} 
                                  className="absolute right-6 mt-2 w-40 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                                >
                                  <Link href={`/dashboard/meal-plans/${plan.id}/edit`}>
                                    <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300">
                                      <Edit2 size={14} className="text-slate-400" /> Edit  
                                    </button>
                                  </Link>
                                  <button 
                                    onClick={() => handleDelete(plan.id)} 
                                    className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 border-t border-slate-800 transition-colors"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-20">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
                            <UtensilsCrossed size={32} className="text-slate-700" />
                          </div>
                          <h3 className="text-lg font-bold text-white mb-1">No meal plans found</h3>
                          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
                            {role === "trainer" 
                              ? "You haven't created any nutrition schedules yet."
                              : "No meal plans have been assigned to you yet."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={page}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={setPage}
              label="Meal Plans"
            />
          </>
        )}
      </div>
    </main>
  );
}

function UserAvatar({ profile }: { profile: Profile }) {
  const initials = `${profile?.first_name?.[0] || ''}${profile?.last_name?.[0] || ''}`;
  return (
    <div className="flex items-center gap-3">
      {profile?.profile_picture ? (
        <img src={profile.profile_picture} className="w-8 h-8 rounded-full object-cover border border-slate-700" alt="" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 text-[10px] font-black">
          {initials || "???"}
        </div>
      )}
      <span className="text-sm font-semibold text-slate-200">
        {profile ? `${profile.first_name} ${profile.last_name}` : "System"}
      </span>
    </div>
  );
}