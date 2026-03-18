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
  Info,
  Loader2
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewEvaluationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTrainerId, setCurrentTrainerId] = useState<string | null>(null);

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
  const initializeData = async () => {
    // 1. Get the current logged-in user session
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      // 2. Get the current user's role and ID from the public users table
      const { data: currentUser } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", authUser.id)
        .single();

      if (currentUser) {
        setCurrentTrainerId(currentUser.id);

        // 3. Build the query
        let query = supabase
          .from("users")
          .select("*")
          .eq("role", "trainee");

        // 4. If NOT an admin, restrict trainees to those assigned to this trainer
        if (currentUser.role !== 'admin') {
          query = query.eq("trainer_id", currentUser.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Supabase Error:", error);
          setError(`Database Error: ${error.message}`);
        } else {
          setTrainees(data || []);
        }
      }
    } else {
      setError("User session not found.");
    }
  };

  initializeData();
}, []);

  // Calculation Engine
  useEffect(() => {
    const calculateMetrics = () => {
      const selectedTrainee = trainees.find(t => t.id === formData.trainee_id);
      if (!selectedTrainee || !formData.weight || !formData.height) return;

      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const b = parseFloat(formData.biceps) || 0;
      const t = parseFloat(formData.triceps) || 0;
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

      const sumatoria = b + t + se + si;
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

      let category = "Normal";
      const f = fat_percentage;
      if (isMale) {
        if (age <= 19)      category = f >= 21.2 ? "Obese" : f >= 15.9 ? "Overweight" : f >= 10.7 ? "Average" : "Ideal";
        else if (age <= 29) category = f >= 24   ? "Obese" : f >= 18.5 ? "Overweight" : f >= 12.9 ? "Average" : "Ideal";
        else                category = f >= 26.7 ? "Obese" : f >= 22.4 ? "Overweight" : f >= 18   ? "Average" : "Ideal";
      } else {
        category = f >= 33 ? "High Fat" : f >= 22 ? "Normal" : "Lean";
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
  }, [formData.trainee_id, formData.weight, formData.height, formData.biceps, formData.triceps, formData.shoulder_blade, formData.suprailiac, trainees]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  // Helper: Converts empty string to null, otherwise returns a number
  const n = (val: string) => (val === "" ? null : parseFloat(val));

  // Get the fresh user ID just to be absolutely sure before the insert
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    setError("You must be logged in to save an evaluation.");
    setLoading(false);
    return;
  }

  const payload = {
    trainee_id: formData.trainee_id, // UUID
    trainer_id: user.id,            // Use the ID directly from the auth session
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

  const { error: submitError } = await supabase
    .from("evaluations")
    .insert([payload]);

  if (submitError) {
    console.error("Insert failed:", submitError.message);
    setError(submitError.message);
    setLoading(false);
  } else {
    router.push("/dashboard/evaluations");
  }
};
  const inputClasses = "w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-orange-500 outline-none text-white transition-all placeholder:text-slate-600";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block";
  const sectionHeader = "text-xs font-black uppercase tracking-[0.3em] text-orange-500/80 mb-6 flex items-center gap-2 border-b border-slate-800 pb-2";

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        <Link href="/dashboard/evaluations" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Cancel & Return
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">Biometric Scan</h1>
          <p className="text-slate-500 text-sm font-medium">Protocol: Durnin-Womersley 4-Fold Method.</p>
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
                <h3 className={sectionHeader}><Users size={16}/> Subject Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className={labelClasses}>Trainee</label>
                    <select
                      required
                      className={`${inputClasses} appearance-none cursor-pointer`}
                      value={formData.trainee_id}
                      onChange={(e) => setFormData({...formData, trainee_id: e.target.value})}
                    >
                      <option value="">Select Trainee...</option>
                      {trainees.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#111]">{t.first_name} {t.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClasses}>Weight (kg)</label>
                    <input required type="number" step="0.01" className={inputClasses} placeholder="0.00" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
                  </div>
                  <div>
                    <label className={labelClasses}>Height (cm)</label>
                    <input required type="number" step="0.1" className={inputClasses} placeholder="0.0" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className={sectionHeader}><Layers size={16}/> Formula Inputs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[{ id: 'biceps', label: 'Biceps' }, { id: 'triceps', label: 'Triceps' }, { id: 'shoulder_blade', label: 'Subscap' }, { id: 'suprailiac', label: 'Suprailiac' }].map((f) => (
                    <div key={f.id}>
                      <label className={labelClasses}>{f.label} (mm)</label>
                      <input type="number" step="0.1" className={inputClasses} placeholder="0.0" value={(formData as any)[f.id]} onChange={(e) => setFormData({...formData, [f.id]: e.target.value})} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className={sectionHeader}><Activity size={16}/> Perimeters</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {['waist', 'arm', 'torso', 'hip'].map((f) => (
                    <div key={f}>
                      <label className={labelClasses}>{f}</label>
                      <input type="number" step="0.01" className={inputClasses} placeholder="0.0" value={(formData as any)[f]} onChange={(e) => setFormData({...formData, [f]: e.target.value})} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <h3 className={sectionHeader}><Activity size={16}/> Perimeters</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {['shoulder_blade', 'leg', 'shin', 'wrist'].map((f) => (
                    <div key={f}>
                      <label className={labelClasses}>{f}</label>
                      <input type="number" step="0.01" className={inputClasses} placeholder="0.0" value={(formData as any)[f]} onChange={(e) => setFormData({...formData, [f]: e.target.value})} />
                    </div>
                  ))}
                </div>
              </div>


 
      
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-8 space-y-6">
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-slate-800 rounded-3xl p-8 shadow-2xl">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Metrics Summary</h3>
                   <div className="space-y-6">
                      <ResultBox label="Fat %" value={formData.fat_percentage} unit="%" color="text-orange-500" />
                      <ResultBox label="Lean Mass" value={formData.lean_mass} unit="kg" />
                      <ResultBox label="Fat Mass" value={formData.fat_mass} unit="kg" />
                      <ResultBox label="Fat Mass" value={formData.fat_mass} unit="kg" />
                      <ResultBox label="imc" value={formData.imc} unit="kg" />
                      <ResultBox label="addition" value={formData.addition} unit="kg" />
                      <div className="pt-6 border-t border-slate-800">
                        <p className={labelClasses}>Classification</p>
                        <div className="text-2xl font-black italic uppercase text-emerald-500">{formData.results || "---"}</div>
                      </div>
                   </div>
                   <button type="submit" disabled={loading} className="mt-10 w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-orange-600/20">
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><ClipboardPlus size={16} /> Finalize Scan</>}
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