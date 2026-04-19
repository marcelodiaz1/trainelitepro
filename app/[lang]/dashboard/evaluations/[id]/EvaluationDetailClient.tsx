"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Scale, 
  Dna, 
  Move, 
  Target, 
  Activity,
  Edit2
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EvaluationDetailClient({ dict, lang }: { dict: any; lang: string }) {
  const { id } = useParams();
  const t = dict.evaluationDetail;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      const { data: evalData, error } = await supabase
        .from("evaluations")
        .select("*, trainee:trainee_id(first_name, last_name)")
        .eq("id", id)
        .single();

      if (!error) setData(evalData);
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="bg-black min-h-screen" />;
  if (!data) return null;

  const MetricCard = ({ label, value, unit, icon: Icon, color = "orange" }: any) => (
    <div className="bg-[#111] border border-slate-800 p-5 rounded-3xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity text-${color}-500`}>
        <Icon size={40} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black italic text-white">{value || "0"}</span>
        <span className="text-xs font-bold text-slate-600 uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <main className="bg-[#050505] text-white min-h-screen flex">
      <div className="flex-1 p-8 overflow-y-auto">
        <LocalizedLink href={`/${lang}/dashboard/evaluations`} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> {t.back}
        </LocalizedLink>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-orange-500 text-[10px] font-black px-2 py-0.5 rounded text-black uppercase">{t.reportType}</span>
               <span className="text-slate-500 font-mono text-xs">
                 {new Date(data.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { 
                   month: 'long', day: 'numeric', year: 'numeric' 
                 })}
               </span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">
              {data.trainee?.first_name} <span className="text-orange-500">{data.trainee?.last_name}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4 border-r border-slate-800 pr-6">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{t.status}</p>
              <div className="text-xl font-bold text-green-500 uppercase italic leading-none">{data.results || "Optimized"}</div>
            </div>
            
            <LocalizedLink href={`/${lang}/dashboard/evaluations/${id}/edit`}>
              <button className="flex items-center gap-2 bg-[#111] border border-slate-700 hover:border-blue-500 hover:bg-blue-600 transition-all px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest group shadow-xl">
                <Edit2 size={14} className="text-slate-400 group-hover:text-white" />
                <span>{t.edit}</span>
              </button>
            </LocalizedLink>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Core Metrics */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 mb-6 flex items-center gap-2">
              <Dna size={14} /> {t.coreMetrics}
            </h3>
            <MetricCard label={t.metrics.weight} value={data.weight} unit="kg" icon={Scale} />
            <MetricCard label={t.metrics.fatPercentage} value={data.fat_percentage} unit="%" icon={Activity} />
            <MetricCard label={t.metrics.leanMass} value={data.lean_mass} unit="kg" icon={Target} color="blue" />
            <MetricCard label={t.metrics.fatMass} value={data.fat_mass} unit="kg" icon={Move} color="red" />
          </div>

          {/* CENTER: Body Visualizer */}
          <div className="lg:col-span-6 relative bg-[#0a0a0a] border border-slate-900 rounded-[4rem] flex items-center justify-center py-12 overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            <div className="relative w-full h-full max-w-md">
              <div className="flex justify-center">
                 <img 
                    src="/body.jpg" 
                    alt="Anatomy Diagram"
                    style={{ filter: "invert(1)" }}
                    className="h-[500px] w-auto object-contain mix-blend-screen opacity-80"
                 />
              </div>

              <BodyCallout side="left" top="15%" label={t.anatomy.shoulderBlade} value={data.shoulder_blade} />
              <BodyCallout side="right" top="20%" label={t.anatomy.armBiceps} value={`${data.arm} / ${data.biceps}`} />
              <BodyCallout side="left" top="35%" label={t.anatomy.torsoChest} value={data.torso} />
              <BodyCallout side="right" top="45%" label={t.anatomy.waist} value={data.waist} />
              <BodyCallout side="left" top="55%" label={t.anatomy.suprailiac} value={data.suprailiac} />
              <BodyCallout side="right" top="65%" label={t.anatomy.hip} value={data.hip} />
              <BodyCallout side="left" top="75%" label={t.anatomy.legThigh} value={data.leg} />
              <BodyCallout side="right" top="85%" label={t.anatomy.shinWrist} value={`${data.shin} / ${data.wrist}`} />

              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_rgba(249,115,22,0.5)] z-10"
              />
            </div>
          </div>

          {/* RIGHT: Fold Analysis */}
          <div className="lg:col-span-3">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 mb-6 flex items-center gap-2">
              <Activity size={14} /> {t.foldAnalysis}
            </h3>
            <div className="space-y-2 bg-[#111] p-6 rounded-3xl border border-slate-800">
                <FoldItem label={t.folds.triceps} value={data.triceps} />
                <FoldItem label={t.folds.biceps} value={data.biceps} />
                <FoldItem label={t.folds.subscapular} value={data.shoulder_blade} />
                <FoldItem label={t.folds.suprailiac} value={data.suprailiac} />
                <FoldItem label={t.folds.torso} value={data.torso} />
                <FoldItem label={t.folds.addition} value={data.addition} highlight />
                
                <div className="mt-8 pt-6 border-t border-slate-800">
                   <p className="text-[10px] font-black text-slate-600 uppercase mb-4 tracking-widest">{t.calculatedImc}</p>
                   <div className="text-5xl font-black italic text-white">{data.imc}</div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function BodyCallout({ side, top, label, value }: any) {
  return (
    <div 
      className={`absolute hidden md:flex items-center gap-4 w-48 ${side === 'left' ? 'right-full mr-4 text-right flex-row-reverse' : 'left-full ml-4 text-left'}`}
      style={{ top }}
    >
      <div className="h-[1px] w-12 bg-slate-800 relative">
        <div className={`absolute w-2 h-2 bg-orange-500 rounded-full -top-1 ${side === 'left' ? '-right-1' : '-left-1'}`} />
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</p>
        <p className="text-lg font-bold italic text-white leading-none">{value || "—"}</p>
      </div>
    </div>
  );
}

function FoldItem({ label, value, highlight }: any) {
  return (
    <div className={`flex justify-between items-center py-3 border-b border-slate-800/50 ${highlight ? 'text-orange-500' : ''}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      <span className="font-mono font-bold">{value || "0.00"} <span className="text-[8px] text-slate-600">MM</span></span>
    </div>
  );
}