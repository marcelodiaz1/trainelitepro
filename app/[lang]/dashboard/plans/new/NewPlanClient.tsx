"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PlanForm from "@/components/dashboard/PlanForm";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewPlanClient({ dict, lang }: { dict: any, lang: string }) {
  const t = dict.newplans;
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
          router.push(`/${lang}/login`);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("own_plans, selected_plan, role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profile);

        if (profile?.role === "trainer") {
          const currentPlanCount = profile?.own_plans?.length || 0;

          if (profile.selected_plan) {
            const { data: planData } = await supabase
              .from("plans")
              .select("plan_limit")
              .eq("id", profile.selected_plan)
              .single();

            if (planData && currentPlanCount >= planData.plan_limit) {
              router.push(`/${lang}/pricing?reason=limit_reached`);
              return;
            }
          } else {
            router.push(`/${lang}/pricing`);
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
  }, [router, lang]);


  const handleSave = async (formData: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(t.unauthorized);

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

      const currentPlans = userProfile?.own_plans || [];
      
      const { error: updateError } = await supabase
        .from("users")
        .update({ 
          own_plans: [...currentPlans, newPlan.id] 
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      router.push(`/${lang}/dashboard/plans`);
    } catch (error: any) {
      alert(t.saveError + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 text-[#ff6b1a] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">{t.verifyingSubscription}</p>
      </div>
    );
  }

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      <div className="p-8 flex-1 max-w-7xl mx-auto w-full"> 
        <div className="mb-12 text-left">
          <Link 
            href={`/${lang}/dashboard/plans`} 
            className="text-slate-500 hover:text-[#ff6b1a] flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-6"
          >
            <ArrowLeft size={16} /> {t.backToPlans}
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold italic uppercase flex items-center gap-3 tracking-tighter">
              <Sparkles className="text-[#ff6b1a]" /> {t.createNewTier}
            </h1>
            <p className="text-slate-500 text-sm font-medium">{t.createNewSubtitle}</p>
          </div>
        </div>

       <PlanForm 
            onSave={handleSave} 
            onCancel={() => router.push(`/${lang}/dashboard/plans`)} 
            loading={loading}
            dict={dict}  
            />
      </div>
    </main>
  );
}