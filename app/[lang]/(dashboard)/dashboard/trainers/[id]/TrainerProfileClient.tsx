"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, Star, Mail, Shield, Award, Activity,
  UserCheck, Edit2, CreditCard, Copy, Check, X
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TrainerProfileClient({ dict, lang, id }: { dict: any; lang: string; id: string }) {
  const router = useRouter();
  const t = dict.profile;
  const [trainer, setTrainer] = useState<any | null>(null);
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
        router.push(`/${lang}/dashboard/trainers`);
        return;
      }
      setTrainer(data);
      setLoading(false);
    };
    fetchTrainer();
  }, [id, router, lang]);

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-b-2 border-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="relative bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        {/* Breadcrumb */}
        <LocalizedLink href={`/${lang}/dashboard/trainers`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> {t.back}
        </LocalizedLink>

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
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs font-bold uppercase tracking-widest text-emerald-400 transition-all active:scale-95 z-20"
                  >
                    <CreditCard size={14} /> {t.billing}
                  </button>

                  <LocalizedLink href={`/${lang}/dashboard/trainers/${id}/edit`}>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 text-xs font-bold uppercase tracking-widest text-slate-300 transition-all active:scale-95 shadow-lg">
                      <Edit2 size={14} className="text-blue-400" /> {t.edit}
                    </button>
                  </LocalizedLink>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <StatMini icon={<Award size={14}/>} label={t.specialty} value={trainer?.specialty || t.generalist} />
                <StatMini icon={<Star size={14}/>} label={t.rating} value={`${trainer?.rating || "0.0"} / 5.0`} color="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-[#111] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <Activity size={14} className="text-blue-500" /> {t.overview}
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <DetailItem label={t.staffId} value={`#${id.slice(0, 8)}`} />
                <DetailItem label={t.joinDate} value={new Date(trainer?.created_at || "").toLocaleDateString(lang)} />
                <DetailItem label={t.role} value={t.eliteTrainer} />
                <DetailItem label={t.accessLevel} value={t.portal} />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-[#111] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                <Shield size={14} className="text-blue-500" /> {t.permissions}
              </h3>
              <ul className="space-y-3">
                <PermissionItem label={t.permRoutines} active={true} />
                <PermissionItem label={t.permClients} active={true} />
                <PermissionItem label={t.permFinancial} active={false} />
              </ul>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl z-[1000]"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{t.billingDetails}</h2>
                    <div className="h-1 w-12 bg-emerald-500 mt-2 rounded-full" />
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-5 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 mb-8">
                  <ModalDetail label={t.fullName} value={trainer?.bank_full_name} unset={t.unset} />
                  <ModalDetail label={t.bank} value={trainer?.bank_name} unset={t.unset} />
                  <ModalDetail label={t.accountNum} value={trainer?.bank_account_number} unset={t.unset} />
                  <ModalDetail label={t.rutId} value={trainer?.bank_rut} unset={t.unset} />
                  <ModalDetail label={t.type} value={trainer?.bank_account_type} unset={t.unset} />
                </div>

                <CopyButton trainer={trainer} labels={{ copy: t.copy, copied: t.copied }} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Sub-components
function CopyButton({ trainer, labels }: any) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    const text = `Beneficiary: ${trainer?.bank_full_name}\nBank: ${trainer?.bank_name}\nAccount: ${trainer?.bank_account_number}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className={`w-full py-5 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-3 ${copied ? "bg-emerald-500 text-white" : "bg-white text-black"}`}>
      {copied ? <Check size={20} /> : <Copy size={20} />}
      {copied ? labels.copied : labels.copy}
    </button>
  );
}

function ModalDetail({ label, value, unset }: any) {
  return (
    <div>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-100">{value || unset}</p>
    </div>
  );
}

function StatMini({ icon, label, value, color = "text-blue-400" }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-bold">{value}</p>
    </div>
  );
}

function PermissionItem({ label, active }: any) {
  return (
    <li className={`flex items-center justify-between text-[11px] font-bold uppercase ${active ? "text-slate-300" : "text-slate-600 line-through"}`}>
      {label}
      <div className={`h-1.5 w-1.5 rounded-full ${active ? "bg-blue-500" : "bg-slate-800"}`} />
    </li>
  );
}