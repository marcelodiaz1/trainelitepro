"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  ChevronLeft, User, Type, Trash2, Search, GripVertical
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function SortableExerciseRow({ ex, index, exercisesList, updateField, remove, t }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: ex.tempId });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: transform ? 999 : 1 };
  const selectedExercise = exercisesList.find((e: any) => e.id.toString() === ex.exercise_id.toString());
  
  const imageUrl = selectedExercise?.field_media_image;

  return (
    
    <div ref={setNodeRef} style={style} className="grid grid-cols-12 gap-3 bg-[#111] p-4 rounded-2xl border border-slate-800 items-center group">
      <div {...attributes} {...listeners} className="col-span-1 cursor-grab active:cursor-grabbing text-slate-700 hover:text-orange-500 transition-colors">
        <GripVertical size={20} />
      </div>
      
      <div className="col-span-11 md:col-span-5 flex items-center gap-3">  
        <div className="h-12 w-12 rounded-lg bg-black border border-slate-800 overflow-visible flex-shrink-0 relative group/img">
          {imageUrl ? (
            <> 
              <img src={imageUrl} alt="thumb" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute left-14 top-0 z-[100] w-[300px] opacity-0 pointer-events-none group-hover/img:opacity-100 transition-all duration-300 scale-95 group-hover/img:scale-100 shadow-2xl">
                <div className="bg-[#161616] border border-orange-500/30 p-1 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                  <img src={imageUrl} alt="zoom" className="w-full h-auto rounded-lg" />
                  <div className="p-2">
                    <p className="text-[10px] font-black text-orange-500 uppercase">{selectedExercise?.title}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-700 uppercase font-black">N/A</div>
          )}
        </div>
        <div className="truncate text-left">
          <p className="text-[10px] font-black uppercase text-orange-500 mb-0.5">{t.labels.movement}</p>
          <p className="text-sm font-bold text-white truncate">{selectedExercise?.title || t.labels.selectFromLibrary}</p>
        </div>
      </div>
 
      <div className="col-span-3 md:col-span-1 text-left">
        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
          {t.labels.sets}
        </label>

        <input 
          type="number"
          className="w-full bg-black border border-slate-800 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-orange-500 text-white"
          value={ex.sets}
          onChange={(e) => updateField(ex.tempId, "sets", e.target.value)}
        />
      </div>



      <div className="col-span-3 md:col-span-1 text-left">
        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
          {t.labels.weight}
        </label>

        <input 
          type="number"
          step="0.5"
          className="w-full bg-black border border-slate-800 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-orange-500 text-white"
          value={ex.weight_kg} 
          onChange={(e) => updateField(ex.tempId, "weight_kg", e.target.value)}
        />
      </div>


      <div className="col-span-3 md:col-span-1 text-left">
        <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
          {t.labels.rest_period_seconds}
        </label>

        <input 
          type="number"
          className="w-full bg-black border border-slate-800 rounded-lg py-1.5 px-3 text-sm outline-none focus:border-orange-500 text-white"
          value={ex.rest_period_seconds} 
          onChange={(e) => updateField(ex.tempId, "rest_period_seconds", e.target.value)}
        />
      </div>

     
        <div className="col-span-3 md:col-span-2 text-left">
          <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
            {t.labels.target}
          </label>

          <div className="flex gap-2 items-center">

            {/* Type selector */}
            <select
              className="bg-black border border-slate-800 rounded-lg py-1.5 px-2 text-xs text-white outline-none focus:border-orange-500"
              value={ex.target_type}
              onChange={(e) => updateField(ex.tempId, "target_type", e.target.value)}
            >
              <option value="reps">Reps</option>
              <option value="range">Range</option>
              <option value="duration">Time</option>
            </select>


            {/* Reps */}
            {ex.target_type === "reps" && (
              <input
                type="number"
                className="w-20 bg-black border border-slate-800 rounded-lg py-1.5 px-2 text-sm text-white outline-none focus:border-orange-500"
                value={ex.repetitions}
                onChange={(e) =>
                  updateField(ex.tempId, "repetitions", e.target.value)
                }
              />
            )}


            {/* Range */}
            {ex.target_type === "range" && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-14 bg-black border border-slate-800 rounded-lg py-1.5 px-2 text-sm text-white outline-none focus:border-orange-500"
                  value={ex.range_min}
                  onChange={(e) =>
                    updateField(ex.tempId, "range_min", e.target.value)
                  }
                />

                <span className="text-slate-600">-</span>

                <input
                  type="number"
                  className="w-14 bg-black border border-slate-800 rounded-lg py-1.5 px-2 text-sm text-white outline-none focus:border-orange-500"
                  value={ex.range_max}
                  onChange={(e) =>
                    updateField(ex.tempId, "range_max", e.target.value)
                  }
                />
                <span className="text-xs text-slate-500">
                  reps
                </span>
              </div>
            )}


            {/* Duration */}
            {ex.target_type === "duration" && (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  className="w-20 bg-black border border-slate-800 rounded-lg py-1.5 px-2 text-sm text-white outline-none focus:border-orange-500"
                  value={ex.duration}
                  onChange={(e) =>
                    updateField(ex.tempId, "duration", e.target.value)
                  }
                />

                <span className="text-xs text-slate-500">
                  sec
                </span>
              </div>
            )}

          </div>
      </div>
      <div className="col-span-3 md:col-span-1 flex justify-end">
        <button type="button" onClick={() => remove(ex.tempId)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function EditRoutineClient({ dict, lang }: { dict: any; lang: string }) {
  const router = useRouter();
  const { id } = useParams();
  const t = dict.routineEdit;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [fullExerciseLibrary, setFullExerciseLibrary] = useState<any[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<any[]>([]);
  const [availableZones, setAvailableZones] = useState<string[]>(["All"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [routineData, setRoutineData] = useState({ title: "", description: "", trainee_id: "" });
  const [exercises, setExercises] = useState<any[]>([]);

  const [selectedDay, setSelectedDay] = useState(1);
  const visibleExercises = exercises.filter(
    ex => Number(ex.day_number) === Number(selectedDay)
  );
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: tData } = await supabase.from("users").select("id, first_name, last_name").eq("role", "trainee");
      if (tData) setTrainees(tData);

      const { data: eData } = await supabase.from("exercise").select(`*, zone_data:zone!exercise_field_zone_fkey (name)`).order("title");
      if (eData) {
        const flattened = eData.map((ex: any) => ({ ...ex, zone_name: ex.zone_data?.name || "General" }));
        setFullExerciseLibrary(flattened);
        const uniqueZones = Array.from(new Set(flattened.map((ex: any) => ex.zone_name)));
        setAvailableZones(["All", ...uniqueZones.filter(z => z !== "General")]);
      }

      const { data: routine } = await supabase.from("workout_routines").select(`*, exercises:routine_exercises(*)`).eq("id", id).single();
      if (routine) {
        setRoutineData({ title: routine.title, description: routine.description || "", trainee_id: routine.trainee_id });
        setExercises(
          routine.exercises
            .sort((a:any,b:any)=>a.order_index-b.order_index)
            .map((ex:any)=>{

              let targetType = "reps";

              if (ex.duration_seconds)
                targetType = "duration";
              else if (ex.rep_range_min || ex.rep_range_max)
                targetType = "range";

              return {

                tempId: crypto.randomUUID(),

                exercise_id: ex.exercise_id.toString(),

               day_number: Number(ex.day_number),

                weight_kg: ex.weight_kg.toString(),

                sets: ex.sets.toString(),

                repetitions: (ex.repetitions ?? "").toString(),

                duration: (ex.duration_seconds ?? "").toString(),

                range_min: (ex.rep_range_min ?? "").toString(),

                range_max: (ex.rep_range_max ?? "").toString(),

                target_type: targetType,

                rest_period_seconds:
                  ex.rest_period_seconds.toString()
              };
            })
        );
      }
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    setFilteredLibrary(fullExerciseLibrary.filter(ex => 
      ex.title.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedZone === "All" || ex.zone_name === selectedZone)
    ));
  }, [searchTerm, selectedZone, fullExerciseLibrary]);

  const addFromLibrary = (libEx:any)=>{

    setExercises([
      ...exercises,
      {

        tempId: crypto.randomUUID(),

        exercise_id: libEx.id.toString(), 
        day_number: selectedDay,

        weight_kg:"0",

        sets:"3",

        repetitions:"12",

        target_type:"reps",

        duration:"",

        range_min:"8",

        range_max:"10",

        rest_period_seconds:"60"
      }
    ]);

  };

const handleDragEnd = (event: DragEndEvent) => {

  const {active, over} = event;

  if (!over || active.id === over.id) return;


  setExercises(items => {

    const dayItems = items.filter(
      e => Number(e.day_number) === Number(selectedDay)
    );


    const oldIndex = dayItems.findIndex(
      e => e.tempId === active.id
    );


    const newIndex = dayItems.findIndex(
      e => e.tempId === over.id
    );


    const reorderedDay = arrayMove(
      dayItems,
      oldIndex,
      newIndex
    );


    const otherDays = items.filter(
      e => Number(e.day_number) !== Number(selectedDay)
    );


    return [
      ...otherDays,
      ...reorderedDay
    ];

  });

};

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await supabase.from("workout_routines").update({ 
        title: routineData.title, description: routineData.description, trainee_id: routineData.trainee_id 
      }).eq("id", id);
      await supabase.from("routine_exercises").delete().eq("routine_id", id);
     
      await supabase.from("routine_exercises").insert(
  exercises.map((ex) => {

    const dayExercises = exercises.filter(
      e => Number(e.day_number) === Number(ex.day_number)
    );

    const orderIndex = dayExercises.findIndex(
      e => e.tempId === ex.tempId
    );

    return {
      routine_id: id,
      exercise_id: parseInt(ex.exercise_id),

      day_number: Number(ex.day_number),

      order_index: orderIndex,

      weight_kg: parseFloat(ex.weight_kg) || 0,

      sets: parseInt(ex.sets) || 0,

      repetitions:
        ex.target_type === "reps"
          ? parseInt(ex.repetitions) || null
          : null,

      duration_seconds:
        ex.target_type === "duration"
          ? parseInt(ex.duration) || null
          : null,

      rep_range_min:
        ex.target_type === "range"
          ? parseInt(ex.range_min) || null
          : null,

      rep_range_max:
        ex.target_type === "range"
          ? parseInt(ex.range_max) || null
          : null,

      rest_period_seconds:
        parseInt(ex.rest_period_seconds) || 60
    };

  })
);
      router.push(`/${lang}/dashboard/routines/${id}`);
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-slate-500 uppercase font-black italic">{t.loading}</div>;

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
           <div className="flex items-center gap-4">
              <LocalizedLink href={`/${lang}/dashboard/routines/${id}`}><ChevronLeft className="text-slate-500 hover:text-white" /></LocalizedLink>
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">{t.editRoutine}</h1>
           </div>
           <button onClick={handleUpdate} disabled={saving} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
              {saving ? t.saving : t.update}
           </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#050505]">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block flex items-center gap-2"><Type size={12}/> {t.title}</label>
                <input className="w-full bg-transparent text-2xl font-bold outline-none text-white border-b border-slate-800 focus:border-orange-500 pb-2 transition-all" value={routineData.title} onChange={e => setRoutineData({...routineData, title: e.target.value})} />
              </div>
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 text-left">
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block flex items-center gap-2"><User size={12}/> {t.assignAthlete}</label>
                <select className="w-full bg-transparent text-lg font-bold outline-none text-orange-500 cursor-pointer" value={routineData.trainee_id} onChange={e => setRoutineData({...routineData, trainee_id: e.target.value})}>
                  {trainees.map(t => <option key={t.id} value={t.id} className="bg-black text-white">{t.first_name} {t.last_name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 pb-24 text-left">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">{t.movementSequence}</h3>
              <div className="flex gap-2 mb-6 flex-wrap">

                  {[1,2,3,4,5,6,7].map(day=>(

                      <button

                          key={day}

                          onClick={()=>setSelectedDay(day)}

                          className={`px-4 py-2 rounded-xl font-bold transition ${
                              selectedDay===day
                                  ? "bg-orange-600 text-white"
                                  : "bg-slate-900 text-slate-400"
                          }`}

                      >
                          Day {day}
                      </button>

                  ))}

              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext     items={visibleExercises.map(e=>e.tempId)}      strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {visibleExercises.map((ex)=>{

                      const realIndex = exercises.findIndex(e=>e.tempId===ex.tempId);

                      return (

                        <SortableExerciseRow 
                          key={ex.tempId} 
                          ex={ex}  
                          exercisesList={fullExerciseLibrary} 
                          t={t}
                          remove={(tempId: any) =>
                            setExercises(prev =>
                              prev.filter(ex => ex.tempId !== tempId)
                            )
                          }
                          updateField={(tempId: any, field: any, value: any) => {
                            setExercises(prev =>
                              prev.map(ex =>
                                ex.tempId === tempId
                                  ? { ...ex, [field]: value }
                                  : ex
                              )
                            );
                          }}
                        />

                      );

                    })} 
                  </div>
                </SortableContext>
              </DndContext>
              
            {visibleExercises.length === 0 && (
                <div className="h-48 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 italic uppercase font-bold text-xs bg-[#080808]">
                  {t.labels.emptySequence}
                </div>
              )}
            </div>
          </div>

          <div className="w-96 bg-[#0b0b0b] border-l border-slate-800 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-slate-800 space-y-4 bg-[#0d0d0d]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input placeholder={t.filterMovements} className="w-full bg-black border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-orange-500 transition-all text-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {availableZones.map(zone => (
                  <button key={zone} onClick={() => setSelectedZone(zone)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${selectedZone === zone ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    {zone}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#080808]">
              {filteredLibrary.map(ex => (
                <button key={ex.id} onClick={() => addFromLibrary(ex)} className="w-full text-left bg-[#111] hover:bg-[#1a1a1a] border border-slate-800/50 hover:border-orange-500/50 p-3 rounded-2xl transition-all group flex items-center gap-3 relative hover:z-50">
                  <div className="h-10 w-10 rounded-lg bg-black border border-slate-800 flex-shrink-0 relative">
                    {ex.field_media_image ? (
                      <>
                        <img src={ex.field_media_image} alt="thumb" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity rounded-lg" />
                        <div className="absolute left-0 top-0 z-[100] w-[300px] opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 scale-90 group-hover:scale-100 origin-top-left shadow-2xl">
                          <div className="bg-[#161616] border-2 border-orange-500 p-1 rounded-2xl">
                            <img src={ex.field_media_image} alt="zoom" className="w-full h-auto rounded-xl" />
                          </div>
                        </div>
                      </>
                    ) : <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-800 uppercase font-bold">N/A</div>}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[9px] font-black uppercase text-slate-600 group-hover:text-orange-500 mb-0.5">{ex.zone_name}</p>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white truncate">{ex.title}</h4>
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