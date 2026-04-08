"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Search, 
  MoreVertical,
  Edit2,
  Trash2,
  Activity,
  ExternalLink
} from "lucide-react";
import SortableHeader from "@/components/dashboard/SortableHeader";
import Pagination from "@/components/dashboard/Pagination";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Exercise {
  id: number;
  title: string;
  field_exercise_type: string;
  field_zone: string;
  field_media_image: string;
}

interface Zone { id: number; name: string; }
interface ExType { id: number; name: string; }

export default function ExercisesTableClient({ dict, lang }: { dict: any; lang: string }) {
  const t = dict?.exercises || {};
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [exTypes, setExTypes] = useState<ExType[]>([]); 
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof Exercise>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const [zoneRes, typeRes] = await Promise.all([
        supabase.from("zone").select("*"),
        supabase.from("exercise_type").select("*")
      ]);

      if (zoneRes.data) setZones(zoneRes.data);
      if (typeRes.data) setExTypes(typeRes.data);

      const { count } = await supabase
        .from("exercise")
        .select("id", { count: "exact", head: true });
      setTotal(count || 0);

      const { data, error } = await supabase
        .from("exercise")
        .select("*")
        .order(sortColumn, { ascending: sortOrder === "asc" })
        .range(from, to);

      if (!error) setExercises(data as Exercise[]);
      setLoading(false);
    };

    fetchData();
  }, [page, sortColumn, sortOrder]);

  const handleSort = (column: keyof Exercise) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 max-w-1xl w-full"> 
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <Activity className="text-orange-500" /> {t.title}
            </h1>
            <p className="text-slate-500 text-sm">{t.subtitle}</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder} 
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-orange-500 outline-none transition-all placeholder:text-slate-700 text-white"
              />
            </div>
             
            <Link href={`/${lang}/dashboard/exercises/new`}>
              <button className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                <Activity size={16} /> {t.addExercise}
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-500 animate-pulse">
            <div className="h-10 w-10 border-b-2 border-orange-500 rounded-full animate-spin mb-4" />
            <p>{t.loading}</p>
          </div>
        ) : (
          <>
            <div className="bg-[#111] border border-slate-800 rounded-2xl shadow-2xl overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616]/50 border-b border-slate-800">
                    <SortableHeader onClick={() => handleSort("title")} label={t.table?.name} active={sortColumn === "title"} />
                    <SortableHeader onClick={() => handleSort("field_zone")} label={t.table?.zone} active={sortColumn === "field_zone"} />
                    <SortableHeader onClick={() => handleSort("field_exercise_type")} label={t.table?.type} active={sortColumn === "field_exercise_type"} />
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">{t.table?.preview}</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-slate-600 text-right">{t.table?.actions}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {exercises.map((exercise) => (
                    <tr key={exercise.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-semibold text-white transition-colors">
                        <Link href={`/${lang}/dashboard/exercises/${exercise.id}`} className="hover:text-orange-500 transition-colors cursor-pointer">
                          {exercise.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-black uppercase text-slate-300"> 
                          {zones.find(z => z.id.toString() === exercise.field_zone?.toString())?.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-black uppercase text-orange-400"> 
                          {exTypes.find(t => t.id.toString() === exercise.field_exercise_type?.toString())?.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end">
                          <img 
                            src={exercise.field_media_image || "/placeholder.jpg"} 
                            className="w-10 h-10 object-cover rounded-md bg-slate-900 border border-slate-700 grayscale group-hover:grayscale-0 transition-all" 
                            alt="" 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === exercise.id ? null : exercise.id)}
                          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openDropdownId === exercise.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                            <div className="absolute right-6 mt-2 w-40 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden text-left">
                              <Link href={`/${lang}/dashboard/exercises/${exercise.id}`} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-slate-800 transition-colors text-slate-300 border-b border-slate-800">
                                <ExternalLink size={14} className="text-orange-500" /> {t.actions?.view}
                              </Link>
                              
                              <Link href={`/${lang}/dashboard/exercises/${exercise.id}/edit`}>
                                <button className="flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-tight hover:bg-slate-800 transition-colors text-slate-300 border-t border-slate-800/50">
                                  <Edit2 size={14} className="text-slate-400" /> {t.actions?.edit}
                                </button>
                              </Link>

                              <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium hover:bg-red-500/10 transition-colors text-red-400 border-t border-slate-800">
                                <Trash2 size={14} /> {t.actions?.delete}
                              </button>
                            </div>
                          </>
                        )}
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
               label={t.title}
             />
          </>
        )}
      </div>
    </main>
  );
}