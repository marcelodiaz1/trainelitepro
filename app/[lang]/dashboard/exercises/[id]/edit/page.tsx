"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, Type, Target, Image as ImageIcon, Layers, Plus
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditExercisePage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [zones, setZones] = useState<any[]>([]);
  const [exTypes, setExTypes] = useState<any[]>([]); // New state for dynamic types
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    field_exercise_type: "", // Now stores the numeric ID
    field_zone: "",
    field_media_image: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      
      // 1. Fetch Zones and Exercise Types in parallel
      const [zonesRes, typesRes] = await Promise.all([
        supabase.from("zone").select("id, name").order("name"),
        supabase.from("exercise_type").select("id, name").order("id")
      ]);

      if (zonesRes.data) setZones(zonesRes.data);
      if (typesRes.data) setExTypes(typesRes.data);

      // 2. Fetch specific exercise data
      const { data: exercise, error: fetchError } = await supabase
        .from("exercise")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        setError("Could not find this exercise.");
      } else if (exercise) {
        setFormData({
          title: exercise.title || "",
          // Ensure the ID is a string for the component state comparison
          field_exercise_type: exercise.field_exercise_type?.toString() || "",
          field_zone: exercise.field_zone?.toString() || "",
          field_media_image: exercise.field_media_image || ""
        });
      }
      setFetching(false);
    };

    if (id) fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let finalImageUrl = formData.field_media_image;

    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = fileName;

        const { error: uploadError } = await supabase.storage
          .from("exercises")
          .upload(filePath, selectedFile);

        if (uploadError) throw new Error("Image upload failed.");

        const { data: { publicUrl } } = supabase.storage
          .from("exercises")
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrl;
      }

      // 3. Update the existing record with parsed Integers
      const { error: updateError } = await supabase
        .from("exercise")
        .update({
          title: formData.title,
          // Convert string IDs back to Integers for the int4 column
          field_exercise_type: formData.field_exercise_type ? parseInt(formData.field_exercise_type) : null,
          field_zone: formData.field_zone ? parseInt(formData.field_zone) : null,
          field_media_image: finalImageUrl
        })
        .eq("id", id);

      if (updateError) throw updateError;

      router.push(`/dashboard/exercises/${id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="bg-[#050505] min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-t-2 border-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex h-screen overflow-hidden">
      
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0b0b0b]">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/exercises/${id}`}>
              <ChevronLeft className="text-slate-500 hover:text-white transition-colors" />
            </Link>
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">Edit Exercise</h1>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Exercise"}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-[#050505] custom-scrollbar">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Type size={14} className="text-orange-500"/> Exercise Name
                </label>
                <input 
                  type="text"
                  className="w-full bg-transparent text-xl font-bold outline-none text-white border-b border-slate-800 focus:border-orange-500 pb-2 transition-all"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Target size={14} className="text-orange-500"/> Target Muscle Zone
                </label>
                <select 
                  className="w-full bg-transparent text-xl font-bold outline-none text-white border-b border-slate-800 focus:border-orange-500 pb-2 transition-all cursor-pointer"
                  value={formData.field_zone}
                  onChange={e => setFormData({...formData, field_zone: e.target.value})}
                  required
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
              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <Layers size={14} className="text-orange-500"/> Exercise Category
                </label>
                {/* Dynamic Category Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {exTypes.map(type => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({...formData, field_exercise_type: type.id.toString()})}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        formData.field_exercise_type.toString() === type.id.toString()
                        ? 'bg-orange-600 border-orange-500 text-white shadow-lg' 
                        : 'bg-black border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0b0b0b] p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                  <ImageIcon size={14} className="text-orange-500"/> Replace Exercise Image
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
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all"
                  >
                    <Plus className="text-slate-600 group-hover:text-orange-500 mb-2" size={24} />
                    <p className="text-[10px] font-bold text-slate-500 uppercase px-4 text-center">
                      {selectedFile ? selectedFile.name : "Click to change image"}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {formData.field_media_image && (
              <div className="mt-8 bg-[#0b0b0b] p-4 rounded-3xl border border-slate-800 inline-block">
                <p className="text-[9px] font-black text-slate-600 uppercase mb-3 text-center">Current / New Preview</p>
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