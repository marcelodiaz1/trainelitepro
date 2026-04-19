"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { DragDropContext, Draggable, DropResult } from "@hello-pangea/dnd";
import { StrictModeDroppable } from "@/components/dashboard/StrictModeDroppable";
import { 
  ChevronLeft, Save, GripVertical, Trash2, Search, Flame, Dna, Loader2 
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

export default function EditMealPlanClient({ dict, lang }: { dict: any, lang: string }) {
  const router = useRouter();
  const { id } = useParams();
  const t = dict.mealPlanEdit;
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [availableMeals, setAvailableMeals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    trainee_id: "",
    duration: "weekly",
    schedule: DAYS.map(day => ({ day, meals: [] as any[] }))
  });

  useEffect(() => {
    if (id) fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    setDataLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // 1. Fetch Trainees
      const { data: users } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .eq("trainer_id", authUser.id)
        .order("first_name", { ascending: true });

      if (users) setTrainees(users);

      // 2. Fetch Meal Library
      const { data: mealsData } = await supabase
        .from("meals")
        .select(`id, name, ingredients`)
        .order('name', { ascending: true });

      if (mealsData) {
        const allIngredientRelIds = Array.from(new Set(mealsData.flatMap((m: any) => m.ingredients || [])));
        if (allIngredientRelIds.length > 0) {
          const { data: relData } = await supabase
            .from("meal_ingredients")
            .select(`id, amount, ingredients ( field_calories_per_100g_kcal, field_protein_per_100g_g )`)
            .in("id", allIngredientRelIds);

          const lookup: Record<number, any> = {};
          relData?.forEach((item: any) => { lookup[item.id] = item; });

          const processedMeals = mealsData.map((meal: any) => {
            const meal_ingredients = (meal.ingredients || []).map((id: number) => lookup[id]).filter(Boolean);
            const stats = getMealStats(meal_ingredients);
            return { id: meal.id, title: meal.name, calories: stats.calories, protein: stats.protein };
          });
          setAvailableMeals(processedMeals);
        }
      }

      // 3. Preload Plan Data
      const { data: plan } = await supabase.from("meal_plans").select("*").eq("id", id).single();
      if (plan) {
        setFormData({
          title: plan.title,
          trainee_id: plan.trainee_id,
          duration: plan.duration || "weekly",
          schedule: plan.schedule.map((day: any) => ({
            ...day,
            meals: Array.isArray(day.meals) ? day.meals : []
          }))
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const newSchedule = Array.from(formData.schedule);
    
    if (source.droppableId === "available-meals" && destination.droppableId !== "available-meals") {
      const mealToAdd = filteredMeals[source.index];
      const targetDayIndex = newSchedule.findIndex(d => d.day === destination.droppableId);
      
      if (targetDayIndex !== -1) {
        const updatedMeals = [...newSchedule[targetDayIndex].meals];
        updatedMeals.splice(destination.index, 0, { 
          ...mealToAdd, 
          instanceId: Math.random().toString(36).substr(2, 9) 
        });
        newSchedule[targetDayIndex].meals = updatedMeals;
      }
    } 
    else if (source.droppableId !== "available-meals" && destination.droppableId !== "available-meals") {
        const sourceDayIndex = newSchedule.findIndex(d => d.day === source.droppableId);
        const destDayIndex = newSchedule.findIndex(d => d.day === destination.droppableId);
        
        if (sourceDayIndex !== -1 && destDayIndex !== -1) {
            const [movedMeal] = newSchedule[sourceDayIndex].meals.splice(source.index, 1);
            newSchedule[destDayIndex].meals.splice(destination.index, 0, movedMeal);
        }
    }
    setFormData({ ...formData, schedule: newSchedule });
  };

  const removeMeal = (dayName: string, index: number) => {
    const newSchedule = formData.schedule.map(d => {
      if (d.day === dayName) {
        const newMeals = [...d.meals];
        newMeals.splice(index, 1);
        return { ...d, meals: newMeals };
      }
      return d;
    });
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleUpdate = async () => {
    setLoading(true);
    const allMealIds = Array.from(new Set(formData.schedule.flatMap(d => d.meals.map((m: any) => m.id))));

    const { error } = await supabase
        .from("meal_plans")
        .update({
            title: formData.title,
            trainee_id: formData.trainee_id,
            duration: formData.duration,
            schedule: formData.schedule,
            all_meal_ids: allMealIds
        })
        .eq("id", id);

    if (error) alert(error.message);
    else router.push(`/${lang}/dashboard/meal-plans/${id}`);
    setLoading(false);
  };

  const filteredMeals = availableMeals.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <main className="bg-[#050505] text-white min-h-screen flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()}><ChevronLeft className="text-slate-500 hover:text-white transition-colors" /></button>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">{t.title}</h1>
          </div>
          <button 
            onClick={handleUpdate} 
            disabled={loading || !formData.title} 
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-30 px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 shadow-lg transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            {loading ? t.updating : t.updateButton}
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Library */}
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
                    {dataLoading ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-4 h-4 text-orange-500 animate-spin" /></div>
                    ) : filteredMeals.map((meal, index) => (
                      <Draggable key={`lib-${meal.id}`} draggableId={`lib-${meal.id}`} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-[#111] border border-slate-800 p-3 rounded-xl flex items-center gap-3 hover:border-slate-700 transition-all">
                            <GripVertical size={14} className="text-slate-700" />
                            <div className="flex-1 text-left">
                                <div className="text-xs font-bold text-slate-200">{meal.title}</div>
                                <div className="flex gap-3 mt-1">
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-orange-500/70"><Flame size={10} /> {meal.calories}</div>
                                  <div className="flex items-center gap-1 text-[9px] font-bold text-blue-500/70"><Dna size={10} /> {meal.protein}g</div>
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

            {/* Builder */}
            <div className="flex-1 overflow-y-auto p-8 bg-black custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.planTitleLabel}</label>
                        <input className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm transition-colors" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.assignTrainee}</label>
                        <select className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm transition-colors cursor-pointer" value={formData.trainee_id} onChange={e => setFormData({...formData, trainee_id: e.target.value})}>
                            {trainees.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {formData.schedule.map((day) => {
                    const safeMeals = Array.isArray(day.meals) ? day.meals : [];
                    const dayTotalCals = safeMeals.reduce((sum: number, m: any) => sum + (m.calories || 0), 0);
                    const translatedDayName = dict.days?.[day.day] || day.day;
                    
                    return (
                      <div key={day.day} className="bg-[#0b0b0b] border border-slate-800 rounded-2xl p-5 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase text-orange-500 tracking-widest italic">{translatedDayName}</h3>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.total}: {dayTotalCals} kcal</span>
                        </div>
                        <StrictModeDroppable droppableId={day.day}>
                          {(provided, snapshot) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className={`min-h-[100px] rounded-xl border-2 border-dashed transition-all flex flex-wrap gap-3 p-4 ${snapshot.isDraggingOver ? 'border-orange-500/50 bg-orange-500/5' : 'border-slate-800/50'}`}>
                              {safeMeals.map((meal: any, index: number) => (
                                <Draggable key={meal.instanceId} draggableId={meal.instanceId} index={index}>
                                  {(provided) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-black border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3 text-left">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-200">{meal.title}</span>
                                        <span className="text-[9px] text-slate-500">{meal.calories} kcal</span>
                                      </div>
                                      <button onClick={() => removeMeal(day.day, index)} className="text-slate-600 hover:text-red-500 ml-2 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
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