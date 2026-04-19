"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { CreditCard, DollarSign, RefreshCw, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments");
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
       <main className="bg-[#0b0b0b] text-white min-h-screen flex">
          
          <div className="p-8 flex-1 max-w-1xl   w-full">  
        {/* HEADER */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-extrabold italic uppercase flex items-center gap-3 tracking-tighter">
              <CreditCard className="text-orange-500" />
              Payments
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Live transaction history from your PayPal account.
            </p>
          </div>
          <button 
            onClick={fetchPayments}
            className="p-3 bg-[#111] border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin text-orange-500" : ""} />
          </button>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="bg-[#111] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex items-center gap-4">
            <DollarSign className="text-emerald-400" />
            <h2 className="font-bold text-lg uppercase tracking-tight">Recent Activity</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-black text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Customer / Email</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-8 bg-white/5" />
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={tx.transaction_info.transaction_id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                          tx.transaction_info.transaction_status === 'S' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {tx.transaction_info.transaction_status === 'S' ? 'Success' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                            {tx.payer_info?.payer_name?.alternate_full_name || "Guest Customer"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {tx.payer_info?.email_address}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Calendar size={14} className="text-slate-600" />
                          {new Date(tx.transaction_info.transaction_updated_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-white">
                        {tx.transaction_info.transaction_amount.value} {tx.transaction_info.transaction_amount.currency_code}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center text-slate-600 italic">
                      No recent transactions found in the last 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}