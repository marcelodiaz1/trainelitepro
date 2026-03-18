"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  MoreVertical, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Briefcase, 
  ClipboardList,
  Copy,
  Check,
  QrCode
} from "lucide-react";
import Pagination from "@/components/dashboard/Pagination";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 1. UPDATED INTERFACE
interface PricingPlan {
  id: string;
  title: string;
  price: string;
  features: string[];
  paypal_button_id: string | null;
  payment_method: 'paypal' | 'bank_transfer' | 'both'; // New Field
  show_bank_details: boolean; // New Field
  cta: string | null;
  created_at: string;
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("plans")
        .select("*", { count: "exact" })
        .eq('trainer_id', user.id)
        .ilike('title', `%${searchTerm}%`)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (!error) {
        setPlans(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    };
    fetchPlans();
  }, [page, searchTerm, pageSize]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (!error) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setTotal((prev) => prev - 1);
    }
    setDropdownOpen(null);
  };

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 max-w-7xl w-full mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 uppercase italic flex items-center gap-3">
              <ClipboardList className="text-[#ff6b1a]" /> Subscription Plans
            </h1>
            <p className="text-slate-500 text-sm">Manage tiers, pricing, and payment methods.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64"> 
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
              <input 
                type="text" 
                placeholder="Search plans..." 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs focus:border-[#ff6b1a] outline-none transition-all placeholder:text-slate-700"
              />
            </div> 
            <Link href="/dashboard/plans/new">
              <button className="bg-[#ff6b1a] hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-orange-600/20">
                <Plus size={16} /> Create Plan
              </button>
            </Link> 
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="h-10 w-10 border-b-2 border-[#ff6b1a] rounded-full animate-spin mb-4" />
            <p className="tracking-widest text-[10px] text-slate-500">SYNCING PLANS</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-[#111] border border-slate-800 border-dashed rounded-3xl p-20 text-center text-slate-500">
            <p className="uppercase italic tracking-widest text-xs">No plans configured yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <motion.div 
                  layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={plan.id} 
                  className="bg-[#111] border border-slate-800 rounded-2xl overflow-hidden group hover:border-[#ff6b1a]/30 transition-all shadow-2xl relative"
                >
                  <div className="flex flex-col sm:flex-row h-full">
                    {/* Visual Indicator Side-bar */}
                    <div className={`w-full sm:w-1.5 ${plan.payment_method === 'bank_transfer' ? 'bg-emerald-500' : 'bg-blue-500'}`} />

                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">{plan.title}</h3>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <div className="flex items-center gap-1 text-[#ff6b1a] font-bold text-sm">
                              <DollarSign size={14} /> {plan.price}
                            </div>
                            
                            {/* PAYMENT METHOD BADGE */}
                            {plan.payment_method === 'bank_transfer' ? (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-tighter border border-emerald-500/20">
                                <Briefcase size={10} /> Bank Transfer
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-tighter border border-blue-500/20">
                                <CreditCard size={10} /> PayPal: {plan.paypal_button_id || 'N/A'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button 
                            onClick={() => setDropdownOpen(dropdownOpen === plan.id ? null : plan.id)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
                          >
                            <MoreVertical size={18} />
                          </button>
                          <AnimatePresence>
                            {dropdownOpen === plan.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(null)} />
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                  className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
                                >
                                  <Link href={`/dashboard/plans/${plan.id}/edit`} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-slate-800 transition-colors">
                                    <Edit2 size={14} className="text-blue-400" /> Edit Plan
                                  </Link> 
                                  <button onClick={() => handleDelete(plan.id)} className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold hover:bg-red-500/10 text-red-400 border-t border-slate-800">
                                    <Trash2 size={14} /> Delete Plan
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mb-6 flex-1">
                        <div className="flex flex-wrap gap-1.5">
                          {plan.features?.map((feature, idx) => (
                            <span key={idx} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-slate-500 uppercase font-medium">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                        <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
                        
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12">
              <Pagination 
                currentPage={page} 
                totalItems={total} 
                pageSize={pageSize} 
                onPageChange={setPage} 
                label="Plans" 
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// 2. HELPER COMPONENT FOR BANK DETAILS (Used in Checkout/Public view)
export function BankTransferDetails({ trainer }: { trainer: any }) {
  const [copied, setCopied] = useState(false);

  const transferString = `Titular: ${trainer.bank_full_name}\nRUT: ${trainer.bank_rut}\nBanco: ${trainer.bank_name}\nCuenta: ${trainer.bank_account_type}\nNº: ${trainer.bank_account_number}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(transferString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111] border border-zinc-800 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <QrCode className="text-emerald-500" size={20} />
          </div>
          <h4 className="font-black uppercase italic tracking-tighter text-lg">Bank Info</h4>
        </div>
        {copied && <span className="text-[10px] font-black text-emerald-500 uppercase animate-bounce">Copied!</span>}
      </div>

      <div className="space-y-5 mb-10">
        <BankRow label="Beneficiary" value={trainer.bank_full_name} />
        <BankRow label="RUT / ID" value={trainer.bank_rut} />
        <BankRow label="Bank" value={trainer.bank_name} />
        <BankRow label="Account Number" value={trainer.bank_account_number} />
      </div>

      <button 
        onClick={handleCopy}
        className="w-full py-4 bg-white text-black hover:bg-zinc-200 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-3 shadow-xl"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />} 
        {copied ? "Details Ready" : "Copy Transfer Data"}
      </button>
    </div>
  );
}

function BankRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="border-b border-zinc-800/50 pb-2">
      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-zinc-200 truncate">{value || 'Not set'}</p>
    </div>
  );
}