"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  Star, 
  Mail, 
  Shield, 
  Award, 
  Activity,
  UserCheck,
  Edit2,
  CreditCard,
  Copy,
  Check,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  specialty: string | null;
  rating: number | null;
  status: string;
  created_at: string;
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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTrainer = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        router.push("/dashboard/trainers");
        return;
      }
      setTrainer(data as Trainer);
      setLoading(false);
    };

    fetchTrainer();
  }, [id, router]);

  // Debugging function
  const toggleModal = () => {
    console.log("Modal state before:", isModalOpen);
    setIsModalOpen(!isModalOpen);
  };

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-b-2 border-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="relative bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        {/* Breadcrumb */}
        <Link href="/dashboard/trainers" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Back to Staff
        </Link>

        {/* Profile Header */}
        <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserCheck size={120} className="text-blue-500" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="h-32 w-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              {trainer?.first_name?.[0]}{trainer?.last_name?.[0]}
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                      {trainer?.first_name} {trainer?.last_name}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      trainer?.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {trainer?.status}
                    </span>
                  </div>
                  <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
                    <Mail size={14} className="text-blue-500" /> {trainer?.email}
                  </p>
                </div>

                <div className="flex justify-center md:justify-end gap-3">
                  <button 
                    onClick={toggleModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs font-bold uppercase tracking-widest text-emerald-400 transition-all active:scale-95 z-20"
                  >
                    <CreditCard size={14} /> Billing Info
                  </button>

                  <Link href={`/dashboard/trainers/${trainer?.id}/edit`}>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 text-xs font-bold uppercase tracking-widest text-slate-300 transition-all active:scale-95 shadow-lg">
                      <Edit2 size={14} className="text-blue-400" /> Edit Profile
                    </button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <StatMini icon={<Award size={14}/>} label="Specialty" value={trainer?.specialty || "Generalist"} />
                <StatMini icon={<Star size={14}/>} label="Rating" value={`${trainer?.rating || "0.0"} / 5.0`} color="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-[#111] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <Activity size={14} className="text-blue-500" /> Professional Overview
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <DetailItem label="Staff ID" value={`#${trainer?.id.slice(0, 8)}`} />
                <DetailItem label="Join Date" value={new Date(trainer?.created_at || "").toLocaleDateString()} />
                <DetailItem label="Role" value="Elite Trainer" />
                <DetailItem label="Access Level" value="Trainer Portal" />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-[#111] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <Shield size={14} className="text-blue-500" /> Permissions
              </h3>
              <ul className="space-y-3">
                <PermissionItem label="Manage Routines" active={true} />
                <PermissionItem label="Client Communication" active={true} />
                <PermissionItem label="Financial Data" active={false} />
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* MODAL MOVED TO THE END OF MAIN FOR Z-INDEX PURPOSES */}
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] z-[1000]"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Billing Details</h2>
                    <div className="h-1 w-12 bg-emerald-500 mt-2 rounded-full" />
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-5 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 mb-8">
                  <ModalDetail label="Full Name" value={trainer?.bank_full_name} />
                  <ModalDetail label="Bank" value={trainer?.bank_name} />
                  <ModalDetail label="Account #" value={trainer?.bank_account_number} />
                  <ModalDetail label="RUT / ID" value={trainer?.bank_rut} />
                  <ModalDetail label="Type" value={trainer?.bank_account_type} />
                </div>

                <CopyButton trainer={trainer} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Sub-components (Stateless)
function CopyButton({ trainer }: { trainer: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `
Beneficiary: ${trainer?.bank_full_name || 'N/A'}
Bank: ${trainer?.bank_name || 'N/A'}
Account: ${trainer?.bank_account_number || 'N/A'}
RUT: ${trainer?.bank_rut || 'N/A'}
Type: ${trainer?.bank_account_type || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
        copied ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {copied ? <Check size={20} /> : <Copy size={20} />}
      {copied ? "Copied to Clipboard" : "Copy All Details"}
    </button>
  );
}

function ModalDetail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-100 tracking-tight truncate">{value || "Unset"}</p>
    </div>
  );
}

function StatMini({ icon, label, value, color = "text-blue-400" }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-bold tracking-tight">{value}</p>
    </div>
  );
}

function PermissionItem({ label, active }: { label: string; active: boolean }) {
  return (
    <li className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter ${active ? "text-slate-300" : "text-slate-600 line-through"}`}>
      {label}
      <div className={`h-1.5 w-1.5 rounded-full ${active ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-800"}`} />
    </li>
  );
}