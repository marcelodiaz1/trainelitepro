"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, Type, Target, Image as ImageIcon, Layers, Plus, Save, Loader2 
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewExercisePage() {
  const router = useRouter();
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data Options States
  const [zones, setZones] = useState<any[]>([]);
  const [exTypes, setExTypes] = useState<any[]>([]);
  
  // Form States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    field_exercise_type: "", // Will be auto-set on load
    field_zone: "",
    field_media_image: ""
  });

  // 1. Initial Fetch of Options (Zones & Types)
  useEffect(() => {
    const fetchOptions = async () => {
      setFetching(true);
      try {
        const [zonesRes, typesRes] = await Promise.all([
          supabase.from("zone").select("id, name").order("name"),
          supabase.from("exercise_type").select("id, name").order("id")
        ]);

        if (zonesRes.data) setZones(zonesRes.data);
        if (typesRes.data) {
          setExTypes(typesRes.data);
          // Auto-select the first type available for a fresh form
          if (typesRes.data.length > 0) {
            setFormData(prev => ({ 
              ...prev, 
              field_exercise_type: typesRes.data[0].id.toString() 
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching form options:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.field_exercise_type) {
      return setError("Please fill in the required fields.");
    }

    setLoading(true);
    setError(null);

    let finalImageUrl = "";

    try {
      // 2. Upload Image to Supabase Storage if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `exercise-library/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("exercises") // Ensure this bucket exists and is public
          .upload(filePath, selectedFile);

        if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from("exercises")
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrl;
      }

      // 3. Insert fresh record
      const { error: insertError } = await supabase
        .from("exercise")
        .insert([{
          title: formData.title,
          field_exercise_type: parseInt(formData.field_exercise_type),
          field_zone: formData.field_zone ? parseInt(formData.field_zone) : null,
          field_media_image: finalImageUrl
        }]);

      if (insertError) throw insertError;

      router.push("/dashboard/exercises");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <Loader2 className="text-orange-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex h-screen overflow-hidden">
      
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
          <div className="flex items-center gap-4">
            <LocalizedLink href="/dashboard/exercises">
              <ChevronLeft className="text-slate-500 hover:text-white transition-colors" />
            </LocalizedLink>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Create New Exercise</h1>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Saving..." : "Save Exercise"}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Type size={14} className="text-orange-500"/> Exercise Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Incline Bench Press"
                  className="w-full bg-transparent text-xl font-bold outline-none text-white border-b border-slate-800 focus:border-orange-500 pb-2 transition-all"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              {/* Zone Selector */}
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Target size={14} className="text-orange-500"/> Target Muscle Zone
                </label>
                <select 
                  className="w-full bg-transparent text-xl font-bold outline-none text-white border-b border-slate-800 focus:border-orange-500 pb-2 transition-all cursor-pointer"
                  value={formData.field_zone}
                  onChange={e => setFormData({...formData, field_zone: e.target.value})}
                >
                  <option value="" className="bg-black">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id} className="bg-black text-white">
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Buttons */}
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Layers size={14} className="text-orange-500"/> Select Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {exTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({...formData, field_exercise_type: type.id.toString()})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        formData.field_exercise_type === type.id.toString()
                        ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-900/40' 
                        : 'bg-black border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <ImageIcon size={14} className="text-orange-500"/> Exercise Media
                </label>
                <div className="relative group">
                  <input 
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setFormData({...formData, field_media_image: URL.createObjectURL(file)});
                      }
                    }}
                  />
                  <label 
                    htmlFor="file-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                      selectedFile 
                      ? "border-orange-500 bg-orange-500/5" 
                      : "border-slate-800 hover:border-orange-500/50 hover:bg-orange-500/5"
                    }`}
                  >
                    <Plus className={`${selectedFile ? "text-orange-500" : "text-slate-600"} mb-2`} size={24} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase px-4 text-center">
                      {selectedFile ? selectedFile.name : "Upload Demo Image"}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Visual Preview */}
            {formData.field_media_image && (
              <div className="mt-8 bg-[#0b0b0b] p-4 rounded-3xl border border-slate-800 inline-block">
                <p className="text-[9px] font-black text-slate-600 uppercase mb-3 text-center">Image Preview</p>
                <img 
                  src={formData.field_media_image} 
                  alt="Preview" 
                  className="w-48 h-48 object-cover rounded-2xl border border-slate-800"
                />
              </div>
            )}

          </form>
        </div>
      </div>
    </main>
  );
}