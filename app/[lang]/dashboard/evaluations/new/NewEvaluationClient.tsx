"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  ClipboardPlus, 
  Activity, 
  AlertCircle, 
  Users, 
  Layers,
  Loader2
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewEvaluationClient({ dict, lang }: { dict: any; lang: string }) {
  const router = useRouter();
  const t = dict.newEvaluation;
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    trainee_id: "",
    weight: "",
    height: "",
    imc: "",
    fat_percentage: "",
    fat_mass: "",
    lean_mass: "",
    biceps: "",
    triceps: "",
    shoulder_blade: "", 
    suprailiac: "",
    addition: "",
    results: "",
    waist: "",
    arm: "",
    torso: "",
    hip: "",
    leg: "",
    shin: "",
    wrist: "",
    body: ""
  });

  useEffect(() => {
    const validateAndLoad = async () => {
      try {
        setCheckingAccess(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          router.push(`/${lang}/login`);
          return;
        }

        const { data: currentUser } = await supabase
          .from("users")
          .select("id, role, selected_plan")
          .eq("id", authUser.id)
          .single();

        if (currentUser) {
          if (currentUser.role === 'trainer') {
            const { count } = await supabase
              .from("evaluations")
              .select("*", { count: "exact", head: true })
              .eq("trainer_id", currentUser.id);

            if (currentUser.selected_plan) {
              const { data: planData } = await supabase
                .from("plans")
                .select("trainee_limit")
                .eq("id", currentUser.selected_plan)
                .single();

              if (planData && (count || 0) >= planData.trainee_limit) {
                router.push(`/${lang}/pricing?reason=limit_reached`);
                return;
              }
            }
          }

          let query = supabase.from("users").select("*").eq("role", "trainee");
          if (currentUser.role !== 'admin') {
            query = query.eq("trainer_id", currentUser.id);
          }

          const { data, error: traineeError } = await query;
          if (traineeError) throw traineeError;
          setTrainees(data || []);
        }
        setCheckingAccess(false);
      } catch (err: any) {
        setError(err.message);
        setCheckingAccess(false);
      }
    };
    validateAndLoad();
  }, [router, lang]);

  useEffect(() => {
    const calculateMetrics = () => {
      const selectedTrainee = trainees.find(tr => tr.id === formData.trainee_id);
      if (!selectedTrainee || !formData.weight || !formData.height) return;

      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const b = parseFloat(formData.biceps) || 0;
      const tr = parseFloat(formData.triceps) || 0;
      const se = parseFloat(formData.shoulder_blade) || 0;
      const si = parseFloat(formData.suprailiac) || 0;
      
      let age = 25; 
      if (selectedTrainee.dob) {
        const birthDate = new Date(selectedTrainee.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
      }

      const isMale = selectedTrainee.gender?.toLowerCase().includes("male") || 
                     selectedTrainee.gender?.toLowerCase().includes("hombre");

      const sumatoria = b + tr + se + si;
      const imcValue = weight / ((height / 100) ** 2);

      let fat_percentage = 0;
      if (sumatoria > 0) {
        const log = Math.log10(sumatoria);
        let densidad = 0;
        if (isMale) {
          if (age < 20) densidad = 1.1620 - (0.0630 * log);
          else if (age < 30) densidad = 1.1631 - (0.0632 * log);
          else if (age < 40) densidad = 1.1422 - (0.0544 * log);
          else if (age < 50) densidad = 1.1620 - (0.0700 * log);
          else densidad = 1.1715 - (0.0779 * log);
          fat_percentage = (457 / densidad) - 414;
        } else {
          if (age < 20) densidad = 1.1549 - (0.0678 * log);
          else if (age < 30) densidad = 1.1599 - (0.0717 * log);
          else if (age < 40) densidad = 1.1423 - (0.0632 * log);
          else if (age < 50) densidad = 1.1333 - (0.0612 * log);
          else densidad = 1.1339 - (0.0645 * log);
          fat_percentage = (495 / densidad) - 450;
        }
      }

      const fat_mass = weight * (fat_percentage / 100);
      const lean_mass = weight - fat_mass;

      let category = t.results.normal;
      const f = fat_percentage;
      if (isMale) {
        if (age <= 19)      category = f >= 21.2 ? t.results.obese : f >= 15.9 ? t.results.overweight : f >= 10.7 ? t.results.average : t.results.ideal;
        else if (age <= 29) category = f >= 24   ? t.results.obese : f >= 18.5 ? t.results.overweight : f >= 12.9 ? t.results.average : t.results.ideal;
        else                category = f >= 26.7 ? t.results.obese : f >= 22.4 ? t.results.overweight : f >= 18   ? t.results.average : t.results.ideal;
      } else {
        category = f >= 33 ? t.results.highFat : f >= 22 ? t.results.normal : t.results.lean;
      }

      setFormData(prev => ({
        ...prev,
        addition: sumatoria > 0 ? sumatoria.toFixed(2) : "",
        imc: imcValue > 0 ? imcValue.toFixed(2) : "",
        fat_percentage: fat_percentage > 0 ? fat_percentage.toFixed(2) : "",
        fat_mass: fat_mass > 0 ? fat_mass.toFixed(2) : "",
        lean_mass: lean_mass > 0 ? lean_mass.toFixed(2) : "",
        results: category
      }));
    };
    calculateMetrics();
  }, [formData.trainee_id, formData.weight, formData.height, formData.biceps, formData.triceps, formData.shoulder_blade, formData.suprailiac, trainees, t.results]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const n = (val: string) => (val === "" ? null : parseFloat(val));
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError(t.errorAuth);
      setLoading(false);
      return;
    }
    const payload = {
      trainee_id: formData.trainee_id,
      trainer_id: user.id,
      weight: n(formData.weight),
      height: n(formData.height),
      imc: n(formData.imc),
      fat_percentage: n(formData.fat_percentage),
      fat_mass: n(formData.fat_mass),
      lean_mass: n(formData.lean_mass),
      biceps: n(formData.biceps),
      triceps: n(formData.triceps),
      shoulder_blade: n(formData.shoulder_blade),
      suprailiac: n(formData.suprailiac),
      waist: n(formData.waist),
      arm: n(formData.arm),
      torso: n(formData.torso),
      hip: n(formData.hip),
      leg: n(formData.leg),
      shin: n(formData.shin),
      wrist: n(formData.wrist),
      addition: n(formData.addition),
      results: formData.results || null,
      body: formData.body || null
    };

    const { error: submitError } = await supabase.from("evaluations").insert([payload]);
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    } else {
      router.push(`/${lang}/dashboard/evaluations`);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
        <p className="animate-pulse font-medium tracking-widest text-[10px] uppercase">{t.verifying}</p>
      </div>
    );
  }

  const inputClasses = "w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-orange-500 outline-none text-white transition-all placeholder:text-slate-600";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block text-left";
  const sectionHeader = "text-xs font-black uppercase tracking-[0.3em] text-orange-500/80 mb-6 flex items-center gap-2 border-b border-slate-800 pb-2";

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        <Link href={`/${lang}/dashboard/evaluations`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> {t.cancel}
        </Link>

        <div className="mb-10 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">{t.title}</h1>
          <p className="text-slate-500 text-sm font-medium">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-24">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className={sectionHeader}><Users size={16}/> {t.sections.subject}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 text-left">
                    <label className={labelClasses}>{t.labels.trainee}</label>
                    <select
                      required
                      className={`${inputClasses} appearance-none cursor-pointer`}
                      value={formData.trainee_id}
                      onChange={(e) => setFormData({...formData, trainee_id: e.target.value})}
                    >
                      <option value="">{t.labels.selectTrainee}</option>
                      {trainees.map(tr => (
                        <option key={tr.id} value={tr.id} className="bg-[#111]">{tr.first_name} {tr.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-left">
                    <label className={labelClasses}>{t.labels.weight} (kg)</label>
                    <input required type="number" step="0.01" className={inputClasses} placeholder="0.00" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                  </div>
                  <div className="text-left">
                    <label className={labelClasses}>{t.labels.height} (cm)</label>
                    <input required type="number" step="0.1" className={inputClasses} placeholder="0.0" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className={sectionHeader}><Layers size={16}/> {t.sections.formula}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                  {[{ id: 'biceps', label: t.labels.biceps }, { id: 'triceps', label: t.labels.triceps }, { id: 'shoulder_blade', label: t.labels.subscap }, { id: 'suprailiac', label: t.labels.suprailiac }].map((f) => (
                    <div key={f.id}>
                      <label className={labelClasses}>{f.label} (mm)</label>
                      <input type="number" step="0.1" className={inputClasses} placeholder="0.0" value={(formData as any)[f.id]} onChange={(e) => setFormData({...formData, [f.id]: e.target.value})} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className={sectionHeader}><Activity size={16}/> {t.sections.perimeters}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                    {[
                        { id: 'waist', label: t.labels.waist },
                        { id: 'arm',   label: t.labels.arm },
                        { id: 'torso', label: t.labels.torso },
                        { id: 'hip',   label: t.labels.hip },
                        { id: 'leg',   label: t.labels.leg },
                        { id: 'shin',  label: t.labels.shin },
                        { id: 'wrist', label: t.labels.wrist }
                    ].map((field) => (
                        <div key={field.id}>
                        <label className={labelClasses}>{field.label}</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            className={inputClasses} 
                            placeholder="0.0" 
                            value={(formData as any)[field.id]} 
                            onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} 
                        />
                        </div>
                    ))}
                    </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-slate-800 rounded-3xl p-8 shadow-2xl text-left">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">{t.sections.summary}</h3>
                   <div className="space-y-6">
                      <ResultBox label={t.labels.fatPercent} value={formData.fat_percentage} unit="%" color="text-orange-500" />
                      <ResultBox label={t.labels.leanMass} value={formData.lean_mass} unit="kg" />
                      <ResultBox label={t.labels.fatMass} value={formData.fat_mass} unit="kg" />
                      <ResultBox label={t.labels.bmi} value={formData.imc} unit="" />
                      <div className="pt-6 border-t border-slate-800">
                        <p className={labelClasses}>{t.labels.classification}</p>
                        <div className="text-2xl font-black italic uppercase text-emerald-500">{formData.results || "---"}</div>
                      </div>
                   </div>
                   <button type="submit" disabled={loading} className="mt-10 w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-orange-600/20">
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><ClipboardPlus size={16} /> {t.finalize}</>}
                   </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

function ResultBox({ label, value, unit, color = "text-white" }: any) {
    return (
        <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">{label}</p>
            <div className={`text-3xl font-black italic ${color} leading-none`}>
                {value || "0.00"} <span className="text-xs text-slate-700 not-italic uppercase">{unit}</span>
            </div>
        </div>
    );
}