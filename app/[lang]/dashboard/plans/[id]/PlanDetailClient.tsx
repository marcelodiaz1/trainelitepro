"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Edit2, CreditCard, CheckCircle2, 
  Calendar, Hash, ExternalLink, ShieldCheck 
} from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PlanDetailClient({ dict, lang }: { dict: any, lang: string }) {
  const t = dict.plansDetail;
  const router = useRouter();
  const params = useParams();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        router.push(`/${lang}/dashboard/plans`);
      } else {
        setPlan(data);
      }
      setLoading(false);
    }
    if (params.id) fetchPlan();
  }, [params.id, router, lang]);

  if (loading) {
    return (
      <main className="bg-[#0b0b0b] min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-t-2 border-[#ff6b1a] rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 text-left">
          <div>
            <Link 
              href={`/${lang}/dashboard/plans`} 
              className="text-slate-500 hover:text-[#ff6b1a] flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft size={16} /> {t.backToManagement}
            </Link>
            <h1 className="text-5xl font-extrabold italic uppercase tracking-tighter">
              {plan.title} <span className="text-[#ff6b1a]">{t.details}</span>
            </h1>
          </div>
          
          <Link href={`/${lang}/dashboard/plans/${plan.id}/edit`}>
            <button className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#ff6b1a] transition-all flex items-center gap-2 active:scale-95">
              <Edit2 size={16} /> {t.editConfiguration}
            </button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 text-left">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-[#111] border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#ff6b1a]" /> {t.coreConfiguration}
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">{t.displayPrice}</p>
                  <p className="text-3xl font-bold text-white tracking-tight">{plan.price}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">{t.createdOn}</p>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Calendar size={16} className="text-slate-600" />
                    {new Date(plan.created_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang, { dateStyle: 'long' })}
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800/50">
                <p className="text-slate-500 text-[10px] font-bold uppercase mb-4">{t.featureSetPreview}</p>
                <div className="grid gap-3">
                  {plan.features?.map((feature: string, i: number) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }} key={i} 
                      className="flex items-center gap-3 bg-[#0b0b0b] border border-slate-800/50 p-4 rounded-xl"
                    >
                      <CheckCircle2 size={18} className="text-[#ff6b1a] shrink-0" />
                      <span className="text-sm text-slate-300 font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-[#111] border border-slate-800 rounded-3xl p-6">
              <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6 flex items-center gap-2">
                <CreditCard size={14} /> {t.integration}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-2">{t.paypalButtonId}</label>
                  <code className="bg-black px-3 py-2 rounded-lg text-[#ff6b1a] text-xs font-mono block border border-slate-800">
                    {plan.paypal_button_id || t.notConfigured}
                  </code>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-2">{t.internalCtaPath}</label>
                  {plan.cta ? (
                    <Link href={plan.cta} className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                      {plan.cta} <ExternalLink size={12} />
                    </Link>
                  ) : (
                    <span className="text-slate-700 text-xs italic">{t.noManualCta}</span>
                  )}
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-600 uppercase block mb-2">{t.databaseId}</label>
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono break-all">
                    <Hash size={12} /> {plan.id}
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-gradient-to-br from-[#ff6b1a]/10 to-transparent border border-[#ff6b1a]/20 rounded-3xl p-6">
              <p className="text-[10px] font-bold text-[#ff6b1a] uppercase mb-2">{t.publicPreview}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.publicPreviewDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}