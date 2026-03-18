"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, CreditCard, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PlanFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function PlanForm({ initialData, onSave, onCancel, loading }: PlanFormProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [fetchingRole, setFetchingRole] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    paypal_button_id: "",
    trainee_limit: 1, // Default value
    cta: "",
    features: [""]
  });

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .single();
          
          if (data) setUserRole(data.role);
        }
      } catch (err) {
        console.error("Role check failed", err);
      } finally {
        setFetchingRole(false);
      }
    }
    checkRole();

    if (initialData) {
      setFormData({
        title: initialData.title || "",
        trainee_limit: initialData.trainee_limit ?? 1,
        price: initialData.price || "",
        paypal_button_id: initialData.paypal_button_id || "",
        cta: initialData.cta || "",
        features: initialData.features || [""]
      });
    }
  }, [initialData]);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ""] });

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [""] });
  };

  if (fetchingRole) return (
    <div className="flex justify-center p-12">
      <Loader2 className="animate-spin text-orange-500" />
    </div>
  );

  return (
    <div className="bg-[#111] border border-slate-800 rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl">
      <AnimatePresence>
        {showVideo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-800">
              <button onClick={() => setShowVideo(false)} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full hover:bg-[#ff6b1a] transition-colors"><X size={20} /></button>
              <iframe className="w-full h-full" src="https://www.youtube.com/embed/2LsuYc-9iU8?autoplay=1" title="Tutorial" allowFullScreen />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold italic uppercase flex items-center gap-2">
          <CreditCard className="text-[#ff6b1a]" /> {initialData ? "Edit Plan" : "Create New Plan"}
        </h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition"><X size={24} /></button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Plan Title</label>
            <input className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#ff6b1a] outline-none transition" placeholder="e.g. Starter" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Price Label</label>
            <input className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#ff6b1a] outline-none transition" placeholder="e.g. $19/mo" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">PayPal Button ID</label>
              <button type="button" onClick={() => setShowVideo(true)} className="text-[9px] text-[#ff6b1a] hover:underline flex items-center gap-1 font-bold italic"><HelpCircle size={10} /> Guide</button>
            </div>
            <input className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition" placeholder="ID here..." value={formData.paypal_button_id} onChange={(e) => setFormData({ ...formData, paypal_button_id: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">CTA URL (Optional)</label>
            <input className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition" placeholder="/register" value={formData.cta} onChange={(e) => setFormData({ ...formData, cta: e.target.value })} />
          </div>
        </div>

        {/* ADMIN ONLY: Trainee Limit */}
        {userRole === 'admin' && (
          <div className="space-y-2 p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl animate-in fade-in slide-in-from-top-2">
            <label className="text-[10px] font-black uppercase text-orange-500 ml-1">Trainee Limit (Admin Only)</label>
            <input 
              type="number" 
              className="w-full bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#ff6b1a] outline-none transition" 
              value={formData.trainee_limit} 
              onChange={(e) => setFormData({ ...formData, trainee_limit: parseInt(e.target.value) || 0 })} 
            />
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-500 ml-1 flex justify-between">Features List <button onClick={addFeature} className="text-[#ff6b1a] hover:text-white transition flex items-center gap-1"><Plus size={12} /> Add Line</button></label>
          {formData.features.map((feature, index) => (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={index} className="flex gap-2">
              <input className="flex-1 bg-[#0b0b0b] border border-slate-800 rounded-xl px-4 py-2 text-xs focus:border-[#ff6b1a] outline-none transition" placeholder={`Feature #${index + 1}`} value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} />
              <button onClick={() => removeFeature(index)} className="p-2 text-slate-600 hover:text-red-500 transition"><Trash2 size={16} /></button>
            </motion.div>
          ))}
        </div>

        <div className="pt-6 flex gap-3">
          <button disabled={loading} onClick={() => onSave(formData)} className="flex-1 bg-[#ff6b1a] hover:bg-orange-500 disabled:opacity-50 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Plan</>}
          </button>
          <button onClick={onCancel} className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition">Cancel</button>
        </div>
      </div>
    </div>
  );
}