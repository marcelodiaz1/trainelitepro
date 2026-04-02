"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Lock,
  LockOpen,
  Search, 
  UserPlus,
  Star,
  Eye,
  Dumbbell,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import SortableHeader from "@/components/dashboard/SortableHeader";
import Pagination from "@/components/dashboard/Pagination";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
interface Plan {
  id: string;
  title: string;
}
interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string | null;
  rating: number | null;
  subscription_expiration: string | null;
  status: string;
  selected_plan: string | null;
  plans?: { name: string };
}

export default function TrainersTable() {
const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Trainer>("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  useEffect(() => {
    const checkRoleAndFetch = async () => {
      setLoading(true);

      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Check Role (assuming 'profiles' table stores roles)
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // 3. Authorization successful
      setIsAuthorized(true);

      // 4. Fetch Data
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

const [countResponse, dataResponse, plansResponse] = await Promise.all([
        supabase
          .from("users")
          .select("*", { count: "exact", head: true }) ,
        supabase
          .from("users")
          .select(`
            *,
            selected_plan ( title )
          `)
          .eq("role", "trainer")
          .order(sortColumn, { ascending: sortOrder === "asc" })
          .range(from, to),
        supabase.from("plans").select("id, title")
      ]);

      setTotal(countResponse.count || 0);
      setTrainers((dataResponse.data as Trainer[]) || []);
      setAvailablePlans(plansResponse.data || []);
      setLoading(false);
    };

    checkRoleAndFetch();
  }, [page, sortColumn, sortOrder, pageSize, router]);
const handlePlanChange = async (trainerId: string, newPlanId: string) => {
    setUpdatingPlanId(trainerId);
    
    const { error } = await supabase
      .from("users")
      .update({ selected_plan: newPlanId === "" ? null : newPlanId })
      .eq("id", trainerId);

    if (!error) {
      const planName = availablePlans.find(p => p.id === newPlanId)?.title || "No Plan";
      setTrainers((prev) =>
        prev.map((t) => (t.id === trainerId ? { ...t, selected_plan: newPlanId, plans: { name: planName } } : t))
      );
    }
    setUpdatingPlanId(null);
  };
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", id);
    
    if (!error) {
      setTrainers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this trainer? This cannot be undone.")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) {
      setTrainers((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => prev - 1);
    }
    setDropdownOpen(null);
  };

  const handleSort = (column: keyof Trainer) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Prevent UI flashing
  if (!isAuthorized && loading) {
    return (
      <div className="bg-[#0b0b0b] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-b-2 border-orange-500 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Verifying Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex"> 
      <div className="p-8 flex-1 max-w-full w-full"> 
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <Dumbbell className="text-orange-500" /> Trainers
            </h1> 
            <p className="text-slate-500 text-sm">Manage staff credentials and access status.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder="Search trainers..." 
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-orange-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
            <Link href="/dashboard/trainers/new">
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/10">
                <UserPlus size={16} /> Add Trainer
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <div className="h-10 w-10 border-b-2 border-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Synchronizing Records...</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-3xl p-20 text-center text-slate-500">
            <p className="text-sm font-bold uppercase tracking-widest">No professional staff records found.</p>
          </div>
        ) : (
          <>
            <div className="bg-[#111] border border-slate-800 rounded-3xl shadow-2xl overflow-visible backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616]/50 border-b border-slate-800">
                    <SortableHeader onClick={() => handleSort("first_name")} label="Trainer" active={sortColumn === "first_name"} />
                    <SortableHeader onClick={() => handleSort("email")} label="Email Address" active={sortColumn === "email"} />
                      <SortableHeader onClick={() => handleSort("selected_plan")} label="Active Plan" active={sortColumn === "selected_plan"} />
                    <SortableHeader onClick={() => handleSort("specialty")} label="Specialty" active={sortColumn === "specialty"} />
                    <SortableHeader onClick={() => handleSort("rating")} label="Rating" active={sortColumn === "rating"} center />
                    <SortableHeader onClick={() => handleSort("status")} label="Status" active={sortColumn === "status"} center />
                    <SortableHeader onClick={() => handleSort("subscription_expiration")} label="Expiration" active={sortColumn === "subscription_expiration"} center />
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {trainers.map((trainer) => (
                    <tr key={trainer.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="px-6 py-5">
                        <Link 
                          href={`/dashboard/trainers/${trainer.id}`} 
                          className="font-bold text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                        >
                          <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-orange-400 border border-slate-700 group-hover:border-orange-500/50 transition-all">
                            {trainer.first_name[0]}{trainer.last_name[0]}
                          </div>
                          {trainer.first_name} {trainer.last_name}
                        </Link>
                      </td>

                      <td className="px-6 py-5 text-slate-500 text-xs font-medium lowercase italic">
                        {trainer.email}
                      </td> 
                      <td className="px-6 py-5">
                        <div className="relative flex items-center gap-2">
                          <select
                            disabled={updatingPlanId === trainer.id}
                            value={trainer.selected_plan || ""}
                            onChange={(e) => handlePlanChange(trainer.id, e.target.value)}
                            className={`bg-black/50 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-orange-500 rounded-xl px-3 py-2 outline-none focus:border-orange-500 transition-all cursor-pointer hover:bg-black appearance-none pr-8 min-w-[140px] ${updatingPlanId === trainer.id ? 'opacity-50' : 'opacity-100'}`}
                          >
                            <option value="">No Plan</option>
                            {availablePlans.map((plan) => (
                              <option key={plan.id} value={plan.id}>{plan.title}</option>
                            ))}
                          </select>
                          <ShieldCheck size={12} className="absolute right-3 text-slate-700 pointer-events-none" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800 uppercase tracking-tighter font-bold">
                          {trainer.specialty || "Generalist"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-yellow-500/80 font-bold">
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs">{trainer.rating || "0.0"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          trainer.status === "active" 
                            ? "bg-green-500/10 text-green-500 border-green-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {trainer.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-300">
                            {trainer.subscription_expiration 
                              ? new Date(trainer.subscription_expiration).toLocaleDateString() 
                              : "No Date"}
                          </span>
                          {trainer.subscription_expiration && new Date(trainer.subscription_expiration) < new Date() && (
                            <span className="text-[9px] text-red-500 font-bold uppercase tracking-tighter">
                              Payment Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === trainer.id ? null : trainer.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-600 hover:text-white transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {dropdownOpen === trainer.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-6 mt-2 w-52 bg-[#161616] border border-slate-800 rounded-2xl shadow-2xl z-20 overflow-hidden ring-1 ring-white/5"
                              >
                                <Link href={`/dashboard/trainers/${trainer.id}`} className="w-full">
                                  <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300">
                                    <Eye size={14} className="text-orange-500" /> View Profile
                                  </button>
                                </Link>
                                <Link href={`/dashboard/trainers/${trainer.id}/edit`} className="w-full">
                                  <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800/50">
                                    <Edit2 size={14} className="text-slate-400" /> Edit Credentials
                                  </button>
                                </Link>
                                <button
                                  onClick={() => toggleStatus(trainer.id, trainer.status)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800/50"
                                >
                                  {trainer.status === "active" ? (
                                    <>
                                      <Lock size={14} className="text-orange-400" /> Restrict Login
                                    </>
                                  ) : (
                                    <>
                                      <LockOpen size={14} className="text-emerald-400" /> Enable Login
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDelete(trainer.id)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-red-500/10 text-red-500 border-t border-slate-800/50 transition-colors"
                                >
                                  <Trash2 size={14} /> Remove Member
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
              label="TRAINERS"
            />
          </>
        )}
      </div>
    </main>
  );
}