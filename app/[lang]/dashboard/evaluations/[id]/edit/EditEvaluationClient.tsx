"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  Save, 
  Activity, 
  AlertCircle, 
  Users, 
  Layers,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditEvaluationClient({ dict, lang }: { dict: any; lang: string }) {
  const router = useRouter();
  const { id } = useParams();
  const t = dict.newEvaluation; // Reusing labels
  const editT = dict.editEvaluation; // Edit-specific strings
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<any>({
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [traineesRes, evalRes] = await Promise.all([
          supabase.from("users").select("id, first_name, last_name, dob, gender").eq("role", "trainee").order("first_name"),
          supabase.from("evaluations").select("*").eq("id", id).single()
        ]);

        if (traineesRes.data) setTrainees(traineesRes.data);
        if (evalRes.error) {
          setError(editT.errorNotFound);
        } else if (evalRes.data) {
          setFormData(evalRes.data);
        }
      } catch (err) {
        setError(editT.errorConnection);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, editT]);

  useEffect(() => {
    if (loading || !formData.trainee_id) return;

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
      const imc = weight / ((height / 100) ** 2);

      let fat_percentage = 0;
      if (sumatoria > 0) {
        const log = Math.log10(sumatoria);
        let dens = isMale 
            ? (age <= 19 ? 1.1620 - (0.0630 * log) : age <= 29 ? 1.1631 - (0.0632 * log) : age <= 39 ? 1.1422 - (0.0544 * log) : age <= 49 ? 1.1620 - (0.0700 * log) : 1.1715 - (0.0779 * log))
            : (age <= 19 ? 1.1549 - (0.0678 * log) : age <= 29 ? 1.1599 - (0.0717 * log) : age <= 39 ? 1.1423 - (0.0632 * log) : age <= 49 ? 1.1333 - (0.0612 * log) : 1.1339 - (0.0645 * log));
        
        fat_percentage = isMale ? (457 / dens) - 414 : (495 / dens) - 450;
      }

      const fat_mass = weight * (fat_percentage / 100);
      const lean_mass = weight - fat_mass;

      let category = t.results.normal;
      if (fat_percentage > (isMale ? 25 : 32)) category = t.results.highFat;
      else if (fat_percentage < (isMale ? 8 : 15)) category = t.results.lean;

      setFormData((prev: any) => ({
        ...prev,
        addition: sumatoria.toFixed(2),
        imc: imc.toFixed(2),
        fat_percentage: fat_percentage.toFixed(2),
        fat_mass: fat_mass.toFixed(2),
        lean_mass: lean_mass.toFixed(2),
        results: category
      }));
    };

    calculateMetrics();
  }, [formData.weight, formData.height, formData.biceps, formData.triceps, formData.shoulder_blade, formData.suprailiac, trainees, loading, t.results]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { id: _id, created_at, updated_at, trainer_id, trainee, ...updatePayload } = formData;

    const { error: submitError } = await supabase
      .from("evaluations")
      .update(updatePayload)
      .eq("id", id);

    if (submitError) {
      setError(submitError.message);
      setSaving(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/${lang}/dashboard/evaluations/${id}`);
        router.refresh(); 
      }, 1000);
    }
  };

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center text-white">
      <Loader2 className="animate-spin text-orange-500" size={48} />
    </div>
  );

  const inputClasses = "w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-orange-500 outline-none text-white transition-all hover:border-slate-700";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block text-left";
  const sectionHeader = "text-xs font-black uppercase tracking-[0.3em] text-orange-500/80 mb-6 flex items-center gap-2 border-b border-slate-800 pb-2";

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        <Link href={`/${lang}/dashboard/evaluations/${id}`} className="group flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> {editT.discard}
        </Link>

        <div className="mb-10 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">{editT.title}</h1>
          <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
            <Activity size={14} className="text-orange-500" /> {editT.editingRecord} <span className="text-slate-300 font-mono">{id}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-24">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold animate-pulse">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold text-left">
              <CheckCircle2 size={18} /> {editT.successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              
              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-sm">
                <h3 className={sectionHeader}><Users size={16}/> {t.sections.subject}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="md:col-span-1">
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
                  <div>
                    <label className={labelClasses}>{t.labels.weight} (kg)</label>
                    <input required type="number" step="0.01" className={inputClasses} value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClasses}>{t.labels.height} (cm)</label>
                    <input required type="number" step="0.1" className={inputClasses} value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-xl">
                <h3 className={sectionHeader}><Layers size={16}/> {t.sections.formula}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                  {[
                    { id: 'biceps', label: t.labels.biceps },
                    { id: 'triceps', label: t.labels.triceps },
                    { id: 'shoulder_blade', label: t.labels.subscap },
                    { id: 'suprailiac', label: t.labels.suprailiac }
                  ].map((field) => (
                    <div key={field.id}>
                      <label className={labelClasses}>{field.label} (mm)</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className={inputClasses} 
                        value={formData[field.id] || ""} 
                        onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-sm">
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
                      <label className={labelClasses}>{field.label} (cm)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className={inputClasses} 
                        value={formData[field.id] || ""} 
                        onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <div className="bg-[#0a0a0a] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-left">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10"></div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                     {editT.liveAnalysis}
                   </h3>
                   <div className="space-y-6">
                      <ResultBox label={t.labels.fatPercent} value={formData.fat_percentage} unit="%" color="text-orange-500" />
                      <ResultBox label={t.labels.leanMass} value={formData.lean_mass} unit="kg" />
                      <ResultBox label={editT.status} value={formData.results} unit="" color="text-green-500" />
                   </div>

                   <button
                    type="submit"
                    disabled={saving || success}
                    className={`mt-10 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl ${
                      success 
                      ? "bg-green-600 text-white" 
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                    } disabled:bg-slate-800 disabled:shadow-none`}
                  >
                    {saving ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : success ? (
                      <><CheckCircle2 size={16} /> {editT.saved}</>
                    ) : (
                      <><Save size={16} /> {editT.updateButton}</>
                    )}
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
      <div className="group">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1 group-hover:text-slate-400 transition-colors">{label}</p>
          <div className={`text-3xl font-black italic ${color} leading-none tracking-tighter`}>
              {value || "0.00"} <span className="text-xs text-slate-700 not-italic uppercase ml-1">{unit}</span>
          </div>
      </div>
  );
}