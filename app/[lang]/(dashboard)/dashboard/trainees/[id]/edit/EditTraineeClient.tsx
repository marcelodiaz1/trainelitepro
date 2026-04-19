"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  Save, 
  User, 
  AlertCircle,
  RefreshCw,
  Calendar
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditTraineeClient({ dict, lang }: { dict: any; lang: string }) {
  const router = useRouter();
  const { id } = useParams();
  const t = dict.editTrainee;
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<{id: string, first_name: string, last_name: string}[]>([]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    specialty: "",
    status: "",
    gender: "",
    dob: "",
    trainer_id: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: trainee, error: fetchError } = await supabase
          .from("users")
          .select("first_name, last_name, email, specialty, status, gender, dob, trainer_id")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        const { data: trainersData, error: trainersError } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .eq("role", "trainer");

        if (trainersError) throw trainersError;

        if (trainee) {
          setFormData({
            first_name: trainee.first_name || "",
            last_name: trainee.last_name || "",
            email: trainee.email || "",
            specialty: trainee.specialty || "",
            status: trainee.status || "active",
            gender: trainee.gender || "",
            dob: trainee.dob || "",
            trainer_id: trainee.trainer_id || "",
          });
          if (trainersData) setTrainers(trainersData);
        }
      } catch (err: any) {
        setError(err.message || t.errors.load);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, t.errors.load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    const cleanData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      specialty: formData.specialty,
      status: formData.status,
      gender: formData.gender || null,
      dob: formData.dob === "" ? null : formData.dob,
      trainer_id: formData.trainer_id === "" ? null : formData.trainer_id,
    };

    const { error: updateError } = await supabase
      .from("users")
      .update(cleanData)
      .eq("id", id);

    if (updateError) {
      setError(updateError.message);
      setUpdating(false);
    } else {
      router.push(`/${lang}/dashboard/trainees/${id}`);
      router.refresh();
    }
  };

  const inputClasses = "w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-slate-600";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block text-left";

  if (loading) return (
    <main className="bg-[#050505] min-h-screen flex items-center justify-center">
      <RefreshCw className="text-blue-500 animate-spin" size={32} />
    </main>
  );

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-3xl mx-auto w-full">
        <LocalizedLink href={`/${lang}/dashboard/trainees/${id}`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> {t.discard}
        </LocalizedLink>

        <div className="mb-10 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">{t.title}</h1>
          <p className="text-slate-500 text-sm">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t.labels.firstName}</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input required type="text" className={inputClasses} value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>{t.labels.lastName}</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input required type="text" className={inputClasses} value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t.labels.gender}</label>
              <select className={`${inputClasses} appearance-none cursor-pointer`} value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="">{t.placeholders.selectGender}</option>
                <option value="male">{t.placeholders.male}</option>
                <option value="female">{t.placeholders.female}</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t.labels.dob}</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input type="date" className={`${inputClasses} [color-scheme:dark]`} value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t.labels.email}</label>
              <input required type="email" className={inputClasses} value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClasses}>{t.labels.status}</label>
              <select className={`${inputClasses} appearance-none cursor-pointer`} value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">{t.placeholders.active}</option>
                <option value="pending">{t.placeholders.pending}</option>
                <option value="blocked">{t.placeholders.blocked}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t.labels.trainer}</label>
              <select className={`${inputClasses} appearance-none cursor-pointer`} value={formData.trainer_id}
                onChange={(e) => setFormData({...formData, trainer_id: e.target.value})}
              >
                <option value="">{t.placeholders.unassigned}</option>
                {trainers.map(tr => (
                  <option key={tr.id} value={tr.id}>{tr.first_name} {tr.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t.labels.specialty}</label>
              <input type="text" className={inputClasses} value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/50 flex justify-end">
            <button type="submit" disabled={updating}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {updating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <><Save size={16} /> {t.save}</>}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}