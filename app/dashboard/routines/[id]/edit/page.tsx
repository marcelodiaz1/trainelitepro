"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  ChevronLeft, User, Type, Plus, Trash2, Search, GripVertical
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- Sortable Item Component ---
function SortableExerciseRow({ ex, index, exercisesList, updateField, remove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: ex.tempId });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: transform ? 999 : 1 };
  const selectedExercise = exercisesList.find((e: any) => e.id.toString() === ex.exercise_id.toString());

  return (
    <div 
        ref={setNodeRef} 
        style={style} 
        className="grid grid-cols-12 gap-3 bg-[#111] p-4 rounded-2xl border border-slate-800 items-center group relative  z-0 hover:z-[999] transition-all"
      >
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="col-span-1 cursor-grab active:cursor-grabbing text-slate-700 hover:text-orange-500 transition-colors">
          <GripVertical size={20} />
        </div>

        {/* Movement Column with Image + Zoom */}
        <div className="col-span-11 md:col-span-4 flex items-center gap-3 relative">
          
          {/* THUMBNAIL CONTAINER */}
          <div className="h-12 w-12 rounded-lg bg-black border border-slate-800 overflow-visible flex-shrink-0 relative group/img">
            {selectedExercise?.field_media_image ? (
              <>
                <img 
                  src={selectedExercise.field_media_image} 
                  alt="thumb" 
                  className="w-full h-full object-cover rounded-lg opacity-80 group-hover/img:opacity-100 transition-opacity" 
                />

                {/* FLOATING ZOOM PREVIEW */}
                <div className="absolute left-0 bottom-0 z-[1000] w-[300px] opacity-0 pointer-events-none group-hover/img:opacity-100 transition-all duration-300 scale-90 group-hover/img:scale-100 origin-top-left shadow-2xl">
                 <div className="bg-[#161616] border-2 border-orange-500 p-1 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                    <img 
                      src={selectedExercise.field_media_image} 
                      alt="zoom" 
                      className="w-full h-auto rounded-xl" 
                    />
                    <div className="p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                        {selectedExercise?.zone_data?.name || "Exercise Detail"}
                      </p>
                      <h4 className="text-sm font-bold text-white uppercase italic truncate">
                        {selectedExercise?.title}
                      </h4>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-700 uppercase font-black">
                N/A
              </div>
            )}
          </div>

          {/* Text Info */}
          <div className="truncate">
            <p className="text-[10px] font-black uppercase text-orange-500 mb-0.5">Movement</p>
            <p className="text-sm font-bold text-white truncate">
              {selectedExercise?.title || "Loading movement..."}
            </p>
          </div>
        </div>

        {/* Sets Input */}
        <div className="col-span-3 md:col-span-2">
          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Sets</label>
          <input type="number" className="w-full bg-black border border-slate-800 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-orange-500 text-white" value={ex.sets} onChange={(e) => updateField(index, "sets", e.target.value)} />
        </div>

        {/* Reps Input */}
        <div className="col-span-3 md:col-span-2">
          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Reps</label>
          <input type="number" className="w-full bg-black border border-slate-800 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-orange-500 text-white" value={ex.repetitions} onChange={(e) => updateField(index, "repetitions", e.target.value)} />
        </div>

        {/* Weight Input */}
        <div className="col-span-3 md:col-span-2">
          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Weight</label>
          <input type="number" step="0.5" className="w-full bg-black border border-slate-800 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-orange-500 text-white" value={ex.weight_kg} onChange={(e) => updateField(index, "weight_kg", e.target.value)} />
        </div>

        {/* Delete Button */}
        <div className="col-span-3 md:col-span-1 flex justify-end">
          <button type="button" onClick={() => remove(index)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
  );
}

export default function EditRoutinePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [trainees, setTrainees] = useState<any[]>([]);
  const [fullExerciseLibrary, setFullExerciseLibrary] = useState<any[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<any[]>([]);
  const [availableZones, setAvailableZones] = useState<string[]>(["All"]);
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");

  const [routineData, setRoutineData] = useState({ title: "", description: "", trainee_id: "" });
  const [exercises, setExercises] = useState<any[]>([]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. Get Session & Trainer Profile
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: publicUser } = await supabase.from("users").select("id").eq("id", authUser.id).single();
        if (publicUser) setTrainerId(publicUser.id);
      }

      // 2. Fetch Trainees
      const { data: tData } = await supabase.from("users").select("id, first_name, last_name").eq("role", "trainee");
      if (tData) setTrainees(tData);

      // 3. Fetch Exercises with Zone Join
      const { data: eData } = await supabase
        .from("exercise")
        .select(`*, zone_data:zone!exercise_field_zone_fkey (name)`)
        .order("title");

      let flattenedLibrary: any[] = [];
      if (eData) {
        flattenedLibrary = eData.map((ex: any) => ({
          ...ex,
          zone_name: ex.zone_data?.name || "General"
        }));
        setFullExerciseLibrary(flattenedLibrary);
        setFilteredLibrary(flattenedLibrary);
        
        const uniqueZones = Array.from(new Set(flattenedLibrary.map((ex: any) => ex.zone_name)));
        setAvailableZones(["All", ...uniqueZones.filter(z => z !== "General")]);
      }

      // 4. Fetch the existing Routine
      const { data: routine, error: rError } = await supabase
        .from("workout_routines")
        .select(`*, exercises:routine_exercises(*)`)
        .eq("id", id)
        .single();

      if (rError) {
        setError("Could not load routine.");
      } else if (routine) {
        setRoutineData({ 
          title: routine.title, 
          description: routine.description || "", 
          trainee_id: routine.trainee_id 
        });

        const mappedExercises = routine.exercises
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((ex: any) => ({
            tempId: Math.random().toString(36).substr(2, 9),
            exercise_id: ex.exercise_id.toString(),
            weight_kg: ex.weight_kg.toString(),
            repetitions: ex.repetitions.toString(),
            sets: ex.sets.toString(),
            rest_period_seconds: ex.rest_period_seconds.toString()
          }));
        setExercises(mappedExercises);
      }
      setLoading(false);
    };

    if (id) fetchData();
  }, [id]);

  // Filter Logic
  useEffect(() => {
    let filtered = fullExerciseLibrary.filter(ex => 
      ex.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedZone === "All" || ex.zone_name === selectedZone)
    );
    setFilteredLibrary(filtered);
  }, [searchTerm, selectedZone, fullExerciseLibrary]);

  const addFromLibrary = (libEx: any) => {
    setExercises([...exercises, { 
      tempId: Math.random().toString(36).substr(2, 9), 
      exercise_id: libEx.id.toString(), 
      weight_kg: "0", repetitions: "12", sets: "3", rest_period_seconds: "60" 
    }]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex(i => i.tempId === active.id);
        const newIndex = items.findIndex(i => i.tempId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error: rUpdateError } = await supabase
        .from("workout_routines")
        .update({ 
          title: routineData.title, 
          description: routineData.description,
          trainee_id: routineData.trainee_id 
        })
        .eq("id", id);

      if (rUpdateError) throw rUpdateError;

      await supabase.from("routine_exercises").delete().eq("routine_id", id);

      const finalExercises = exercises.map((ex, idx) => ({
        routine_id: id,
        exercise_id: parseInt(ex.exercise_id),
        weight_kg: parseFloat(ex.weight_kg) || 0,
        repetitions: parseInt(ex.repetitions) || 0,
        sets: parseInt(ex.sets) || 0,
        rest_period_seconds: parseInt(ex.rest_period_seconds) || 60,
        order_index: idx
      }));

      const { error: eInsertError } = await supabase.from("routine_exercises").insert(finalExercises);
      if (eInsertError) throw eInsertError;

      router.push(`/dashboard/routines/${id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-500 uppercase font-black italic">Loading Data...</div>;

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex h-screen overflow-hidden">
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
           <div className="flex items-center gap-4">
              <Link href={`/dashboard/routines/${id}`}><ChevronLeft className="text-slate-500 hover:text-white" /></Link>
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Edit Routine</h1>
           </div>
           <button onClick={handleUpdate} disabled={saving} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20">
              {saving ? "Saving Changes..." : "Update Routine"}
           </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#050505]">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl">
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block flex items-center gap-2"><Type size={12}/> Title</label>
                <input className="w-full bg-transparent text-2xl font-bold outline-none text-white border-b border-slate-800 focus:border-orange-500 pb-2 transition-all" value={routineData.title} onChange={e => setRoutineData({...routineData, title: e.target.value})} />
              </div>
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl">
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block flex items-center gap-2"><User size={12}/> Assign Athlete</label>
                <select className="w-full bg-transparent text-lg font-bold outline-none text-orange-500 cursor-pointer" value={routineData.trainee_id} onChange={e => setRoutineData({...routineData, trainee_id: e.target.value})}>
                  {trainees.map(t => <option key={t.id} value={t.id} className="bg-black text-white">{t.first_name} {t.last_name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 pb-24">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Movement Sequence</h3>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={exercises.map(ex => ex.tempId)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {exercises.map((ex, index) => (
                      <SortableExerciseRow 
                        key={ex.tempId} 
                        ex={ex} 
                        index={index} 
                        exercisesList={fullExerciseLibrary} 
                        remove={(i: any) => setExercises(exercises.filter((_, idx) => idx !== i))}
                        updateField={(i: any, f: any, v: any) => {
                          const next = [...exercises];
                          next[i][f] = v;
                          setExercises(next);
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="w-96 bg-[#0b0b0b] border-l border-slate-800 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-slate-800 space-y-4 bg-[#0d0d0d]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input placeholder="Filter Movements..." className="w-full bg-black border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-orange-500 transition-all text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {availableZones.map(zone => (
                  <button 
                    key={zone} 
                    onClick={() => setSelectedZone(zone)} 
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${
                      selectedZone === zone 
                        ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/20' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#080808]">
              {filteredLibrary.map(ex => (
                <button 
                  key={ex.id} 
                  onClick={() => addFromLibrary(ex)} 
                  /* hover:z-50 is the key to make this row sit on top of others when hovered */
                  className="w-full text-left bg-[#111] hover:bg-[#1a1a1a] border border-slate-800/50 hover:border-orange-500/50 p-3 rounded-2xl transition-all group active:scale-[0.98] flex items-center gap-3 relative hover:z-50"
                >
                  <div className="h-10 w-10 rounded-lg bg-black border border-slate-800 flex-shrink-0 relative">
                    {ex.field_media_image ? (
                      <>
                        <img 
                          src={ex.field_media_image} 
                          alt={ex.title} 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity rounded-lg" 
                        />
                        
                        {/* FLOATING ZOOM: Centered and "Popping" up */}
                        <div className="absolute left-0 top-0 z-[100] w-[300px] opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 origin-top-left">
                          <div className="bg-[#161616] border-2 border-orange-500 p-1 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,1)]">
                            <img 
                              src={ex.field_media_image} 
                              alt="zoom" 
                              className="w-full h-auto rounded-xl" 
                            />
                            <div className="p-3 bg-gradient-to-t from-black to-transparent">
                              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{ex.zone_name}</p>
                              <h4 className="text-sm font-bold text-white uppercase italic">{ex.title}</h4>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-800 uppercase font-bold">No Img</div>
                    )}
                  </div>

                  <div className="flex-1 truncate">
                    <p className="text-[9px] font-black uppercase text-slate-600 group-hover:text-orange-500 mb-0.5 transition-colors">{ex.zone_name}</p>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{ex.title}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}