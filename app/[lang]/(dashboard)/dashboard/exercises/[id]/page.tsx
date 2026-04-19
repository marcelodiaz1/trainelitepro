"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  Activity, 
  Target, 
  Layers, 
  Calendar,
  Trash2,
  Edit2
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ExerciseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      
      // Updated query to join both zone and exercise_type tables
      const { data, error } = await supabase
        .from("exercise")
        .select(`
          *,
          zone:field_zone (name),
          type:field_exercise_type (name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching exercise:", error);
        router.push("/dashboard/exercises");
      } else {
        setExercise(data);
      }
      setLoading(false);
    };

    if (id) fetchExercise();
  }, [id, router]);

  if (loading) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 border-t-2 border-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex">
      

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
          <div className="flex items-center gap-4">
            <LocalizedLink href="/dashboard/exercises">
              <ChevronLeft className="text-slate-500 hover:text-white transition-colors" />
            </LocalizedLink>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">
              Movement Details
            </h1>
          </div>
          <div className="flex gap-3">
            {/* Standardized Edit Link */}
            <LocalizedLink href={`/dashboard/exercises/${exercise.id}/edit`}>
              <button className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase transition-all border border-slate-700">
                <Edit2 size={14} className="text-orange-500" /> Edit  
              </button>
            </LocalizedLink>
            <button className="bg-red-900/20 hover:bg-red-900/40 text-red-500 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 border border-red-500/20">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image/Media */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#0b0b0b] p-2 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                <img 
                  src={exercise.field_media_image || "/placeholder-exercise.jpg"} 
                  alt={exercise.title}
                  className="w-full aspect-square object-cover rounded-[2rem] grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </div>

            {/* Right Column: Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#0b0b0b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/10 blur-[80px] rounded-full" />
                
                <div className="relative space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-2 block">
                      Exercise ID: #{exercise.id}
                    </span>
                    <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                      {exercise.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-black/40 p-4 rounded-2xl border border-slate-800/50">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <Target size={12} className="text-orange-500"/> Target Zone
                      </p>
                      <p className="text-lg font-bold text-white capitalize">
                        {exercise.zone?.name || "Unassigned"}
                      </p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-2xl border border-slate-800/50">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <Layers size={12} className="text-orange-500"/> Category
                      </p>
                      <p className="text-lg font-bold text-white capitalize">
                        {/* Accessing the joined table name */}
                        {exercise.type?.name || "Standard"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-600/10 flex items-center justify-center border border-orange-500/20">
                        <Activity className="text-orange-500" size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase">Status</p>
                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Active in Library</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 justify-end">
                        <Calendar size={10} /> Added On
                      </p>
                      <p className="text-xs font-medium text-slate-400">
                        {exercise.created_at ? new Date(exercise.created_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions/Notes Section */}
              <div className="bg-[#0b0b0b] p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                   Movement Notes
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Proper form is essential for this {exercise.type?.name || "category"} movement. Ensure your core is engaged and movements are controlled through the full range of motion.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}