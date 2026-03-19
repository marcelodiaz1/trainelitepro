"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MapPin, 
  Star, 
  Check, 
  X, 
  Copy, 
  CreditCard,
  ChevronRight
} from "lucide-react";

// Configuración de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Plan {
  id: string;
  title: string;
  price: string;
  features: string[];
  cta: string | null;
}

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string | null;
  profile_picture: string | null;
  bio: string | null;
  phone: string | null;
  address: string | null;
  rating: number | null;
  email: string;
  own_plans?: string[];
  // Datos bancarios
  bank_full_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_rut?: string;
  bank_account_type?: string;
}

export default function TrainerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrainerAndPlans = async () => {
      try {
        if (!id) return;

        // 1. Obtener al Entrenador
        const { data: trainerData, error: trainerError } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .single();

        if (trainerError || !trainerData) {
          router.push("/dashboard/trainers");
          return;
        }

        setTrainer(trainerData as Trainer);

        // 2. Obtener los Planes usando el array own_plans
        if (trainerData.own_plans && trainerData.own_plans.length > 0) {
          const { data: plansData, error: plansError } = await supabase
            .from("plans")
            .select("*")
            .in("id", trainerData.own_plans);

          if (!plansError && plansData) {
            setPlans(plansData as Plan[]);
          }
        }
      } catch (err) {
        console.error("Error cargando el perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainerAndPlans();
  }, [id, router]);

  if (loading) return (
    <div className="bg-[#0b0b0b] min-h-screen text-white flex items-center justify-center font-black italic uppercase tracking-widest">
      Loading Profile...
    </div>
  );

  if (!trainer) return (
    <div className="bg-[#0b0b0b] min-h-screen text-white flex items-center justify-center text-red-500 font-bold">
      Trainer not found.
    </div>
  );

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen relative font-sans">
      <Navbar />

      <section className="max-w-6xl mx-auto py-32 px-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-12 mb-20 items-center md:items-start">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full md:w-96 h-96 relative rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
          >
            <Image 
              src={trainer.profile_picture || "/trainers/default.png"} 
              alt={`${trainer.first_name}`} 
              fill 
              className="object-cover" 
            />
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-6xl font-black tracking-tighter italic uppercase mb-2 leading-none">
              {trainer.first_name} <span className="text-white/20">{trainer.last_name}</span>
            </h1>
            <p className="text-[#ff6b1a] text-xl font-black uppercase tracking-[0.3em] mb-6 italic">
              {trainer.specialty || "Elite Coach"}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mb-8 text-gray-400 font-bold text-sm uppercase tracking-widest">
               <div className="flex items-center gap-2">
                 <Star className="text-[#ff6b1a] fill-[#ff6b1a]" size={16} />
                 <span className="text-white">{trainer.rating ?? "5.0"}</span>
               </div>
               <div className="flex items-center gap-2">
                 <MapPin size={16} className="text-[#ff6b1a]" />
                 <span>{trainer.address || "Australia"}</span>
               </div>
            </div>

            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-10 font-medium italic">
              "{trainer.bio || "Este coach prefiere dejar que sus resultados hablen por él."}"
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-[#ff6b1a] text-black font-black uppercase italic tracking-tighter py-4 px-10 rounded-2xl hover:bg-orange-500 transition-all flex items-center gap-3 active:scale-95 shadow-lg shadow-orange-500/20"
              >
                <CreditCard size={20} /> Get Started
              </button>
              <a 
                href={`mailto:${trainer.email}`} 
                className="bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-tighter py-4 px-10 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-3"
              >
                <Mail size={20} /> Contact
              </a>
            </div>
          </div>
        </div>

        {/* Membership Section */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Choose your Tier</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <motion.div 
                  key={plan.id}
                  whileHover={{ y: -5 }}
                  className="bg-[#111] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between hover:border-[#ff6b1a]/50 transition-all group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-xl font-black uppercase italic text-white leading-tight">{plan.title}</h4>
                      <div className="bg-[#ff6b1a] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase italic">Hot</div>
                    </div>
                    <div className="text-4xl font-black italic mb-8 tracking-tighter">{plan.price}</div>
                    <ul className="space-y-4 mb-10">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-sm text-gray-400 font-bold flex items-center gap-3">
                          <Check size={16} className="text-[#ff6b1a]" /> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-white/5 group-hover:bg-[#ff6b1a] py-4 rounded-2xl text-white group-hover:text-black font-black uppercase italic transition-all flex items-center justify-center gap-2"
                  >
                    Select Plan <ChevronRight size={18} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <p className="text-gray-600 font-black uppercase italic tracking-widest">No plans available for this trainer.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] z-10 overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Payment</h2>
                    <div className="h-1.5 w-12 bg-[#ff6b1a] mt-2 rounded-full" />
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 rounded-full text-gray-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 mb-10">
                  <ModalDetail label="Beneficiary" value={trainer.bank_full_name} />
                  <ModalDetail label="Bank" value={trainer.bank_name} />
                  <ModalDetail label="Account Number" value={trainer.bank_account_number} />
                  <ModalDetail label="RUT / ID" value={trainer.bank_rut} />
                  <ModalDetail label="Account Type" value={trainer.bank_account_type} />
                </div>

                <CopyButton trainer={trainer} />
                
                <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-6">
                  Send your receipt to the coach after transfer
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

// Sub-componentes
function CopyButton({ trainer }: { trainer: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `
Beneficiary: ${trainer?.bank_full_name || '-'}
Bank: ${trainer?.bank_name || '-'}
Account: ${trainer?.bank_account_number || '-'}
RUT: ${trainer?.bank_rut || '-'}
Type: ${trainer?.bank_account_type || '-'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`w-full py-5 rounded-[1.5rem] font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-3 active:scale-95 ${
        copied ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {copied ? <Check size={20} /> : <Copy size={20} />}
      {copied ? "Copied to Clipboard" : "Copy Transfer Info"}
    </button>
  );
}

function ModalDetail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-md font-bold text-white tracking-tight italic">{value || "Unset"}</p>
    </div>
  );
}