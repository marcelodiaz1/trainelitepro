"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import PlanForm from "@/components/dashboard/PlanForm"; // Importing your component
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trainerBankInfo, setTrainerBankInfo] = useState<any>(null);

  // Fetch bank info on load to verify if they can use Bank Transfer
  useEffect(() => {
    async function getBankInfo() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("bank_full_name, bank_name, bank_account_number, bank_rut")
        .eq("id", user.id)
        .single();
      
      setTrainerBankInfo(data);
    }
    getBankInfo();
  }, []);


 const handleSave = async (formData: any) => {
  setLoading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Create the plan (This part you said is working)
    const { data: newPlan, error: insertError } = await supabase
      .from("plans")
      .insert([
        {
          title: formData.title,
          price: formData.price,
          features: formData.features.filter((f: string) => f.trim() !== ""),
          trainee_limit: formData.trainee_limit,
          paypal_button_id: formData.paypal_button_id || null,
          cta: formData.cta || null,
          payment_method: 'bank_transfer', // Default since schema removed trainer_id
        },
      ])
      .select("id")
      .single();

    if (insertError) throw insertError;

    // 2. FETCH CURRENT USER DATA (CRITICAL STEP)
    // We must get the current array to append to it
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("own_plans")
      .eq("id", user.id)
      .single();

    if (fetchError) throw fetchError;

    // 3. UPDATE THE USER RECORD
    const currentPlans = userData?.own_plans || []; // Fallback to empty array
    
    const { error: updateError } = await supabase
      .from("users")
      .update({ 
        own_plans: [...currentPlans, newPlan.id] 
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    router.push("/dashboard/plans");
  } catch (error: any) {
    console.error("Link Error:", error.message);
    alert("Plan created, but failed to link to your profile: " + error.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 w-full max-w-4xl mx-auto">
        <div className="mb-12">
          <Link 
            href="/dashboard/plans" 
            className="text-slate-500 hover:text-[#ff6b1a] flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Plans
          </Link>
          <h1 className="text-4xl font-extrabold italic uppercase flex items-center gap-3 tracking-tighter">
            <Sparkles className="text-[#ff6b1a]" /> Create New Tier
          </h1>
          <p className="text-slate-500 text-sm mt-2">Configure a new subscription level for your trainers.</p>
        </div>

        <PlanForm 
          onSave={handleSave} 
          onCancel={() => router.push("/dashboard/plans")} 
          loading={loading} 
        />
      </div>
    </main>
  );
}

