"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import PlanForm from "@/components/dashboard/PlanForm"; // Import the component
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams();
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch the data once when the page loads
  useEffect(() => {
    async function fetchPlan() {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        console.error("Error fetching plan:", error);
        router.push("/dashboard/plans");
      } else {
        setPlanData(data);
      }
      setLoading(false);
    }
    if (params.id) fetchPlan();
  }, [params.id, router]);

  // 2. The update logic passed to the component
  const handleUpdate = async (formData: any) => {
    setSaving(true);
    
    const cleanedFeatures = formData.features.filter((f: string) => f.trim() !== "");

    const { error } = await supabase
      .from("plans")
      .update({
        title: formData.title,
        price: formData.price,
        trainee_limit: formData.trainee_limit,
        features: cleanedFeatures,
        paypal_button_id: formData.paypal_button_id || null,
        cta: formData.cta || null,
      })
      .eq("id", params.id);

    if (error) {
      alert("Error updating plan: " + error.message);
    } else {
      router.push("/dashboard/plans");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="bg-[#0b0b0b] min-h-screen flex">
        
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-[#ff6b1a] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen flex">
      
      
      <div className="p-8 flex-1 w-full max-w-4xl mx-auto">
        <div className="mb-12">
          <Link 
            href="/dashboard/plans" 
            className="text-slate-500 hover:text-[#ff6b1a] flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Cancel Editing
          </Link>
          <h1 className="text-4xl font-extrabold italic uppercase flex items-center gap-3 tracking-tighter text-white">
            <Edit3 className="text-[#ff6b1a]" /> Edit Tier: <span className="text-slate-400">{planData?.title}</span>
          </h1>
        </div>

        {/* Using the component and passing the fetched planData */}
        <PlanForm 
          initialData={planData} 
          onSave={handleUpdate} 
          onCancel={() => router.back()} 
          loading={saving} 
        />
      </div>
    </main>
  );
}