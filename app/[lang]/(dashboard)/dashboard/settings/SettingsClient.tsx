"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Database, Users, Shield, User, Mail, 
  Star, Loader2, Dumbbell, Zap, LayoutGrid, CheckCircle2 
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsClient({ dict, lang }: { dict: any; lang: string }) {
  const t = dict?.settings || {};
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("*, plans(*)") 
            .eq("id", user.id)
            .single();

          if (error) throw error;
          setProfile(data);
        }
      } catch (error: any) {
        console.error("Error loading profile:", error.message);
      } finally {
        setLoading(false);
      }
    }
    getProfile();
  }, []);

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-[#111] border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
      <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon size={100} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <div className="text-3xl font-black italic uppercase tracking-tighter text-white">{value}</div>
    </div>
  );

  return (
    <main className="bg-[#050505] text-white min-h-screen flex">
      <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black italic uppercase flex items-center gap-4 tracking-tighter">
              <Settings className="text-orange-500" size={40} />
              {t.title} <span className="text-orange-500">{t.titleAccent}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide">
              {t.subtitle}
            </p>
          </div>
          <button 
            onClick={() => router.push(`/${lang}/dashboard/settings/edit`)}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/10"
          >
            {t.editProfile}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: IDENTITY */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-slate-800 rounded-[2.5rem] p-8 text-center">
                   <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-orange-500 rounded-[2rem] blur-2xl opacity-20 animate-pulse"></div>
                      <div className="relative w-32 h-32 bg-zinc-900 rounded-[2rem] border-2 border-orange-500/30 flex items-center justify-center overflow-hidden">
                        {profile?.profile_picture ? (
                          <img src={profile.profile_picture} className="w-full h-full object-cover" />
                        ) : (
                          <User size={50} className="text-zinc-700" />
                        )}
                      </div>
                   </div>
                   <h2 className="text-2xl font-black uppercase italic leading-none mb-2">
                      {profile?.first_name} <span className="text-orange-500">{profile?.last_name}</span>
                   </h2>
                   <p className="text-slate-500 text-xs font-mono mb-6">{profile?.email}</p>
                   
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                      <Zap size={14} className="text-orange-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                        {profile?.plans?.title || t.tierStandard}
                      </span>
                   </div>
                </div>

                <div className="bg-[#111] border border-slate-800 rounded-3xl p-6">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">{t.quickStats}</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">{t.status}</span>
                        <span className="text-xs font-bold text-emerald-500 uppercase">{t.statusActive}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">{t.role}</span>
                        <span className="text-xs font-bold uppercase italic">{profile?.role || t.roleDefault}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* RIGHT COLUMN: DATA & MODULES */}
              <div className="lg:col-span-8 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard label={t.metrics?.trainees} value="24" icon={Users} color="text-blue-500" />
                  <StatCard label={t.metrics?.workouts} value="142" icon={Dumbbell} color="text-orange-500" />
                  <StatCard label={t.metrics?.evaluations} value="89" icon={LayoutGrid} color="text-purple-500" />
                </div>

                <div className="bg-[#111] border border-slate-800 rounded-[2.5rem] overflow-hidden">
                   <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                        <Database size={18} className="text-orange-500" /> {t.platform?.title}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono italic">v.2.0.4-stable</span>
                   </div>
                   
                   <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ConfigItem 
                        title={t.platform?.integrations} 
                        desc={t.platform?.integrationsDesc} 
                        status={t.platform?.comingSoon} 
                        icon={Zap} 
                      />
                      <ConfigItem 
                        title={t.platform?.security} 
                        desc={t.platform?.securityDesc} 
                        status={t.platform?.enabled} 
                        icon={Shield} 
                        active
                      />
                   </div>
                </div>

               {profile?.role === "trainer" && (
                <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl shadow-orange-500/20">
                  <div>
                    <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">
                      {t.upgrade?.title}
                    </h3>
                    <p className="text-black/70 text-sm font-bold">
                      {t.upgrade?.desc}
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push(`/${lang}/pricing`)}
                    className="bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    {t.upgrade?.button}
                  </button>
                </div>
              )}

              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ConfigItem({ title, desc, status, icon: Icon, active }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-start gap-4">
       <div className={`p-3 rounded-2xl ${active ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
          <Icon size={20} />
       </div>
       <div className="text-left">
          <h4 className="text-sm font-bold mb-1">{title}</h4>
          <p className="text-xs text-slate-500 mb-3">{desc}</p>
          <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md ${active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-slate-500'}`}>
            {status}
          </span>
       </div>
    </div>
  );
}