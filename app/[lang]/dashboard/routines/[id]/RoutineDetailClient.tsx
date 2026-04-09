"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, Dumbbell, Clock, User, Target, Zap, Pencil 
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RoutineDetailClient({ dict, lang }: { dict: any; lang: string }) {
  const { id } = useParams();
  const t = dict.routineDetail;
  const [routine, setRoutine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullRoutine = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("workout_routines")
        .select(`
          *,
          trainer:users!trainer_id(first_name, last_name, specialty),
          trainee:users!trainee_id(first_name, last_name),
          exercises:routine_exercises(
            id, weight_kg, repetitions, sets, rest_period_seconds, order_index,
            exercise_info:exercise!exercise_id(
              name:title, 
              category:field_exercise_type, 
              muscle_group:field_zone,
              field_media_image:field_media_image
            ) 
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Database Error:", error.message);
      } else {
        const sortedExercises = data.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
        setRoutine({ ...data, exercises: sortedExercises });
      }
      setLoading(false);
    };
    if (id) fetchFullRoutine();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">{t.loading}</div>;

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <Link href={`/${lang}/dashboard/routines`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft size={16} /> {t.back}
          </Link>

          <Link 
            href={`/${lang}/dashboard/routines/${id}/edit`} 
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20"
          >
            <Pencil size={16} />
            <span className="text-sm">{t.edit}</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 text-left">
          <div className="flex-1">
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">{routine.title}</h1>
            <p className="text-slate-400 text-lg leading-relaxed">{routine.description || t.noDescription}</p>
          </div>
          
          <div className="bg-[#111] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 min-w-[240px]">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User size={24} />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{t.client}</p>
              <p className="text-white font-bold">{routine.trainee?.first_name} {routine.trainee?.last_name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Dumbbell size={18} />} label={t.stats.exercises} value={routine.exercises.length} color="orange" />
          <StatCard icon={<Zap size={18} />} label={t.stats.totalSets} value={routine.exercises.reduce((acc: number, curr: any) => acc + curr.sets, 0)} color="blue" />
          <StatCard icon={<Target size={18} />} label={t.stats.focusArea} value={routine.trainer?.specialty || "General"} color="green" />
          <StatCard icon={<Clock size={18} />} label={t.stats.time} value={t.estTime} color="slate" />
        </div>

        <div className="bg-[#111] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#161616] border-b border-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">{t.table.image}</th>
                <th className="px-6 py-4">{t.table.exercise}</th>
                <th className="px-6 py-4">{t.table.weight}</th>
                <th className="px-6 py-4 text-center">{t.table.volume}</th>
                <th className="px-6 py-4 text-right">{t.table.rest}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {routine.exercises.map((ex: any, idx: number) => (
                <tr key={ex.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-6 font-mono text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-6">
                    <div className="h-10 w-10 rounded-lg bg-black border border-slate-800 flex-shrink-0 relative">
                      {ex.exercise_info?.field_media_image ? (
                        <>
                          <img 
                            src={ex.exercise_info.field_media_image} 
                            alt="thumb" 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity rounded-lg" 
                          />
                          <div className="absolute left-12 top-0 z-[100] w-[250px] opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 origin-left shadow-2xl">
                            <div className="bg-[#161616] border-2 border-orange-500 p-1 rounded-xl">
                              <img src={ex.exercise_info.field_media_image} alt="zoom" className="w-full h-auto rounded-lg" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-800 uppercase font-bold">N/A</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-left">
                    <p className="font-bold text-white text-lg">{ex.exercise_info?.name || t.table.unknown}</p>
                    <p className="text-xs text-slate-500 mt-0.5 uppercase">{ex.exercise_info?.muscle_group} • {ex.exercise_info?.category}</p>
                  </td>
                  <td className="px-6 py-6 font-bold text-white text-lg text-left">
                    {ex.weight_kg} <span className="text-xs text-slate-500 font-normal ml-1">kg</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg font-bold text-white">
                      {ex.sets} × {ex.repetitions}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right text-slate-400 font-medium">
                    {ex.rest_period_seconds}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    orange: "text-orange-500 bg-orange-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    green: "text-green-500 bg-green-500/10",
    slate: "text-slate-400 bg-slate-400/10"
  };

  return (
    <div className="bg-[#111] border border-slate-800 p-5 rounded-2xl flex flex-col gap-3 text-left">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}