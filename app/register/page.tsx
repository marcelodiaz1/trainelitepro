"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle, 
  User, 
  Zap, 
  ShieldCheck, 
  Search, 
  Users, 
  ChevronRight,
  AlertCircle,
  Lock 
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Plan {
  id: string;
  title: string;
  price: string;
  trainee_limit: number;
}

interface TrainerOption {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  trainee_limit: number;
  trainee_count: number;
}

export default function Register() {
  const router = useRouter();
  const [role, setRole] = useState("trainee");
  const [gender, setGender] = useState("Male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [allTrainers, setAllTrainers] = useState<TrainerOption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    specialty: "",
    bio: "",
    selected_plan: "",
    trainer_id: "", 
  });

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Plans first (to get limits)
      const { data: userData, error: userError } = await supabase
      .from("users")
      .select("own_plans")
      .eq("id", "25b0d303-4f0e-44ae-87ca-b6bd93a97664")
      .single();
      let plansData: Plan[] = []; 
      if (userData?.own_plans && Array.isArray(userData.own_plans)) {
      // 2. Fetch only the plans whose IDs are in that "own_plans" array
      const { data: filteredPlans, error: plansError } = await supabase
        .from("plans")
        .select("id, title, trainee_limit, price")
        .in("id", userData.own_plans) // Filters by the array of IDs
        .order("title");

      if (filteredPlans) {
        plansData = filteredPlans;
        setAvailablePlans(filteredPlans);
      }
    }

      if (plansData) setAvailablePlans(plansData);

      // 2. Fetch Trainers and count their trainees
      // We use a flat select to prevent join errors
     const { data: trainersData, error: tError } = await supabase
      .from("users")
      .select(`
        id, 
        first_name, 
        last_name, 
        specialty,
        selected_plan,
        trainees:users!trainer_id(count)
      `)
      .eq("role", "trainer")
      .eq("status", "active");
     if (!tError && trainersData) {
      const formatted = trainersData.map((t: any) => {
        const plan = plansData?.find(p => p.id === t.selected_plan);
        return {
          id: t.id,
          first_name: t.first_name,
          last_name: t.last_name,
          specialty: t.specialty,
          trainee_limit: plan ? plan.trainee_limit : 3,
          trainee_count: t.trainees?.[0]?.count || 0
        };
      });
      setAllTrainers(formatted);
    }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Capacity Check
    if (role === "trainee" && form.trainer_id) {
      const selected = allTrainers.find(t => t.id === form.trainer_id);
      if (selected && selected.trainee_count >= selected.trainee_limit) {
        setError("This trainer is currently at maximum capacity.");
        setLoading(false);
        return;
      }
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role: role,
          gender: gender,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          address: form.address,
          specialty: role === "trainer" ? form.specialty : null,
          bio: role === "trainer" ? form.bio : null,
          selected_plan: role === "trainer" && form.selected_plan ? form.selected_plan : null,
          trainer_id: role === "trainee" && form.trainer_id ? form.trainer_id : null,
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

  const filteredTrainers = allTrainers.filter(t => 
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex flex-col font-sans selection:bg-orange-500/30">
          <Navbar />
      <section className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">
          
          <div className="bg-[#111] p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/5 relative">
            <div className="mb-8">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">Join the <span className="text-orange-600">Elite</span></h2>
              <p className="text-slate-500 text-sm font-medium">
                Already have an account? <Link href="/login" className="text-orange-500 hover:underline font-bold">Sign in</Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <RoleButton active={role === "trainee"} onClick={() => setRole("trainee")} icon={<User size={16}/>} label="Trainee" />
                <RoleButton active={role === "trainer"} onClick={() => setRole("trainer")} icon={<Zap size={16}/>} label="Trainer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input name="first_name" placeholder="First Name" required onChange={handleChange} className="input-field" />
                <input name="last_name" placeholder="Last Name" required onChange={handleChange} className="input-field" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Gender Identification</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Male", "Female"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                        gender === g 
                        ? "border-orange-500 bg-orange-500/10 text-orange-500" 
                        : "border-slate-800 bg-[#161616] text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} className="input-field w-full" />
              <input type="password" name="password" placeholder="Create Password" required onChange={handleChange} className="input-field w-full" />

              {role === "trainee" && (
                <div className="space-y-1 relative">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest ml-1 flex items-center gap-2">
                    <Users size={12} /> Find your Trainer
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                    <input 
                      type="text"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onFocus={() => setShowResults(true)}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if(e.target.value === "") setForm({...form, trainer_id: ""});
                      }}
                      className="input-field w-full pl-11"
                    />
                  </div>

                  {showResults && searchTerm.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-white/5 scrollbar-hide">
                      {filteredTrainers.length > 0 ? filteredTrainers.map(t => {
                        const isFull = t.trainee_count >= t.trainee_limit;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={isFull}
                            onClick={() => {
                              setSearchTerm(`${t.first_name} ${t.last_name}`);
                              setForm({...form, trainer_id: t.id});
                              setShowResults(false);
                            }}
                            className={`w-full px-5 py-4 text-left transition-colors group flex justify-between items-center ${
                              isFull ? 'opacity-40 grayscale bg-[#0d0d0d] cursor-not-allowed' : 'hover:bg-orange-500/10'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-bold ${isFull ? 'text-slate-500' : 'text-white group-hover:text-orange-500'}`}>
                                  {t.first_name} {t.last_name}
                                </p>
                                {isFull && <Lock size={12} className="text-red-500" />}
                              </div>
                              <p className="text-[9px] uppercase text-slate-500 font-black tracking-tighter">
                                {isFull ? "Maximum Capacity Reached" : (t.specialty || "Elite Coach")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] font-black ${isFull ? 'text-red-500' : 'text-slate-400'}`}>
                                {t.trainee_count} / {t.trainee_limit}
                              </p>
                            </div>
                          </button>
                        );
                      }) : (
                        <div className="p-5 text-[10px] text-slate-600 uppercase font-black text-center italic">Coach not found</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {role === "trainer" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-orange-500 tracking-widest ml-1 flex items-center gap-2">
                      <ShieldCheck size={12} /> Membership Level
                    </label>
                    <select name="selected_plan" required onChange={handleChange} className="input-field w-full border-orange-500/20 text-orange-500 font-bold appearance-none">
                      <option value="">Select Plan</option>
                      {availablePlans.map(p => <option key={p.id} value={p.id}>{p.title} {"("+p.price+")"}</option>)}
                    </select>
                  </div>
                  <input name="specialty" placeholder="Specialty (e.g. Strength, Pilates)" onChange={handleChange} className="input-field w-full" />
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-orange-600 py-4.5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-orange-500 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-orange-900/20 mt-4 flex items-center justify-center gap-2 group"
              >
                {loading ? "Syncing..." : <>Start Journey <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/></>}
              </button>
            </form>
          </div>

          <div className="hidden md:flex flex-col space-y-10">
             <div>
                <h3 className="text-7xl font-black italic uppercase leading-[0.85] tracking-tighter mb-4">
                  Push your<br />
                  <span className="text-orange-600 text-8xl">Limits.</span>
                </h3>
                <p className="text-slate-400 text-xl font-medium max-w-md">
                  The all-in-one platform for trainers and athletes to track, grow, and dominate.
                </p>
             </div>
            
            <div className="grid gap-4">
               <BenefitItem title="Performance Analytics" desc="Track every rep and set with precision." />
               <BenefitItem title="Seamless Billing" desc="Automated payments through Stripe integration." />
               <BenefitItem title="Coach Connectivity" desc="Direct 1:1 access to elite training plans." />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .input-field {
          background: #161616;
          border: 1px solid #262626;
          border-radius: 16px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-field:focus {
          border-color: #ff6b1a;
          background: #1a1a1a;
          box-shadow: 0 0 0 4px rgba(255, 107, 26, 0.1);
        }
        .input-field::placeholder {
          color: #444;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.1em;
          font-weight: 800;
        }
        select.input-field {
          cursor: pointer;
        }
      `}</style>
      
            <Footer />
    </main>
  );
}

function RoleButton({ active, onClick, icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-[11px] uppercase tracking-widest ${
        active 
        ? "border-orange-600 bg-orange-600/10 text-orange-600 shadow-inner" 
        : "border-slate-800 bg-[#161616] text-slate-500 hover:border-slate-700"
      }`}
    >
      {icon} {label}
    </button>
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