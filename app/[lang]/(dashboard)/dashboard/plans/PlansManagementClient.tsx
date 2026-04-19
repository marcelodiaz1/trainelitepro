"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import LocalizedLink from "@/components/LocalizedLink";
import { 
  MoreVertical, Search, Plus, Edit2, Trash2, 
  CreditCard, Briefcase, ClipboardList, DollarSign, Lock, Zap,
  Eye
} from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PlansManagementClient({ dict, lang }: { dict: any, lang: string }) {
  const t = dict.plans;
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAtLimit, setIsAtLimit] = useState(false);
  const [currentPlanLimit, setCurrentPlanLimit] = useState<number | null>(null);
  const [currentCount, setCurrentCount] = useState(0);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("own_plans, selected_plan")
        .eq("id", user.id)
        .single();

      const userPlanIds = profile?.own_plans || [];
      setCurrentCount(userPlanIds.length);

      if (profile?.selected_plan) {
        const { data: subscriptionTier } = await supabase
          .from("plans")
          .select("plan_limit")
          .eq("id", profile.selected_plan)
          .single();

        if (subscriptionTier) {
          setCurrentPlanLimit(subscriptionTier.plan_limit);
          setIsAtLimit(userPlanIds.length >= subscriptionTier.plan_limit);
        }
      }

      if (userPlanIds.length > 0) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count: totalCount } = await supabase
          .from("plans")
          .select("*", { count: "exact" })
          .in("id", userPlanIds)
          .ilike('title', `%${searchTerm}%`)
          .range(from, to)
          .order('created_at', { ascending: false });

        setPlans(data || []);
        setTotal(totalCount || 0);
      } else {
        setPlans([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, pageSize]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (planId: string) => {
    if (!confirm(t.deleteConfirm)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("users").select("own_plans").eq("id", user.id).single();

      if (profile) {
        const updatedOwnPlans = (profile.own_plans || []).filter((id: string) => id !== planId);
        await supabase.from("users").update({ own_plans: updatedOwnPlans }).eq("id", user.id);
      }

      await supabase.from("plans").delete().eq("id", planId);
      fetchPlans();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDropdownOpen(null);
    }
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 max-w-7xl w-full mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12 text-left">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <ClipboardList className="text-[#ff6b1a]" /> {t.title}
            </h1>
            <p className="text-slate-500 text-sm">
              {isAtLimit 
                ? t.limitReachedMsg.replace('{current}', currentCount).replace('{total}', currentPlanLimit)
                : t.manageSubtitle}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-64 w-full"> 
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-[#ff6b1a] outline-none transition-all placeholder:text-slate-700"
              />
            </div> 

            {isAtLimit ? (
              <LocalizedLink href={`/${lang}/pricing`}>
                <button className="bg-white/5 border border-white/10 hover:border-[#ff6b1a]/50 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                  <Lock size={16} className="text-[#ff6b1a]" /> 
                  {t.limitReachedBtn}
                  <Zap size={14} className="text-[#ff6b1a] animate-pulse" />
                </button>
              </LocalizedLink>
            ) : (
              <LocalizedLink href={`/${lang}/dashboard/plans/new`}>
                <button className="bg-[#ff6b1a] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                  <Plus size={16} /> {t.createPlan}
                </button>
              </LocalizedLink> 
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="h-10 w-10 border-b-2 border-[#ff6b1a] rounded-full animate-spin mb-4" />
            <p className="tracking-widest text-[10px] text-slate-500 uppercase">{t.syncing}</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-3xl p-20 text-center text-slate-500">
            <p className="uppercase italic tracking-widest text-xs">{t.noPlans}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-left">
              {plans.map((plan) => (
                <motion.div 
                  layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={plan.id} 
                  className="bg-[#111] border border-slate-800 rounded-2xl group hover:border-[#ff6b1a]/30 transition-all shadow-2xl relative"
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    <div className={`w-full sm:w-1.5 shrink-0 ${plan.payment_method === 'bank_transfer' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">{plan.title}</h3>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center gap-1 text-[#ff6b1a] font-bold text-sm">
                              <DollarSign size={14} /> {plan.price}
                            </div>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${
                              plan.payment_method === 'bank_transfer' 
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}>
                              {plan.payment_method === 'bank_transfer' ? <Briefcase size={10} /> : <CreditCard size={10} />}
                              {plan.payment_method === 'bank_transfer' ? t.bankTransfer : `PayPal: ${plan.paypal_button_id || 'N/A'}`}
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <button 
                            onClick={() => setDropdownOpen(dropdownOpen === plan.id ? null : plan.id)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                          <AnimatePresence>
                            {dropdownOpen === plan.id && (
                              <>
                                <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(null)} />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                  className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden"
                                >
                                  <LocalizedLink href={`/${lang}/dashboard/plans/${plan.id}`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors">
                                    <Eye size={14} className="text-blue-400" /> {t.viewPlan}
                                  </LocalizedLink>
                                  <LocalizedLink href={`/${lang}/dashboard/plans/${plan.id}/edit`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors">
                                    <Edit2 size={14} className="text-blue-400" /> {t.editPlan}
                                  </LocalizedLink> 
                                  <button onClick={() => handleDelete(plan.id)} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 border-t border-slate-800">
                                    <Trash2 size={14} /> {t.deletePlan}
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mb-6 flex-1">
                        <div className="flex flex-wrap gap-1.5">
                          {plan.features?.map((feature: string, idx: number) => (
                            <span key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-500 uppercase font-medium">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                        <span>{t.created}: {new Date(plan.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12">
              <Pagination 
                currentPage={page} 
                totalItems={total} 
                pageSize={pageSize} 
                onPageChange={setPage} 
                label={t.title} 
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}