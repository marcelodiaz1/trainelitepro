"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle, User, Zap, ShieldCheck, 
  Search, Users, ChevronRight, AlertCircle, Lock 
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterClient({ dict }: { dict: any }) {
  const router = useRouter();
  const t = dict?.registerPage;
  
  const [role, setRole] = useState("trainee");
  const [gender, setGender] = useState(t?.genders[0] || "Male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [allTrainers, setAllTrainers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "",
    phone: "", address: "", specialty: "", bio: "",
    selected_plan: "", trainer_id: "", 
  });

  if (!t) return null;

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase
        .from("users")
        .select("own_plans")
        .eq("id", "25b0d303-4f0e-44ae-87ca-b6bd93a97664")
        .single();
      
      let plansData: any[] = []; 
      if (userData?.own_plans) {
        const { data: filteredPlans } = await supabase
          .from("plans")
          .select("id, title, trainee_limit, price")
          .in("id", userData.own_plans);
        if (filteredPlans) {
          plansData = filteredPlans;
          setAvailablePlans(filteredPlans);
        }
      }

      const { data: trainersData } = await supabase
        .from("users")
        .select(`id, first_name, last_name, specialty, selected_plan, trainees:users!trainer_id(count)`)
        .eq("role", "trainer").eq("status", "active");

      if (trainersData) {
        const formatted = trainersData.map((tr: any) => ({
          id: tr.id,
          first_name: tr.first_name,
          last_name: tr.last_name,
          specialty: tr.specialty,
          trainee_limit: plansData?.find(p => p.id === tr.selected_plan)?.trainee_limit || 3,
          trainee_count: tr.trainees?.[0]?.count || 0
        }));
        setAllTrainers(formatted);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (role === "trainee" && form.trainer_id) {
      const selected = allTrainers.find(tr => tr.id === form.trainer_id);
      if (selected && selected.trainee_count >= selected.trainee_limit) {
        setError(t.status.maxCapacity);
        setLoading(false);
        return;
      }
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role, gender,
          first_name: form.first_name,
          last_name: form.last_name,
          specialty: role === "trainer" ? form.specialty : null,
          selected_plan: role === "trainer" ? form.selected_plan : null,
          trainer_id: role === "trainee" ? form.trainer_id : null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const filteredTrainers = allTrainers.filter(tr => 
    `${tr.first_name} ${tr.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex flex-col font-sans">
      <Navbar dict={dict} />
      <section className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
          
          <div className="bg-[#111] p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/5">
            <div className="mb-8">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2" 
                  dangerouslySetInnerHTML={{ __html: t.title }} />
              <p className="text-slate-500 text-sm font-medium">
                {t.hasAccount} <Link href="/login" className="text-orange-500 hover:underline font-bold">{t.signIn}</Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <RoleButton active={role === "trainee"} onClick={() => setRole("trainee")} icon={<User size={16}/>} label={t.roles.trainee} />
                <RoleButton active={role === "trainer"} onClick={() => setRole("trainer")} icon={<Zap size={16}/>} label={t.roles.trainer} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input name="first_name" placeholder={t.placeholders.firstName} required onChange={handleChange} className="input-field" />
                <input name="last_name" placeholder={t.placeholders.lastName} required onChange={handleChange} className="input-field" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">{t.labels.gender}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.genders.map((g: string) => (
                    <button key={g} type="button" onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                        gender === g ? "border-orange-500 bg-orange-500/10 text-orange-500" : "border-slate-800 bg-[#161616] text-slate-500"
                      }`}>{g}</button>
                  ))}
                </div>
              </div>

              <input type="email" name="email" placeholder={t.placeholders.email} required onChange={handleChange} className="input-field w-full" />
              <input type="password" name="password" placeholder={t.placeholders.password} required onChange={handleChange} className="input-field w-full" />

              {role === "trainee" && (
                <div className="space-y-1 relative">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <Users size={12} /> {t.labels.findTrainer}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    <input type="text" placeholder={t.placeholders.searchTrainer} value={searchTerm} onFocus={() => setShowResults(true)}
                      onChange={(e) => { setSearchTerm(e.target.value); if(e.target.value === "") setForm({...form, trainer_id: ""}); }}
                      className="input-field w-full pl-11" />
                  </div>
                  {showResults && searchTerm.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-white/5">
                      {filteredTrainers.length > 0 ? filteredTrainers.map(tr => {
                        const isFull = tr.trainee_count >= tr.trainee_limit;
                        return (
                          <button key={tr.id} type="button" disabled={isFull} onClick={() => { setSearchTerm(`${tr.first_name} ${tr.last_name}`); setForm({...form, trainer_id: tr.id}); setShowResults(false); }}
                            className={`w-full px-5 py-4 text-left transition-colors group flex justify-between items-center ${isFull ? 'opacity-40 cursor-not-allowed' : 'hover:bg-orange-500/10'}`}>
                            <div>
                              <p className={`text-sm font-bold ${isFull ? 'text-slate-500' : 'text-white group-hover:text-orange-500'}`}>{tr.first_name} {tr.last_name}</p>
                              <p className="text-[9px] uppercase text-slate-500 font-black tracking-tighter">{isFull ? t.status.maxCapacity : (tr.specialty || "Elite Coach")}</p>
                            </div>
                            <div className={`text-[10px] font-black ${isFull ? 'text-red-500' : 'text-slate-400'}`}>{tr.trainee_count} / {tr.trainee_limit}</div>
                          </button>
                        );
                      }) : <div className="p-5 text-[10px] text-slate-600 uppercase font-black text-center">{t.status.noCoach}</div>}
                    </div>
                  )}
                </div>
              )}

              {role === "trainer" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-orange-500 tracking-widest ml-1 flex items-center gap-2"><ShieldCheck size={12} /> {t.labels.membership}</label>
                    <select name="selected_plan" required onChange={handleChange} className="input-field w-full border-orange-500/20 text-orange-500 font-bold appearance-none bg-[#161616]">
                      <option value="">{t.placeholders.selectPlan}</option>
                      {availablePlans.map(p => <option key={p.id} value={p.id}>{p.title} ({p.price})</option>)}
                    </select>
                  </div>
                  <input name="specialty" placeholder={t.placeholders.specialty} onChange={handleChange} className="input-field w-full" />
                </div>
              )}

              <button type="submit" disabled={loading} 
                className="w-full bg-orange-600 py-4.5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-orange-500 transition-all flex items-center justify-center gap-2 group">
                {loading ? t.status.syncing : <>{t.status.start} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/></>}
              </button>
            </form>
          </div>

          <div className="hidden md:flex flex-col space-y-10">
            <div>
              <h3 className="text-7xl font-black italic uppercase leading-[0.85] tracking-tighter mb-4" 
                  dangerouslySetInnerHTML={{ __html: t.marketing.hero }} />
              <p className="text-slate-400 text-xl font-medium max-w-md">{t.marketing.sub}</p>
            </div>
            <div className="grid gap-4">
              {t.marketing.benefits.map((b: any, i: number) => (
                <BenefitItem key={i} title={b.title} desc={b.desc} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .input-field { background: #161616; border: 1px solid #262626; border-radius: 16px; padding: 14px 18px; font-size: 14px; font-weight: 600; color: white; outline: none; transition: all 0.3s; }
        .input-field:focus { border-color: #ff6b1a; box-shadow: 0 0 0 4px rgba(255, 107, 26, 0.1); }
      `}</style>
      <Footer dict={dict} />
    </main>
  );
}

function RoleButton({ active, onClick, icon, label }: any) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${
        active ? "border-orange-600 bg-orange-600/10 text-orange-600 shadow-inner" : "border-slate-800 bg-[#161616] text-slate-500 hover:border-slate-700"
      }`}>{icon} {label}</button>
  );
}

function BenefitItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="bg-orange-600/10 p-3 rounded-2xl h-fit group-hover:bg-orange-600/20 transition-colors">
        <CheckCircle className="text-orange-600" size={20} />
      </div>
      <div>
        <h4 className="font-black uppercase italic text-sm tracking-tight text-white">{title}</h4>
        <p className="text-slate-500 text-xs font-bold leading-tight">{desc}</p>
      </div>
    </div>
  );
}