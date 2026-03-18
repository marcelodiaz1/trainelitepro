"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  MapPin, 
  Star, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  CreditCard 
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Plan {
  id: string;
  title: string;
  price: number;
  features: string[];
  cta: string | null;
  payment_method: 'paypal' | 'bank_transfer' | 'both'; // Ensure this is in your DB
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
  // Bank fields
  bank_full_name?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_rut?: string;
  bank_account_type?: string;
}

export default function TrainerProfilePage() {
  const { id } = useParams();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 1. MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrainerData = async () => {
      setLoading(true);
      
      const { data: trainerData } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .eq("trainer_id", id);

      if (trainerData) setTrainer(trainerData);
      if (plansData) setPlans(plansData);
      
      setLoading(false);
    };

    if (id) fetchTrainerData();
  }, [id]);

  if (loading) return <div className="bg-[#0b0b0b] min-h-screen text-white flex items-center justify-center">Loading profile...</div>;
  if (!trainer) return <div className="bg-[#0b0b0b] min-h-screen text-white flex items-center justify-center text-red-500">Trainer not found.</div>;

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen relative">
      <Navbar />

      <section className="max-w-6xl mx-auto py-32 px-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-80 h-80 relative rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
            <Image 
              src={trainer.profile_picture || "/trainers/default.png"} 
              alt={`${trainer.first_name} ${trainer.last_name}`} 
              fill 
              className="object-cover" 
            />
          </motion.div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold tracking-tighter italic uppercase mb-2">{trainer.first_name} {trainer.last_name}</h1>
            <p className="text-[#ff6b1a] text-xl font-bold uppercase tracking-widest mb-4">{trainer.specialty || "Fitness Specialist"}</p>
            
            <div className="flex items-center gap-2 mb-6 text-gray-400">
               <Star className="text-yellow-500 fill-yellow-500" size={20} />
               <span className="font-bold text-white">{trainer.rating ?? 0}/5</span>
               <span>•</span>
               <MapPin size={18} /> {trainer.address || "Remote"}
            </div>

            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-8">{trainer.bio || "No biography available."}</p>
            
            <div className="flex gap-4">
              <a href={`mailto:${trainer.email}`} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-[#ff6b1a] hover:text-white transition-all">
                Contact Now
              </a>
            </div>
          </div>
        </div>

        {/* Training Plans Section */}
        <div className="border-t border-gray-900 pt-20">
          <h2 className="text-3xl font-bold italic uppercase tracking-tighter mb-12 flex items-center gap-3">
            <div className="h-1 w-12 bg-[#ff6b1a]"></div>
            Training Tiers
          </h2>

          {plans.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-[#111] border border-gray-800 p-8 rounded-3xl flex flex-col hover:border-[#ff6b1a]/50 transition-colors">
                  <h3 className="text-2xl font-bold mb-1">{plan.title}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black">${plan.price}</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                        <CheckCircle2 size={18} className="text-[#ff6b1a] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* 2. UPDATED BUTTON LOGIC */}
                  <button 
                    onClick={() => plan.payment_method === 'bank_transfer' ? setIsModalOpen(true) : alert("PayPal Checkout Coming Soon")}
                    className="w-full bg-[#1a1a1a] border border-gray-700 py-4 rounded-2xl font-bold hover:bg-[#ff6b1a] hover:text-black transition-all uppercase tracking-widest text-xs"
                  >
                    {plan.cta || "Get Started"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#111] p-12 rounded-3xl text-center border border-dashed border-gray-800">
              <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">This trainer hasn't listed any plans yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. INTEGRATED MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl z-10"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Payment Details</h2>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manual Bank Transfer</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5 bg-white/[0.02] p-6 rounded-3xl border border-white/5 mb-8">
                  <ModalDetail label="Beneficiary" value={trainer.bank_full_name} />
                  <ModalDetail label="Bank" value={trainer.bank_name} />
                  <ModalDetail label="Account Number" value={trainer.bank_account_number} />
                  <ModalDetail label="RUT / ID" value={trainer.bank_rut} />
                  <ModalDetail label="Account Type" value={trainer.bank_account_type} />
                </div>

                <CopyButton trainer={trainer} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}

// 4. SUB-COMPONENTS
function CopyButton({ trainer }: { trainer: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `
Beneficiary: ${trainer?.bank_full_name}
Bank: ${trainer?.bank_name}
Account: ${trainer?.bank_account_number}
RUT: ${trainer?.bank_rut}
Type: ${trainer?.bank_account_type}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-3 ${
        copied ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
      {copied ? "Copied" : "Copy Transfer Info"}
    </button>
  );
}

function ModalDetail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-white tracking-tight">{value || "Not available"}</p>
    </div>
  );
}