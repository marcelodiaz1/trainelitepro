"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, Save, Trash2, Search, Flame, Dna, Utensils, Info, 
  Image as ImageIcon, Loader2
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditMealClient({ dict, lang }: { dict: any, lang: string }) {
  const router = useRouter();
  const { id } = useParams();
  const t = dict.editMeal;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allIngredients, setAllIngredients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [name, setName] = useState("");
  const [pictureUrl, setPictureUrl] = useState("");
  const [recipe, setRecipe] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const init = async () => {
      await fetchIngredients();
      if (id) await fetchMealData();
    };
    init();
  }, [id]);

  const fetchIngredients = async () => {
    const { data } = await supabase
      .from("ingredients")
      .select("*")
      .order("name", { ascending: true });
    if (data) setAllIngredients(data);
  };

  const fetchMealData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: meal, error: mealError } = await supabase
        .from("meals")
        .select("*")
        .eq("id", id)
        .single();

      if (meal) {
        setName(meal.name || "");
        setPictureUrl(meal.picture_url || "");
        setRecipe(meal.recipe || "");

        if (meal.ingredients && meal.ingredients.length > 0) {
          const { data: rels } = await supabase
            .from("meal_ingredients")
            .select(`id, amount, measure, ingredient_tid, ingredients (*)`)
            .in("id", meal.ingredients);

          if (rels) {
            const mapped = rels.map((r: any) => ({
              ...r.ingredients,
              id: r.ingredient_tid,
              relId: r.id, 
              amount: r.amount,
              measure: r.measure
            }));
            setSelectedIngredients(mapped);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = (ing: any) => {
    if (selectedIngredients.find(item => item.id === ing.id)) return;
    setSelectedIngredients([...selectedIngredients, { ...ing, amount: 100, measure: "g" }]);
    setSearchTerm("");
  };

  const removeIngredient = (id: number) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.id !== id));
  };

  const updateAmount = (id: number, amount: number) => {
    setSelectedIngredients(selectedIngredients.map(item => 
      item.id === id ? { ...item, amount } : item
    ));
  };

  const totals = selectedIngredients.reduce((acc, curr) => {
    const mult = (curr.amount || 0) / 100;
    return {
      cal: acc.cal + (curr.field_calories_per_100g_kcal || 0) * mult,
      pro: acc.pro + (curr.field_protein_per_100g_g || 0) * mult,
      carb: acc.carb + (curr.field_carbs_per_100g_g || 0) * mult,
      fat: acc.fat + (curr.field_fat_per_100g_g || 0) * mult,
    };
  }, { cal: 0, pro: 0, carb: 0, fat: 0 });

  const handleUpdate = async () => {
    if (!name || selectedIngredients.length === 0) return alert(t.missingData);
    setSaving(true);

    let finalImageUrl = pictureUrl;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `meal-previews/${fileName}`;
        await supabase.storage.from("meal-images").upload(filePath, selectedFile);
        const { data: { publicUrl } } = supabase.storage.from("meal-images").getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      }

      const { data: insertedRels, error: relError } = await supabase
        .from("meal_ingredients")
        .insert(selectedIngredients.map((item) => ({
          ingredient_tid: item.id,
          amount: item.amount,
          measure: item.measure,
        })))
        .select("id");

      if (relError) throw relError;

      await supabase
        .from("meals")
        .update({
          name,
          picture_url: finalImageUrl,
          recipe,
          ingredients: insertedRels.map((r) => r.id),
          total_calories: totals.cal,
          total_protein: totals.pro,
          total_carbs: totals.carb,
          total_fat: totals.fat,
        })
        .eq("id", id);

      router.push(`/${lang}/dashboard/meals/${id}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredSearch = allIngredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedIngredients.find(s => s.id === i.id)
  ).slice(0, 5);

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" />
    </div>
  );

  return (
    <main className="bg-[#050505] text-white min-h-screen flex">
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <ChevronLeft className="text-slate-500" />
            </button>
            <h1 className="text-xl font-black uppercase italic tracking-tighter">
              {t.header}: {name}
            </h1>
          </div>
          <button 
            onClick={handleUpdate} 
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-500 disabled:opacity-30 px-6 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-900/20"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            {saving ? t.updating : t.updateButton}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-[#0b0b0b] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative h-64 group">
                <img 
                  src={pictureUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053"} 
                  className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" 
                  alt="Meal Preview" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-2 block">{t.visualReference}</span>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">{name || t.unnamed}</h2>
                </div>
              </section>

              <section className="bg-[#0b0b0b] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-orange-500 font-bold uppercase text-[10px] tracking-widest">
                  <Info size={14} /> {t.basicDetails}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">{t.mealNameLabel}</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">{t.changeImage}</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      id="meal-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setPictureUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <label 
                      htmlFor="meal-upload"
                      className={`flex items-center justify-center gap-3 w-full bg-black border-2 border-dashed rounded-xl px-4 py-[11px] cursor-pointer transition-all ${
                        selectedFile ? "border-orange-600 text-orange-500" : "border-slate-800 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      <ImageIcon size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">
                        {selectedFile ? selectedFile.name : t.selectImage}
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-2">{t.recipeLabel}</label>
                  <textarea 
                    rows={6}
                    value={recipe}
                    onChange={e => setRecipe(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500 text-sm resize-none transition-all"
                  />
                </div>
              </section>

              <section className="bg-[#0b0b0b] border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-orange-500 font-bold uppercase text-[10px] tracking-widest">
                    <Utensils size={14} /> {t.ingredientMix}
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    <input 
                      type="text"
                      placeholder={t.addIngredientPlaceholder}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-black border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedIngredients.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-black border border-slate-800 p-3 rounded-xl">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-200">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          value={item.amount}
                          onChange={e => updateAmount(item.id, Number(e.target.value))}
                          className="w-20 bg-[#111] border border-slate-800 rounded-lg px-2 py-1 text-xs text-center text-orange-500 font-bold outline-none"
                        />
                        <button onClick={() => removeIngredient(item.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-orange-600 rounded-2xl p-6 shadow-2xl shadow-orange-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-[10px] font-black uppercase text-orange-200 tracking-widest mb-6 italic">{t.mealSummary}</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-orange-500 pb-2">
                      <span className="text-xs font-bold uppercase text-orange-100 flex items-center gap-2"><Flame size={16}/> {t.calories}</span>
                      <span className="text-2xl font-black italic">{Math.round(totals.cal)} <small className="text-[10px] uppercase opacity-60 font-normal">kcal</small></span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <SummaryRow label={t.protein} value={`${totals.pro.toFixed(1)}g`} icon={<Dna size={14}/>} />
                      <SummaryRow label={t.carbs} value={`${totals.carb.toFixed(1)}g`} />
                      <SummaryRow label={t.fat} value={`${totals.fat.toFixed(1)}g`} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({ label, value, icon }: { label: string, value: string, icon?: any }) {
  return (
    <div className="flex justify-between items-center bg-orange-700/30 p-3 rounded-xl border border-orange-400/20">
      <span className="text-[10px] font-black uppercase text-orange-100 flex items-center gap-2">{icon}{label}</span>
      <span className="text-sm font-black">{value}</span>
    </div>
  );
}