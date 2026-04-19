"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ArrowLeft, Save, Loader2, User, Camera, 
  CreditCard, Shield, Briefcase, MapPin, Key, Lock 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditProfileClient({ dict, lang }: { dict: any, lang: string }) {
  const t = dict.settingsEdit;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [trainers, setTrainers] = useState<any[]>([]);

  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, message: "", error: false });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push(`/${lang}/login`);

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*") 
          .eq("id", user.id)
          .single();
        
        if (profileError) throw profileError;
        setFormData(profile);

        const { data: trainersList } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .eq("role", "trainer")
          .eq("status", "active")
          .order('first_name', { ascending: true });

        if (trainersList) setTrainers(trainersList);
      } catch (err: any) {
        console.error("Error loading profile:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, lang]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    const cleanPayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username || null,
      phone: formData.phone || null,
      address: formData.address || null,
      bio: formData.bio || null,
      specialty: formData.specialty || null,
      dob: formData.dob || null,
      gender: formData.gender || 'Male', 
      trainer_id: formData.trainer_id || null, 
      profile_picture: formData.profile_picture || null,
      bank_full_name: formData.bank_full_name || null,
      bank_rut: formData.bank_rut || null,
      bank_name: formData.bank_name || null,
      bank_account_type: formData.bank_account_type || null,
      bank_account_number: formData.bank_account_number || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("users")
      .update(cleanPayload)
      .eq("id", formData.id);

    setSaving(false);
    if (error) {
      alert(t.messages.updateError + error.message);
    } else {
      alert(t.messages.updateSuccess);
      router.refresh();
      if (activeTab === "profile") router.push(`/${lang}/dashboard/settings`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: dbError } = await supabase.from("users").update({ 
        profile_picture: publicUrl, 
        updated_at: new Date().toISOString() 
      }).eq("id", user.id);

      if (dbError) throw dbError;
      setFormData((prev: any) => ({ ...prev, profile_picture: publicUrl }));
      alert(t.messages.picUpdated);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordStatus({ loading: false, message: t.messages.passMismatch, error: true });
    }
    setPasswordStatus({ loading: true, message: "", error: false });
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    if (error) {
      setPasswordStatus({ loading: false, message: error.message, error: true });
    } else {
      setPasswordStatus({ loading: false, message: t.messages.passSuccess, error: false });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" />
    </div>
  );

  const tabs = [
    { id: "profile", label: t.tabs.general, icon: <User size={18} /> },
    { id: "bank", label: t.tabs.bank, icon: <CreditCard size={18} /> },
    { id: "professional", label: t.tabs.professional, icon: <Briefcase size={18} />, hidden: formData.role !== 'trainer' },
    { id: "security", label: t.tabs.security, icon: <Lock size={18} /> }, 
    { id: "account", label: t.tabs.account, icon: <Shield size={18} /> },
  ];

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> {t.backToSettings}
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 space-y-2 text-left">
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 px-4 text-orange-500">{t.editProfile}</h2>
            {tabs.map((tab) => !tab.hidden && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase transition-all ${
                  activeTab === tab.id 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                  : "text-slate-500 hover:bg-white/5"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-[#111] border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl text-left">
            
            {activeTab === "profile" && (
              <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in duration-300"> 
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative group w-24 h-24">
                    <div className="w-24 h-24 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                      {uploading ? (
                        <Loader2 className="animate-spin text-orange-500" size={32} />
                      ) : formData.profile_picture ? (
                        <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={40} className="text-zinc-700" />
                      )}
                    </div>
                    <label htmlFor="picture-upload" className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl">
                      <Camera size={24} className="text-white" />
                      <input type="file" id="picture-upload" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{t.sections.personal}</h3>
                    <p className="text-slate-500 text-xs">{t.sections.personalDesc}</p>
                  </div>
                </div> 

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label={t.labels.firstName} name="first_name" value={formData.first_name} onChange={handleChange} required />
                  <Input label={t.labels.lastName} name="last_name" value={formData.last_name} onChange={handleChange} required />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t.labels.gender}</label>
                    <select name="gender" value={formData.gender || "Male"} onChange={handleChange} className="w-full bg-[#161616] border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none text-sm text-white">
                      <option value="Male">{t.labels.male}</option>
                      <option value="Female">{t.labels.female}</option> 
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t.labels.assignedTrainer}</label>
                    <select name="trainer_id" value={formData.trainer_id || ""} onChange={handleChange} disabled={formData.role === 'trainer'} className="w-full bg-[#161616] border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none text-sm text-white disabled:opacity-40">
                      <option value="">{t.labels.noTrainer}</option>
                      {trainers.map((tr) => (
                        <option key={tr.id} value={tr.id}>{tr.first_name} {tr.last_name}</option>
                      ))}
                    </select>
                  </div>

                  <Input label={t.labels.username} name="username" value={formData.username} onChange={handleChange} />
                  <Input label={t.labels.phone} name="phone" value={formData.phone} onChange={handleChange} />
                  <Input label={t.labels.dob} name="dob" type="date" value={formData.dob} onChange={handleChange} />
                  <Input label={t.labels.email} name="email" value={formData.email} disabled />
                </div>
                
                <div className="space-y-2 pt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t.labels.address}</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3.5 text-orange-500" />
                    <input name="address" value={formData.address || ""} onChange={handleChange} className="w-full bg-[#161616] border border-zinc-800 p-3 pl-10 rounded-xl focus:border-orange-500 outline-none text-sm text-white transition" />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" disabled={saving} className="px-10 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-3 disabled:opacity-50">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {t.buttons.saveChanges}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "bank" && (
              <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="text-orange-500" size={24} />
                  <h3 className="text-lg font-bold">{t.sections.bank}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label={t.labels.holderName} name="bank_full_name" value={formData.bank_full_name} onChange={handleChange} />
                  <Input label={t.labels.rut} name="bank_rut" value={formData.bank_rut} onChange={handleChange} />
                  <Input label={t.labels.bankName} name="bank_name" value={formData.bank_name} onChange={handleChange} />
                  <Input label={t.labels.accountType} name="bank_account_type" value={formData.bank_account_type} onChange={handleChange} />
                  <div className="md:col-span-2">
                    <Input label={t.labels.accountNumber} name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} />
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" disabled={saving} className="px-10 py-4 bg-orange-500 rounded-2xl font-black uppercase italic flex items-center gap-3">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {t.buttons.saveBank}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold flex items-center gap-2"><Lock size={20} className="text-orange-500"/> {t.sections.security}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label={t.labels.newPassword} type="password" value={passwordData.newPassword} onChange={(e: any) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                  <Input label={t.labels.confirmPassword} type="password" value={passwordData.confirmPassword} onChange={(e: any) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                </div>
                {passwordStatus.message && (
                  <p className={`text-xs font-bold uppercase tracking-widest ${passwordStatus.error ? "text-red-500" : "text-emerald-500"}`}>
                    {passwordStatus.message}
                  </p>
                )}
                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" disabled={passwordStatus.loading} className="px-10 py-4 bg-white text-black hover:bg-slate-200 rounded-2xl font-black uppercase italic transition-all flex items-center gap-3">
                    {passwordStatus.loading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />} {t.buttons.updatePassword}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "professional" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold">{t.sections.professional}</h3>
                <Input label={t.labels.specialty} name="specialty" value={formData.specialty} onChange={handleChange} placeholder={t.labels.specialtyPlaceholder} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t.labels.bio}</label>
                  <textarea name="bio" value={formData.bio || ""} onChange={handleChange} rows={6} className="w-full bg-[#161616] border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none transition text-white" placeholder={t.labels.bioPlaceholder} />
                </div>
                <div className="flex justify-end">
                  <button onClick={handleUpdate} disabled={saving} className="px-10 py-4 bg-orange-500 rounded-2xl font-black uppercase italic flex items-center gap-3">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} {t.buttons.saveProfessional}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold">{t.sections.system}</h3>
                <div className="grid md:grid-cols-2 gap-6 bg-[#0c0c0c] p-6 rounded-2xl border border-zinc-800/50">
                  <StatusItem label={t.labels.role} value={formData.role} color="text-orange-500" />
                  <StatusItem label={t.labels.status} value={formData.status} color={formData.status === 'active' ? 'text-emerald-500' : 'text-red-500'} />
                  <StatusItem label={t.labels.activePlan} value={formData.subscription_plan || t.labels.none} />
                  <StatusItem label={t.labels.expiration} value={formData.subscription_expiration ? new Date(formData.subscription_expiration).toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang) : t.labels.na} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

function Input({ label, name, value, onChange, type = "text", required = false, disabled = false, placeholder = "" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-[#161616] border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none transition text-sm text-white ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

function StatusItem({ label, value, color = "text-white" }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
      <p className={`text-sm font-bold uppercase italic ${color}`}>{value}</p>
    </div>
  );
}