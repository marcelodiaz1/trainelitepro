"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  ArrowLeft, Save, Loader2, User, Camera, 
  CreditCard, Video, Shield, Briefcase, MapPin, Key, Lock 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [trainers, setTrainers] = useState<any[]>([]);

  // Password Change State
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, message: "", error: false });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");

        // 1. Load Profile (Avoiding relational joins to fix the 'plans' embed error)
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*") 
          .eq("id", user.id)
          .single();
        
        if (profileError) throw profileError;
        setFormData(profile);

        // 2. Load Trainers list for the selector
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
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    // CLEAN PAYLOAD: Matches your PostgreSQL schema exactly
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
      console.error("Update error:", error.message);
      alert("Update failed: " + error.message);
    } else {
      alert("Profile updated successfully!");
      router.refresh();
      if (activeTab === "profile") router.push("/dashboard/settings");
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
      alert("Profile picture updated!");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordStatus({ loading: false, message: "Passwords do not match", error: true });
    }
    setPasswordStatus({ loading: true, message: "", error: false });
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    if (error) {
      setPasswordStatus({ loading: false, message: error.message, error: true });
    } else {
      setPasswordStatus({ loading: false, message: "Password updated successfully!", error: false });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" />
    </div>
  );

  const tabs = [
    { id: "profile", label: "General", icon: <User size={18} /> },
    { id: "bank", label: "Bank Details", icon: <CreditCard size={18} /> },
    { id: "professional", label: "Professional", icon: <Briefcase size={18} />, hidden: formData.role !== 'trainer' },
    { id: "security", label: "Security", icon: <Lock size={18} /> }, 
    { id: "account", label: "Account Status", icon: <Shield size={18} /> },
  ];

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Settings
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR */}
          <div className="w-full md:w-64 space-y-2">
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 px-4 text-orange-500">Edit Profile</h2>
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

          {/* FORM CONTAINER */}
          <div className="flex-1 bg-[#111] border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl">
            
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
                    <h3 className="text-lg font-bold">Personal Details</h3>
                    <p className="text-slate-500 text-xs">Manage your basic account identity.</p>
                  </div>
                </div> 

                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                  <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                    <select name="gender" value={formData.gender || "Male"} onChange={handleChange} className="w-full bg-[#161616] border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none text-sm text-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option> 
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assigned Trainer</label>
                    <select name="trainer_id" value={formData.trainer_id || ""} onChange={handleChange} disabled={formData.role === 'trainer'} className="w-full bg-[#161616] border border-zinc-800 p-3 rounded-xl focus:border-orange-500 outline-none text-sm text-white disabled:opacity-40">
                      <option value="">No Trainer Assigned</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                      ))}
                    </select>
                  </div>

                  <Input label="Username" name="username" value={formData.username} onChange={handleChange} />
                  <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                  <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} />
                  <Input label="Email (Read-only)" name="email" value={formData.email} disabled />
                </div>
                
                <div className="space-y-2 pt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Home Address</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3.5 text-orange-500" />
                    <input name="address" value={formData.address || ""} onChange={handleChange} className="w-full bg-[#161616] border border-zinc-800 p-3 pl-10 rounded-xl focus:border-orange-500 outline-none text-sm text-white transition" />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" disabled={saving} className="px-10 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase italic tracking-tighter transition-all flex items-center gap-3 disabled:opacity-50">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* TAB: BANK DETAILS */}
            {activeTab === "bank" && (
              <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="text-orange-500" size={24} />
                  <h3 className="text-lg font-bold">Transfer Information</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Account Holder Name" name="bank_full_name" value={formData.bank_full_name} onChange={handleChange} />
                  <Input label="ID Number (RUT)" name="bank_rut" value={formData.bank_rut} onChange={handleChange} />
                  <Input label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleChange} />
                  <Input label="Account Type" name="bank_account_type" value={formData.bank_account_type} onChange={handleChange} />
                  <div className="md:col-span-2">
                    <Input label="Account Number" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} />
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" disabled={saving} className="px-10 py-4 bg-orange-500 rounded-2xl font-black uppercase italic flex items-center gap-3">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save Bank Details
                  </button>
                </div>
              </form>
            )}

            {/* TAB: SECURITY */}
            {activeTab === "security" && (
              <form onSubmit={handlePasswordUpdate} className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold flex items-center gap-2"><Lock size={20} className="text-orange-500"/> Security Management</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="New Password" type="password" value={passwordData.newPassword} onChange={(e: any) => setPasswordData({...passwordData, newPassword: e.target.value})} required />
                  <Input label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={(e: any) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
                </div>
                {passwordStatus.message && (
                  <p className={`text-xs font-bold uppercase tracking-widest ${passwordStatus.error ? "text-red-500" : "text-emerald-500"}`}>
                    {passwordStatus.message}
                  </p>
                )}
                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" disabled={passwordStatus.loading} className="px-10 py-4 bg-white text-black hover:bg-slate-200 rounded-2xl font-black uppercase italic transition-all flex items-center gap-3">
                    {passwordStatus.loading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />} Update Password
                  </button>
                </div>
              </form>
            )}

            {/* TAB: PROFESSIONAL */}
            {activeTab === "professional" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold">Trainer Profile</h3>
                <Input label="Professional Specialty" name="specialty" value={formData.specialty} onChange={handleChange} placeholder="e.g. Yoga, Crossfit, HIIT" />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Professional Biography</label>
                  <textarea name="bio" value={formData.bio || ""} onChange={handleChange} rows={6} className="w-full bg-[#161616] border border-zinc-800 p-4 rounded-2xl focus:border-orange-500 outline-none transition text-white" placeholder="Write about your coaching experience..." />
                </div>
                <div className="flex justify-end">
                  <button onClick={handleUpdate} disabled={saving} className="px-10 py-4 bg-orange-500 rounded-2xl font-black uppercase italic flex items-center gap-3">
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} Save Professional Info
                  </button>
                </div>
              </div>
            )}

            {/* TAB: ACCOUNT STATUS */}
            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold">System Status</h3>
                <div className="grid md:grid-cols-2 gap-6 bg-[#0c0c0c] p-6 rounded-2xl border border-zinc-800/50">
                  <StatusItem label="Current Role" value={formData.role} color="text-orange-500" />
                  <StatusItem label="Account Status" value={formData.status} color={formData.status === 'active' ? 'text-emerald-500' : 'text-red-500'} />
                  <StatusItem label="Active Plan" value={formData.subscription_plan || "None"} />
                  <StatusItem label="Plan Expiration" value={formData.subscription_expiration ? new Date(formData.subscription_expiration).toLocaleDateString() : 'N/A'} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

// Reusable Components
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