"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MoreVertical, Trash2, Edit2, Eye, Scale,
  User, ClipboardCheck, ClipboardPlus, Loader2, Lock, Zap
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import SortableHeader from "@/components/dashboard/SortableHeader";
import Pagination from "@/components/dashboard/Pagination";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EvaluationsTableClient({ dict, lang }: { dict: any; lang: string }) {
  const t = dict.evaluations;
  const [evals, setEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAtLimit, setIsAtLimit] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const { data: profile } = await supabase
          .from("users")
          .select("role, selected_plan")
          .eq("id", authUser.id)
          .single();
        
        const userRole = profile?.role || authUser.user_metadata?.role; 
        setRole(userRole); 

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from("evaluations")
          .select(`*, trainee:trainee_id(first_name, last_name)`, { count: "exact" });

        if (userRole === "trainer") {
          query = query.eq("trainer_id", authUser.id);
        } else if (userRole === "trainee") {
          query = query.eq("trainee_id", authUser.id);
        }

        if (searchTerm) {
          query = query.ilike("results", `%${searchTerm}%`);
        }

        const { data, error, count } = await query
          .order(sortColumn, { ascending: sortOrder === "asc" })
          .range(from, to);

        if (error) throw error;

        if (userRole === "trainer" && profile?.selected_plan) {
          const { data: planData } = await supabase
            .from("plans")
            .select("evaluation_limit")
            .eq("id", profile.selected_plan)
            .single();

          if (planData) {
            setIsAtLimit((count || 0) >= planData.evaluation_limit);
          }
        }

        setEvals(data || []);
        setTotal(count || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [page, sortColumn, sortOrder, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.actions.confirmDelete)) return;
    const { error } = await supabase.from("evaluations").delete().eq("id", id);
    if (!error) {
      setEvals((prev) => prev.filter((e) => e.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      setIsAtLimit(false);
    }
    setDropdownOpen(null);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  return ( 
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 max-w-1xl w-full"> 
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <ClipboardCheck className="text-orange-500" /> {t.title}
            </h1>
            <p className="text-slate-500 text-sm">
              {isAtLimit && role === "trainer" ? t.limitNote : t.subtitle}
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

            {role !== "trainee" && (
              isAtLimit ? (
                <LocalizedLink href={`/${lang}/pricing`}>
                  <button className="bg-white/5 border border-white/10 hover:border-orange-500/50 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all group shadow-lg">
                    <Lock size={16} className="text-orange-500" /> {t.limitReached}
                    <Zap size={14} className="text-orange-500 animate-pulse" />
                  </button>
                </LocalizedLink>
              ) : (
                <LocalizedLink href={`/${lang}/dashboard/evaluations/new`}>
                  <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                    <ClipboardPlus size={16} /> {t.addEvaluation}
                  </button>
                </LocalizedLink>
              )
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="animate-pulse font-medium tracking-widest text-[10px]">{t.syncing}</p>
          </div>
        ) : evals.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-2xl p-20 text-center text-slate-500">
            <ClipboardCheck className="mx-auto mb-4 opacity-20" size={48} />
            <p className="font-medium">{t.noRecords}</p>
          </div>
        ) : (
          <>
            <div className="bg-[#111] border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616]/50 border-b border-slate-800 text-white">
                    <SortableHeader onClick={() => handleSort("created_at")} label={t.table.date} active={sortColumn === "created_at"} />
                    <SortableHeader onClick={() => handleSort("trainee_id")} label={t.table.athlete} active={sortColumn === "trainee_id"} />
                    <SortableHeader onClick={() => handleSort("weight")} label={t.table.weight} active={sortColumn === "weight"} icon={<Scale size={12}/>} />
                    <SortableHeader onClick={() => handleSort("fat_percentage")} label={t.table.fat} active={sortColumn === "fat_percentage"} />
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{t.table.result}</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {evals.map((e) => (
                    <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-[11px] font-mono text-slate-500">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <User size={14} className="text-slate-600" />
                          <span className="text-sm font-semibold uppercase italic">
                            {e.trainee?.first_name} {e.trainee?.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-white">
                        {e.weight} <span className="text-[10px] text-slate-500 uppercase tracking-tighter">kg</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-orange-400 font-bold">
                        {e.fat_percentage}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${
                          e.results?.toLowerCase().includes("obese") || e.results?.toLowerCase().includes("high")
                            ? "bg-red-500/10 text-red-500 border-red-500/20" 
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        }`}>
                          {e.results || "Normal"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button onClick={() => setDropdownOpen(dropdownOpen === e.id ? null : e.id)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all">
                          <MoreVertical size={18} />
                        </button>
                        <AnimatePresence>
                          {dropdownOpen === e.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                              <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-6 mt-2 w-48 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden text-left">
                                <LocalizedLink href={`/${lang}/dashboard/evaluations/${e.id}`}>
                                  <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300">
                                    <Eye size={14} className="text-blue-500" /> {t.actions.view}
                                  </button>
                                </LocalizedLink>
                                <LocalizedLink href={`/${lang}/dashboard/evaluations/${e.id}/edit`}>
                                  <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800/50">
                                    <Edit2 size={14} className="text-slate-400" /> {t.actions.edit}
                                  </button>
                                </LocalizedLink>
                                <button onClick={() => handleDelete(e.id)} className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-red-500/10 text-red-400 border-t border-slate-800 transition-colors">
                                  <Trash2 size={14} /> {t.actions.delete}
                                </button>
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
              label={t.title.toUpperCase()}
            />
          </>
        )}
      </div>
    </main>
  );
}