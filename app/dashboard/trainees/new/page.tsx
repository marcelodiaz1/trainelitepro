"use client";

import { useState, useEffect } from "react"; // Añadido useEffect
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  UserPlus, 
  Mail, 
  User, 
  Award, 
  CheckCircle2,
  AlertCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
); 

export default function NewTraineePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrainerId, setCurrentTrainerId] = useState<string | null>(null);

  // Obtener el ID del entrenador logueado al cargar
  useEffect(() => {
    const getTrainer = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentTrainerId(user.id);
      }
    };
    getTrainer();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTrainerId) {
      setError("No se pudo identificar al entrenador. Por favor, re-inicia sesión.");
      return;
    }

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
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: "trainee",
            status: formData.status,
            specialty: formData.specialty,
            gender: formData.gender,
            dob: formData.dob,
            trainer_id: currentTrainerId, // <--- Vinculación automática
          },
        }),
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      router.push("/dashboard/trainees");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-[#0a0a0a] border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-slate-600";
  const labelClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 block";

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-3xl mx-auto w-full">
        <Link href="/dashboard/trainees" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Cancel & Return
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic">Onboard Trainee</h1>
          <p className="text-slate-500 text-sm">Create a new profile for your trainee.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>First Name</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input required type="text" placeholder="First Name" className={inputClasses} value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className={labelClasses}>Last Name</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input required type="text" placeholder="Last Name" className={inputClasses} value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={labelClasses}>Email Address</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input required type="email" placeholder="email@example.com" className={inputClasses} value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Género y Fecha de Nacimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Gender</label>
              <select 
                required 
                className={`${inputClasses} appearance-none cursor-pointer`}
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="" disabled>Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option> 
              </select>
            </div>
            <div>
              <label className={labelClasses}>Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                <input 
                  required 
                  type="date" 
                  className={`${inputClasses} [color-scheme:dark]`} 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Especialidad */}
          <div>
            <label className={labelClasses}>Specialty / Focus</label>
            <div className="relative">
              <Award className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input required type="text" placeholder="Strength, HIIT, etc." className={inputClasses} value={formData.specialty}
                onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              />
            </div>
          </div>

          {/* Estatus */}
          <div>
            <label className={labelClasses}>Initial Status</label>
            <select className={`${inputClasses} appearance-none cursor-pointer`} value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Assigning to: <span className="text-blue-500 font-black">{currentTrainerId ? "Your Account" : "Loading..."}</span>
            </p>
            <button 
              type="submit" 
              disabled={loading || !currentTrainerId} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-b-white rounded-full animate-spin" />
              ) : (
                <><UserPlus size={16} /> Create Profile</>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}