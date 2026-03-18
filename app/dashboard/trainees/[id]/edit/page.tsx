"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  Save, 
  Mail, 
  User, 
  Award, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Renamed component to EditTraineePage
export default function EditTraineePage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    specialty: "", // You might want to rename this to "goal" or "plan" for trainees later
    status: "",
  });

  // 1. Fetch existing trainee data
  useEffect(() => {
    const fetchTrainee = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("first_name, last_name, email, specialty, status")
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("Trainee not found or error loading data.");
      } else {
        setFormData(data);
      }
      setLoading(false);
    };

    if (id) fetchTrainee();
  }, [id]);

  // 2. Handle update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("users")
      .update(formData)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setUpdating(false);
    } else {
      // Updated route to trainees
      router.push(`/dashboard/trainees/${id}`);
      router.refresh();
    }
  };

  const inputClasses = "w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-slate-600";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block";

  if (loading) return (
    <main className="bg-[#050505] min-h-screen flex items-center justify-center">
      <RefreshCw className="text-blue-500 animate-spin" size={32} />
    </main>
  );

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      

      <div className="p-8 flex-1 max-w-3xl mx-auto w-full">
        {/* Updated link text and path */}
        <Link href={`/dashboard/trainees/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Discard Changes
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">Edit Trainee</h1>
          <p className="text-slate-500 text-sm">Update profile details and membership status for this trainee.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>First Name</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input
                  required
                  type="text"
                  className={inputClasses}
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Last Name</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input
                  required
                  type="text"
                  className={inputClasses}
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Email Address</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input
                required
                type="email"
                className={inputClasses}
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Training Focus</label>
            <div className="relative">
              <Award className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input
                required
                type="text"
                className={inputClasses}
                placeholder="e.g. Hypertrophy, Weight Loss"
                value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Account Status</label>
            <select
              className={`${inputClasses} appearance-none cursor-pointer`}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-end">
            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {updating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}