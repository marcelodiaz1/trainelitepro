"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@supabase/supabase-js";
import { 
  ChevronLeft, 
  Star, 
  Mail, 
  Shield, 
  Award, 
  Calendar,
  Activity,
  UserCheck,
  Edit2
} from "lucide-react";
import Link from "next/link";

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
}

export default function TrainerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="bg-[#050505] min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-b-2 border-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="bg-[#050505] text-slate-200 min-h-screen flex font-sans">
      

      <div className="p-8 flex-1 max-w-5xl mx-auto w-full">
        {/* Breadcrumb */}
        <Link href="/dashboard/trainees" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ChevronLeft size={16} /> Back to Trainees
        </Link>

        {/* Profile Header */}
        <div className="bg-[#111] border border-slate-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserCheck size={120} className="text-blue-500" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="h-32 w-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              {trainer?.first_name[0]}{trainer?.last_name[0]}
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
    </main>
  );
}

function StatMini({ icon, label, value, color = "text-blue-400" }: any) {
  return (
    <div className="bg-[#1a1a1a] border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
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