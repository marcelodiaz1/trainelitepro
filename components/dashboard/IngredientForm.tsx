"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Apple, Save, X, Loader2, Upload, Image as ImageIcon } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LookupItem {
  id: number;
  name: string;
}

interface Props {
  initialData?: any;
  isEditing?: boolean;
}

interface LookupState {
  ethical: LookupItem[];
  medical: LookupItem[];
  religious: LookupItem[];
  categories: LookupItem[]; // Add this
}
export default function IngredientForm({ initialData, isEditing }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [lookups, setLookups] = useState<LookupState>({ 
    ethical: [], 
    medical: [], 
    religious: [] ,
    categories: []  
  });

  const [formData, setFormData] = useState({
    name: "",
    field_category: null as number | null,
    field_calories_per_100g_kcal: 0,
    field_protein_per_100g_g: 0,
    field_carbs_per_100g_g: 0,
    field_fat_per_100g_g: 0,
    field_fiber_per_100g_g: 0,
    field_dietary_restrictions_ethic: "",
    field_dietary_restrictions_medic: "",
    field_dietary_restrictions_relig: "",
    field_media_image: ""
  });

useEffect(() => {
  const fetchOptions = async () => {
    const [e, m, r, c] = await Promise.all([
      supabase.from("etical_diet").select("id, name"),
      supabase.from("medical_diet").select("id, name"),
      supabase.from("religious_diet").select("id, name"),
      supabase.from("ingred_category").select("id, name").order("name"), // Fetch categories
    ]);
    
    setLookups({ 
      ethical: e.data as LookupItem[] || [], 
      medical: m.data as LookupItem[] || [], 
      religious: r.data as LookupItem[] || [],
      categories: c.data as LookupItem[] || [] // Set categories
    });
  };
  fetchOptions(); 

    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Image Upload Logic
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `ingredients/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("ingredients")
      .upload(filePath, file);

    if (uploadError) {
      alert("Error uploading image!");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("ingredients")
      .getPublicUrl(filePath);

    setFormData({ ...formData, field_media_image: publicUrl });
    setUploading(false);
  };

  const handleDietToggle = (id: number, field: string) => {
    const currentStr = formData[field as keyof typeof formData] as string || "";
    let ids = currentStr.split("|").filter(Boolean);
    
    if (ids.includes(id.toString())) {
      ids = ids.filter(i => i !== id.toString());
    } else {
      ids.push(id.toString());
    }
    
    setFormData({ ...formData, [field]: ids.length > 0 ? `|${ids.join("|")}|` : "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = isEditing 
      ? await supabase.from("ingredients").update(formData).eq("id", initialData.id)
      : await supabase.from("ingredients").insert([formData]);

    if (!error) {
      router.push("/dashboard/ingredients");
      router.refresh();
    } else {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info & Image */}
        <div className="space-y-6 bg-[#111] p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">General Info</h2>
          
          {/* Image Upload Area */}
          <div className="flex items-center gap-6 p-4 bg-black/40 rounded-xl border border-dashed border-slate-800">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center group">
              {formData.field_media_image ? (
                <img src={formData.field_media_image} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <ImageIcon className="text-slate-700" size={32} />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-orange-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[10px] uppercase text-slate-500 mb-2 font-bold">Ingredient Image</label>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all"
              >
                <Upload size={14} /> {formData.field_media_image ? "Change Image" : "Upload Image"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase text-slate-500 mb-2">Ingredient Name</label>
            <input 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-2 gap-4 bg-[#111] p-6 rounded-2xl border border-slate-800 h-fit">
          <h2 className="col-span-2 text-xs font-black uppercase tracking-widest text-emerald-500 mb-4">Nutritional Values (100g)</h2>
          {[
            {label: 'Kcal', key: 'field_calories_per_100g_kcal'},
            {label: 'Protein', key: 'field_protein_per_100g_g'},
            {label: 'Carbs', key: 'field_carbs_per_100g_g'},
            {label: 'Fat', key: 'field_fat_per_100g_g'},
            {label: 'Fiber', key: 'field_fiber_per_100g_g'}
          ].map((item) => (
            <div key={item.key}>
              <label className="block text-[10px] uppercase text-slate-500 mb-2">{item.label}</label>
              <input 
                type="number" step="0.01"
                value={formData[item.key as keyof typeof formData] as number}
                onChange={e => setFormData({...formData, [item.key]: parseFloat(e.target.value) || 0})}
                className="w-full bg-black border border-slate-800 rounded-lg p-3 text-sm focus:border-emerald-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[10px] uppercase text-slate-500 mb-2 font-bold">Category</label>
        <select
          required
          value={formData.field_category || ""}
          onChange={e => setFormData({...formData, field_category: parseInt(e.target.value) || null})}
          className="w-full bg-black border border-slate-800 rounded-lg p-3 text-sm focus:border-orange-500 outline-none appearance-none text-white cursor-pointer"
        >
          <option value="" disabled className="text-slate-600">Select a category...</option>
          {lookups.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      {/* Dietary Restrictions (Same as before) */}
      <div className="bg-[#111] p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-6">Dietary Classifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Ethical', field: 'field_dietary_restrictions_ethic', options: lookups.ethical },
            { label: 'Medical', field: 'field_dietary_restrictions_medic', options: lookups.medical },
            { label: 'Religious', field: 'field_dietary_restrictions_relig', options: lookups.religious },
          ].map((section) => (
            <div key={section.label}>
              <label className="block text-[10px] uppercase text-slate-500 mb-3 font-bold">{section.label}</label>
              <div className="flex flex-wrap gap-2">
                {section.options.map((opt: LookupItem) => {
                  const currentFieldValue = String(formData[section.field as keyof typeof formData] || "");
                  const activeIds = currentFieldValue.split("|").filter(Boolean);
                 const isActive = activeIds.includes(String(opt.id));
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleDietToggle(opt.id, section.field)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all ${
                        isActive 
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                        : "bg-black border-slate-800 text-slate-500 hover:border-slate-600"
                      }`}
                    >
                      {opt.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-white transition-colors">Cancel</button>
        <button 
          disabled={loading || uploading}
          className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-orange-600/20"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {isEditing ? "Update Ingredient" : "Create Ingredient"}
        </button>
      </div>
    </form>
  );
}