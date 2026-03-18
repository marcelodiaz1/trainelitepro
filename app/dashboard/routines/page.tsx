"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Search, 
  ListChecks,
  ClipboardList,
  User,
  Eye
} from "lucide-react";
import Link from "next/link";
import Pagination from "@/components/dashboard/Pagination";
import SortableHeader from "@/components/dashboard/SortableHeader";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Routine {
  id: string;
  title: string;
  description: string;
  created_at: string;
  trainer: { first_name: string; last_name: string };
  trainee: { first_name: string; last_name: string };
}

export default function WorkoutRoutinesTable() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

const [role, setRole] = useState<string | null>(null);
  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

useEffect(() => {
  const fetchRoutines = async () => {
    setLoading(true);
    
    // 1. Get the current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    // 2. Fetch the user's role
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    
    const userRole = profile?.role;
    setRole(userRole);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 3. Build the base query
    let query = supabase
      .from("workout_routines")
      .select(`
        id,
        title,
        description,
        created_at,
        trainer:trainer_id(first_name, last_name),
        trainee:trainee_id(first_name, last_name)
      `, { count: "exact" });

    // 4. Filter based on Role
    if (userRole === "trainer") {
      query = query.eq("trainer_id", user.id);
    } else if (userRole === "trainee") {
      query = query.eq("trainee_id", user.id);
    }
    // Admin (or others) see all

    const { data, error, count } = await query
      .order(sortColumn, { ascending: sortOrder === "asc" })
      .range(from, to);

    if (!error) {
      setRoutines(data as unknown as Routine[]);
      setTotal(count || 0);
    }
    
    setLoading(false);
  };

  fetchRoutines();
}, [page, sortColumn, sortOrder]);


  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    const { error } = await supabase.from("workout_routines").delete().eq("id", id);
    if (!error) {
      setRoutines((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => prev - 1);
    }
    setDropdownOpen(null);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (

      <main className="bg-[#0b0b0b] text-white min-h-screen flex">
        
        <div className="p-8 flex-1 max-w-1xl   w-full"> 
     
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
           <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <ListChecks className="text-orange-500" />Workout Routine</h1>
            <p className="text-slate-500 text-sm">Review and manage assigned training routines.</p>
          </div>
          
         
          <div className="flex gap-3 w-full md:w-auto">
           
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder="Search routines..." 
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-blue-500 outline-none transition-all placeholder:text-slate-700"
              />
            </div>
          
            
            {role !== "trainee" && (
            <Link href="/dashboard/routines/new">
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                <ListChecks size={16} /> Add Routine
              </button>
            </Link>
            
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500">
            <div className="h-10 w-10 border-b-2 border-orange-500 rounded-full animate-spin mb-4" />
            <p className="animate-pulse">Loading training Routine...</p>
          </div>
        ) : routines.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-2xl p-20 text-center text-slate-500">
            <p>No active workout routines found.</p>
          </div>
        ) : (
          <>
            <div className="bg-[#111] border border-slate-800 rounded-2xl shadow-2xl overflow-visible backdrop-blur-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616]/50 border-b border-slate-800">
                    <SortableHeader onClick={() => handleSort("title")} label="Routine Title" active={sortColumn === "title"} />
                    <SortableHeader onClick={() => handleSort("trainer_id")} label="Trainer" active={sortColumn === "trainer_id"} />
                    <SortableHeader onClick={() => handleSort("trainee_id")} label="Athlete" active={sortColumn === "trainee_id"} />
                    <SortableHeader onClick={() => handleSort("created_at")} label="Assigned Date" active={sortColumn === "created_at"} center />
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {routines.map((routine) => (
                    <tr key={routine.id} className="hover:bg-white/[0.02] transition-colors group">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                            <ClipboardList size={18} />
                            </div>
                            <div>
                            {/* Link the title here */}
                            <Link 
                                href={`/dashboard/routines/${routine.id}`}
                                className="font-bold text-white hover:text-orange-400 transition-colors uppercase tracking-tight italic"
                            >
                                {routine.title}
                            </Link>
                            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{routine.description}</p>
                            </div>
                        </div>
                        </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <User size={14} className="text-slate-600" />
                          <span className="text-sm font-semibold">{routine.trainer?.first_name} {routine.trainer?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <User size={14} className="text-slate-600" />
                          <span className="text-sm font-semibold">{routine.trainee?.first_name} {routine.trainee?.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs text-slate-500 font-mono">
                        {new Date(routine.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === routine.id ? null : routine.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {dropdownOpen === routine.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-6 mt-2 w-48 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                              >
                                <Link href={`/dashboard/routines/${routine.id}`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors text-slate-300">
                                  <Eye size={14} className="text-orange-400" /> View Exercises
                                </Link>
                             
                                <Link 
                                  href={`/dashboard/routines/${routine.id}/edit`} 
                                 >
                                  <button className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors text-slate-300"  >
                                    <Edit2 size={14} className="text-blue-400" /> Edit Routine
                                  </button>
                                </Link>
                                <button
                                  onClick={() => handleDelete(routine.id)}
                                  className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 border-t border-slate-800 transition-colors"
                                >
                                  <Trash2 size={14} /> Delete Routine
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
              label="Routines"
            />
          </>
        )}
      </div>
    </main>
  );
}

 