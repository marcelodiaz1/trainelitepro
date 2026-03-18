"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "@/components/dashboard/Sidebar";
import { 
  ChevronLeft, 
  Dumbbell, 
  Clock, 
  User, 
  Target, 
  Zap,
  Weight,
  Pencil
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RoutineDetailPage() {
  const { id } = useParams();
  const router = useRouter();
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
                image:field_media_image
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
  }, [id, router]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-400">Loading routine details...</div>;

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      

      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard/routines" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft size={16} /> Back to Routines
          </Link>

          <Link 
            href={`/dashboard/routines/${id}/edit`} 
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20"
          >
            <Pencil size={16} />
            <span className="text-sm">Edit Routine</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
              {routine.title}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">{routine.description || "No description provided."}</p>
          </div>
          
          <div className="bg-[#111] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 min-w-[240px]">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Client</p>
              <p className="text-white font-bold">{routine.trainee?.first_name} {routine.trainee?.last_name}</p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Dumbbell size={18} />} label="Exercises" value={routine.exercises.length} color="orange" />
          <StatCard icon={<Zap size={18} />} label="Total Sets" value={routine.exercises.reduce((acc: number, curr: any) => acc + curr.sets, 0)} color="blue" />
          <StatCard icon={<Target size={18} />} label="Focus Area" value={routine.trainer?.specialty || "General"} color="green" />
          <StatCard icon={<Clock size={18} />} label="Est. Time" value="45-60m" color="slate" />
        </div>

        {/* Exercise Table */}
        <div className="bg-[#111] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#161616] border-b border-slate-800 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Exercise</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4 text-center">Volume</th>
                <th className="px-6 py-4 text-right">Rest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {routine.exercises.map((ex: any, idx: number) => (
                <tr key={ex.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-6 font-mono text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-6">
                    <p className="font-bold text-white text-lg">{ex.exercise_info?.name || "Unknown Exercise"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{ex.exercise_info?.muscle_group} • {ex.exercise_info?.category}</p>
                  </td>
                  <td className="px-6 py-6 font-bold text-white text-lg">
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
    <div className="bg-[#111] border border-slate-800 p-5 rounded-2xl flex flex-col gap-3">
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