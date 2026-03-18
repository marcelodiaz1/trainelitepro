"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, 
  Trash2, 
  Edit2, 
  Search, 
  UserPlus,
  Mail,
  Users,
  Lock,
  LockOpen,
  Eye,
  Loader2
} from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";
import SortableHeader from "@/components/dashboard/SortableHeader";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Trainee {
  id: string;
  first_name: string;
  last_name: string;
  trainer_id: string;
  email: string;
  status: string;
}

export default function TraineesTable() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Trainee>("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        setLoading(true);

        // 1. Get the current auth user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error("Auth session not found:", authError);
          setLoading(false);
          return;
        }

        // 2. Fetch the role of the logged-in user
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("role")
          .eq("id", authUser.id)
          .single();

        if (profileError) console.error("Profile fetch error:", profileError);
        
        const userRole = profile?.role;
        console.log("Current Logged-in Role:", userRole);

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // 3. Initialize the query for trainees
        let query = supabase
          .from("users")
          .select("*", { count: "exact" })
          .eq("role", "trainee");

        // 4. Role-Based Filter
        if (userRole === "trainer") {
          console.log("Trainer Mode: Filtering by trainer_id", authUser.id);
          query = query.eq("trainer_id", authUser.id);
        } else if (userRole === "admin") {
          console.log("Admin Mode: Fetching all trainees");
          // No trainer_id filter applied
        }

        // 5. Execute
        const { data, count, error } = await query
          .order(sortColumn, { ascending: sortOrder === "asc" })
          .range(from, to);

        if (error) {
          console.error("Query Execution Error:", error.message);
          throw error;
        }

        setTrainees(data as Trainee[] || []);
        setTotal(count || 0);

      } catch (err) {
        console.error("Critical Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainees();
  }, [page, sortColumn, sortOrder]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    const { error } = await supabase.from("users").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setTrainees((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    }
    setDropdownOpen(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this trainee?")) return;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) {
      setTrainees((prev) => prev.filter((t) => t.id !== id));
      setTotal((prev) => prev - 1);
    }
    setDropdownOpen(null);
  };

  const handleSort = (column: keyof Trainee) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-4 md:p-8 w-full"> 
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <Users className="text-orange-500" />Trainees
            </h1> 
            <p className="text-slate-500 text-sm">Manage professional credentials and access status.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder="Search trainees..." 
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-orange-500 outline-none transition-all placeholder:text-slate-700 text-white"
              />
            </div>
            <Link href="/dashboard/trainees/new">
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                <UserPlus size={16} /> Add Trainee
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <p className="animate-pulse font-medium tracking-widest text-[10px]">SYNCING RECORDS</p>
          </div>
        ) : trainees.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-2xl p-20 text-center text-slate-500">
             <Users className="mx-auto mb-4 opacity-20" size={48} />
             <p className="font-medium">No trainees currently registered.</p>
          </div>
        ) : (
          <>
            <div className="bg-[#111] border border-slate-800 rounded-2xl shadow-2xl overflow-visible backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616]/50 border-b border-slate-800 text-white">
                    <SortableHeader onClick={() => handleSort("first_name")} label="Client Name" active={sortColumn === "first_name"} />
                    <SortableHeader onClick={() => handleSort("email")} label="Email Address" active={sortColumn === "email"} />
                    <SortableHeader onClick={() => handleSort("status")} label="Account Status" active={sortColumn === "status"} center />
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {trainees.map((trainee) => (
                    <tr key={trainee.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {trainee.first_name} {trainee.last_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                           <Mail size={14} className="opacity-40" />
                           {trainee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                          trainee.status === "active" 
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {trainee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === trainee.id ? null : trainee.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {dropdownOpen === trainee.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-6 mt-2 w-48 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                              >
                                <Link href={`/dashboard/trainees/${trainee.id}`}>
                                  <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300">
                                    <Eye size={14} className="text-blue-500" /> View Profile
                                  </button>
                                </Link>
                                <Link href={`/dashboard/trainees/${trainee.id}/edit`}>
                                  <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800/50">
                                    <Edit2 size={14} className="text-slate-400" /> Edit Credentials
                                  </button>
                                </Link>
                                <button
                                  onClick={() => toggleStatus(trainee.id, trainee.status)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800"
                                >
                                  {trainee.status === "active" ? (
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
                                  onClick={() => handleDelete(trainee.id)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 border-t border-slate-800 transition-colors"
                                >
                                  <Trash2 size={14} /> Purge Records
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
              label="TRAINEES"
            />
          </>
        )}
      </div>
    </div>
  );
}