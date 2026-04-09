"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Draggable, DropResult } from "@hello-pangea/dnd";
import { StrictModeDroppable } from "@/components/dashboard/StrictModeDroppable";
import { 
  ChevronLeft, Save, GripVertical, Trash2, Search, Flame, Dna, Loader2 
} from "lucide-react";
import Link from "next/link";

// --- Interfaces for Type Safety ---
interface Meal {
  id: string;
  instanceId: string;
  title: string;
  calories: number;
  protein: string;
}

interface DaySchedule {
  day: string;
  meals: Meal[];
}

interface MealPlanFormData {
  title: string;
  trainee_id: string;
  duration: string;
  schedule: DaySchedule[];
}

// Supabase Initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Nutrition calculation helper
 */
const getMealStats = (mealIngredients: any[] = []) => {
  let totals = { cal: 0, pro: 0 };
  mealIngredients.forEach((mi) => {
    const ing = mi.ingredients;
    if (!ing) return;
    const multiplier = mi.amount / 100;
    totals.cal += (ing.field_calories_per_100g_kcal || 0) * multiplier;
    totals.pro += (ing.field_protein_per_100g_g || 0) * multiplier;
  });
  return {
    calories: Math.round(totals.cal),
    protein: totals.pro.toFixed(1),
  };
};

export default function NewMealPlanClient({ dict, lang }: { dict: any, lang: string }) {
  const router = useRouter();
  const t = dict.mealPlanCreate;

  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MealPlanFormData>({
    title: "",
    trainee_id: "",
    duration: "weekly",
    schedule: [] // Initialized in useEffect to ensure dict is ready
  });

  useEffect(() => {
    const initializePage = async () => {
      try {
        setCheckingAccess(true);
        setDataLoading(true);

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push(`/${lang}/login`);
          return;
        }

        const { data: currentUser, error: userError } = await supabase
          .from("users")
          .select("id, role, selected_plan")
          .eq("id", authUser.id)
          .single();

        if (userError || !currentUser) throw new Error("User profile not found.");
        setTrainerId(currentUser.id);

        // Initialize empty schedule based on dictionary days
        setFormData(prev => ({
          ...prev,
          schedule: t.days.map((dayName: string) => ({ day: dayName, meals: [] }))
        }));

        // --- FETCH TRAINEES ---
        let traineeQuery = supabase.from("users").select("id, first_name, last_name").eq("role", "trainee");
        if (currentUser.role !== 'admin') {
          traineeQuery = traineeQuery.eq("trainer_id", currentUser.id);
        }
        const { data: users } = await traineeQuery;
        if (users) setTrainees(users);

        // --- FETCH MEALS ---
        const { data: mealsData } = await supabase
          .from("meals")
          .select(`id, name, ingredients`)
          .order('name', { ascending: true });

        if (mealsData) {
          const allIngredientRelIds = Array.from(new Set(mealsData.flatMap((m: any) => m.ingredients || [])));
          if (allIngredientRelIds.length > 0) {
            const { data: relData } = await supabase
              .from("meal_ingredients")
              .select(`
                id, amount,
                ingredients ( field_calories_per_100g_kcal, field_protein_per_100g_g )
              `)
              .in("id", allIngredientRelIds);

            const lookup: Record<number, any> = {};
            relData?.forEach((item: any) => { lookup[item.id] = item; });

            const processedMeals: Meal[] = mealsData.map((meal: any) => {
              const meal_ingredients = (meal.ingredients || [])
                .map((id: number) => lookup[id])
                .filter(Boolean);
              const stats = getMealStats(meal_ingredients);
              return {
                id: meal.id,
                instanceId: "", // Logic handled during drag
                title: meal.name,
                calories: stats.calories,
                protein: stats.protein
              };
            });
            setAvailableMeals(processedMeals);
          }
        }

        setCheckingAccess(false);
        setDataLoading(false);
      } catch (err: any) {
        setError(err.message);
        setCheckingAccess(false);
        setDataLoading(false);
      }
    };

    initializePage();
  }, [lang, t.days, router]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const newSchedule: DaySchedule[] = Array.from(formData.schedule);
    
    // CASE 1: Moving from Library to a Day
    if (source.droppableId === "available-meals" && destination.droppableId !== "available-meals") {
      const mealToAdd = filteredMeals[source.index];
      const targetDayIndex = newSchedule.findIndex((d: DaySchedule) => d.day === destination.droppableId);
      
      if (targetDayIndex !== -1) {
        const updatedMeals = [...newSchedule[targetDayIndex].meals];
        updatedMeals.splice(destination.index, 0, { 
          ...mealToAdd, 
          instanceId: Math.random().toString(36).substr(2, 9) 
        });
        newSchedule[targetDayIndex].meals = updatedMeals;
      }
    } 
    // CASE 2: Moving between days or reordering within a day
    else if (source.droppableId !== "available-meals" && destination.droppableId !== "available-meals") {
        const sourceDayIndex = newSchedule.findIndex((d: DaySchedule) => d.day === source.droppableId);
        const destDayIndex = newSchedule.findIndex((d: DaySchedule) => d.day === destination.droppableId);
        
        if (sourceDayIndex !== -1 && destDayIndex !== -1) {
            const [movedMeal] = newSchedule[sourceDayIndex].meals.splice(source.index, 1);
            newSchedule[destDayIndex].meals.splice(destination.index, 0, movedMeal);
        }
    }
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeMeal = (dayName: string, index: number) => {
    const newSchedule = formData.schedule.map((d: DaySchedule) => {
      if (d.day === dayName) {
        const newMeals = [...d.meals];
        newMeals.splice(index, 1);
        return { ...d, meals: newMeals };
      }
      return d;
    });
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSave = async () => {
    if (!trainerId) return;
    setLoading(true);
    const allMealIds = Array.from(new Set(formData.schedule.flatMap(d => d.meals.map((m: Meal) => m.id))));

    const { error: saveError } = await supabase.from("meal_plans").insert({
      title: formData.title,
      trainee_id: formData.trainee_id,
      trainer_id: trainerId,
      duration: formData.duration,
      schedule: formData.schedule,
      all_meal_ids: allMealIds
    });

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
    } else {
      router.push(`/${lang}/dashboard/meal-plans`);
    }
  };

  const filteredMeals = availableMeals.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
        <p className="animate-pulse font-medium tracking-widest text-[10px] uppercase">{t.verifying}</p>
      </div>
    );
  }

  return (
    <main className="bg-[#050505] text-white min-h-screen flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
          <div className="flex items-center gap-4">
            <Link href={`/${lang}/dashboard/meal-plans`}><ChevronLeft className="text-slate-500 hover:text-white transition-colors" /></Link>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">{t.title}</h1>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading || !formData.title || !formData.trainee_id} 
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-30 px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20"
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />} {loading ? t.saving : t.savePlan}
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="w-80 border-r border-slate-800 bg-[#080808] flex flex-col">
              <div className="p-4 border-b border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-600" size={14} />
                  <input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={t.searchPlaceholder} 
                    className="w-full bg-black border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
              
              <StrictModeDroppable droppableId="available-meals" isDropDisabled={true}>
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest text-left">{t.library}</p>
                    {dataLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-4 h-4 text-orange-500 animate-spin" /></div>
                    ) : filteredMeals.map((meal, index) => (
                      <Draggable key={`lib-${meal.id}`} draggableId={`lib-${meal.id}`} index={index}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            className="bg-[#111] border border-slate-800 p-3 rounded-xl flex items-center gap-3 group hover:border-orange-500/50 transition-all cursor-grab active:cursor-grabbing shadow-lg"
                          >
                            <GripVertical size={14} className="text-slate-700" />
                            <div className="flex-1 text-left">
                                <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{meal.title}</div>
                                <div className="flex gap-3 mt-1">
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500/70">
                                    <Flame size={10} /> {meal.calories} kcal
                                  </div>
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500/70">
                                    <Dna size={10} /> {meal.protein}g P
                                  </div>
                                </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-black custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8">
                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-[10px] font-black uppercase">{error}</div>}
                <div className="grid grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.planTitleLabel}</label>
                        <input 
                            className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm transition-colors"
                            placeholder={t.planTitlePlaceholder}
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.assignTrainee}</label>
                        <select 
                            className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm transition-colors cursor-pointer"
                            value={formData.trainee_id}
                            onChange={e => setFormData({...formData, trainee_id: e.target.value})}
                        >
                            <option value="">{t.selectTrainee}</option>
                            {trainees.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {formData.schedule.map((day: DaySchedule) => {
                    const dayTotalCals = day.meals.reduce((sum: number, m: Meal) => sum + m.calories, 0);
                    return (
                      <div key={day.day} className="bg-[#0b0b0b] border border-slate-800 rounded-2xl p-5 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase text-orange-500 tracking-widest italic">{day.day}</h3>
                          {dayTotalCals > 0 && (
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">
                              {t.total}: {dayTotalCals} kcal
                            </span>
                          )}
                        </div>
                        
                        <StrictModeDroppable droppableId={day.day}>
                          {(provided, snapshot) => (
                            <div 
                              {...provided.droppableProps} 
                              ref={provided.innerRef}
                              className={`min-h-[100px] rounded-xl border-2 border-dashed transition-all flex flex-wrap gap-3 p-4 ${
                                snapshot.isDraggingOver ? 'border-orange-500/50 bg-orange-500/5 shadow-inner' : 'border-slate-800/50'
                              }`}
                            >
                              {day.meals.map((meal: Meal, index: number) => (
                                <Draggable key={meal.instanceId} draggableId={meal.instanceId} index={index}>
                                  {(provided) => (
                                    <div 
                                      ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                      className="bg-black border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3 group hover:border-slate-400 transition-all shadow-lg text-left"
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-200">{meal.title}</span>
                                        <span className="text-[9px] text-slate-500">{meal.calories} kcal</span>
                                      </div>
                                      <button onClick={() => removeMeal(day.day, index)} className="text-slate-600 hover:text-red-500 transition-colors ml-2">
                                          <Trash2 size={14} />
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              {day.meals.length === 0 && !snapshot.isDraggingOver && (
                                  <div className="w-full flex justify-center items-center">
                                    <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">{t.dropHere}</p>
                                  </div>
                              )}
                            </div>
                          )}
                        </StrictModeDroppable>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DragDropContext>
        </div>
      </div>
    </main>
  );
}