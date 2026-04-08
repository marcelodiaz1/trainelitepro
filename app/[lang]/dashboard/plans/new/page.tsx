"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlanForm from "@/components/dashboard/PlanForm";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Sparkles, Loader2, Lock } from "lucide-react";
import Link from "next/link"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function checkLimitAndAuth() {
      try {
        setCheckingAuth(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/login");
          return;
        }

        // 1. Get User Profile (Role and the plan they are currently SUBSCRIBED to)
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("own_plans, selected_plan, role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);

        // 2. LIMIT CHECK LOGIC
        // We only enforce this for trainers
        if (profile?.role === "trainer") {
          const currentPlanCount = profile?.own_plans?.length || 0;

          if (profile.selected_plan) {
            const { data: planData } = await supabase
              .from("plans")
              .select("plan_limit") // Ensure this matches your column name for max tiers
              .eq("id", profile.selected_plan)
              .single();

            // If they reached the limit, redirect to /pricing immediately
            if (planData && currentPlanCount >= planData.plan_limit) {
              router.push("/pricing?reason=limit_reached");
              return;
            }
          } else {
            // If they have no selected_plan, they shouldn't be creating tiers
            router.push("/pricing");
            return;
          }
        }
      } catch (error) {
        console.error("Guard error:", error);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkLimitAndAuth();
  }, [router]);


  const handleSave = async (formData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // 1. Create the plan in the public table
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
            payment_method: 'bank_transfer', 
          },
        ])
        .select("id")
        .single();

      if (insertError) throw insertError;

      // 2. Update the user's own_plans array to include the new plan ID
      const currentPlans = userProfile?.own_plans || [];
      
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          own_plans: [...currentPlans, newPlan.id] 
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      router.push("/dashboard/plans");
    } catch (error: any) {
      console.error("Save Error:", error.message);
      alert("Error saving plan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // While checking limits, show a clean loader
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 text-[#ff6b1a] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse tracking-tighter">Verifying Subscription...</p>
      </div>
    );
  }

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 max-w-7xl mx-auto w-full"> 
        <div className="mb-12">
          <Link 
            href="/dashboard/plans" 
            className="text-slate-500 hover:text-[#ff6b1a] flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Plans
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold italic uppercase flex items-center gap-3 tracking-tighter">
              <Sparkles className="text-[#ff6b1a]" /> Create New Tier
            </h1>
            <p className="text-slate-500 text-sm font-medium">Add a new subscription level for your clients.</p>
          </div>
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