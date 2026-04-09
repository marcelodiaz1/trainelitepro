"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  UserPlus, 
  Mail, 
  User, 
  Award, 
  AlertCircle,
  Calendar,
  Loader2
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
); 

export default function NewTraineeClient({ dict, lang }: { dict: any; lang: string }) {
  const t = dict?.onboard || {};
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [currentTrainerId, setCurrentTrainerId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    specialty: "",
    gender: "",
    dob: "",
    status: "active",
    role: "trainee",
  });

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setCheckingLimit(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${lang}/login`);
          return;
        }
        setCurrentTrainerId(user.id);

        const { data: profile } = await supabase
          .from("users")
          .select("role, selected_plan")
          .eq("id", user.id)
          .single();

        if (profile?.role === "trainer") {
          const { count } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("role", "trainee")
            .eq("trainer_id", user.id);

          if (profile.selected_plan) {
            const { data: planData } = await supabase
              .from("plans")
              .select("trainee_limit")
              .eq("id", profile.selected_plan)
              .single();

            if (planData && (count || 0) >= planData.trainee_limit) {
              router.push(`/${lang}/pricing?reason=limit_reached`);
              return;
            }
          }
        }
        setCheckingLimit(false);
      } catch (err) {
        console.error("Error validando acceso:", err);
        setCheckingLimit(false);
      }
    };

    validateAccess();
  }, [router, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrainerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: "TemporaryPassword123!", 
          userData: {
            ...formData,
            trainer_id: currentTrainerId,
          },
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      router.push(`/${lang}/dashboard/trainees`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (checkingLimit) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="animate-pulse font-medium tracking-widest text-[10px] uppercase">{t.verifying}</p>
      </div>
    );
  }

  const inputClasses = "w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-slate-600";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block";

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-3xl mx-auto w-full">
        <Link href={`/${lang}/dashboard/trainees`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> {t.cancel}
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">{t.title}</h1>
          <p className="text-slate-500 text-sm">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <label className={labelClasses}>{t.fields?.firstName}</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input required type="text" placeholder={t.fields?.firstName} className={inputClasses} value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>{t.fields?.lastName}</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input required type="text" placeholder={t.fields?.lastName} className={inputClasses} value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="text-left">
            <label className={labelClasses}>{t.fields?.email}</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input required type="email" placeholder="email@example.com" className={inputClasses} value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <label className={labelClasses}>{t.fields?.gender}</label>
              <select 
                required 
                className={`${inputClasses} appearance-none cursor-pointer`}
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="" disabled>{t.fields?.genderSelect}</option>
                <option value="male">{t.fields?.male}</option>
                <option value="female">{t.fields?.female}</option> 
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t.fields?.dob}</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input required type="date" className={`${inputClasses} [color-scheme:dark]`} 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="text-left">
            <label className={labelClasses}>{t.fields?.specialty}</label>
            <div className="relative">
              <Award className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input required type="text" placeholder={t.fields?.specialtyPlaceholder} className={inputClasses} value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              {t.footer?.assigning} <span className="text-blue-500 font-black">{t.footer?.account}</span>
            </p>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-b-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={16} /> {t.footer?.submit}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}