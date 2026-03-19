 "use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client outside the component to prevent re-initialization
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PricingPlan = {
  title: string;
  price: string;
  features: string[];
  paypalButtonId?: string;
  cta?: string;
};

export default function Pricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaypal, setShowPaypal] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);
 
useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);

        // HARDCODED ID: Fetching plans linked to this specific user record
        const targetUserId = "25b0d303-4f0e-44ae-87ca-b6bd93a97664";

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("own_plans")
          .eq("id", targetUserId)
          .single();

        if (userError) throw userError;

        if (userData?.own_plans && userData.own_plans.length > 0) {
          const { data: plansData, error: plansError } = await supabase
            .from("plans")
            .select("*")
            .in("id", userData.own_plans)
            .order("created_at", { ascending: true });

          if (plansError) throw plansError;

          if (plansData) {
            setPlans(formatPlans(plansData));
          }
        } else {
          console.warn("No plans found for the specified User ID.");
        }

      } catch (err) {
        console.error("Error fetching plans for specified ID:", err);
      } finally {
        setLoading(false);
      }
    }

    // Helper inside the effect to keep it self-contained
    const formatPlans = (data: any[]) => data.map((plan: any) => ({
      title: plan.title,
      price: plan.price,
      features: plan.features,
      paypalButtonId: plan.paypal_button_id,
      cta: plan.cta,
    }));

    fetchPlans();
  }, []);
  // Helper moved outside or kept inside
  const formatPlans = (data: any[]) => data.map((plan) => ({
    title: plan.title,
    price: plan.price,
    features: plan.features,
    paypalButtonId: plan.paypal_button_id,
    cta: plan.cta,
  }));
  const openPaypal = (buttonId: string) => {
    setActiveButtonId(buttonId);
    setShowPaypal(true);

    // Small delay to ensure the modal and #paypal-container are rendered
    setTimeout(() => {
      const container = document.getElementById("paypal-container");
      if (container) {
        container.innerHTML = ""; // Clear previous buttons
      }

      if ((window as any).paypal && (window as any).paypal.HostedButtons) {
        (window as any).paypal
          .HostedButtons({
            hostedButtonId: buttonId,
          })
          .render("#paypal-container");
      }
    }, 500);
  };

  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">
      <Navbar />
      
      {/* PayPal SDK - Replace YOUR_CLIENT_ID with your actual ID */}
      <Script
        src="https://www.paypal.com/sdk/js?client-id=BAAcAlRTScS3Ftf0ZjeBTX4PIuY9psh5AJZ1BNAQpBJlzWI4Mwi5okAyotIbbruWnpqwAK9Ig3tJ_mRZww&components=hosted-buttons&disable-funding=venmo&currency=AUD"
        strategy="lazyOnload"
      />

      {/* HERO SECTION */}
      <section className="py-32 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b]">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Choose the <span className="text-[#ff6b1a]">Perfect Plan</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">
          Flexible subscription plans designed for trainers of all sizes. Start free or scale as your client base grows.
        </p>
      </section>

      {/* PRICING GRID */}
      <section className="py-28 px-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#ff6b1a]"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`bg-[#161616] p-8 rounded-2xl border border-gray-800 flex flex-col justify-between ${
                  plan.title === "Elite" ? "border-[#ff6b1a]" : ""
                }`}
              >
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{plan.title}</h3>
                  <p className="text-4xl md:text-5xl font-extrabold text-[#ff6b1a] mb-6">{plan.price}</p>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="text-gray-400 flex items-center gap-2">
                        <span className="text-[#ff6b1a] font-bold">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.cta ? (
                  <Link
                    href={plan.cta}
                    className="bg-gray-600 text-white font-bold px-8 py-3 rounded-xl text-lg text-center hover:bg-gray-500 transition"
                  >
                    Get Started
                  </Link>
                ) : plan.paypalButtonId ? (
                  <button
                    onClick={() => openPaypal(plan.paypalButtonId!)}
                    className="bg-[#ff6b1a] text-black font-bold px-8 py-3 rounded-xl text-lg text-center shadow-lg hover:scale-105 transition"
                  >
                    Choose Plan
                  </button>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* PAYPAL MODAL */}
      {showPaypal && activeButtonId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161616] p-10 rounded-2xl max-w-md w-full relative">
            <button
              onClick={() => setShowPaypal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6 text-center">Complete Your Payment</h3>
            <div id="paypal-container" className="min-h-[150px]"></div>
          </div>
        </div>
      )}

      {/* FINAL CTA */}
      <section className="py-32 text-center bg-[#111111]">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Ready to Grow Your <span className="text-[#ff6b1a]">Fitness Business?</span>
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Start your free plan today or pick the plan that fits your growing client base.
        </p>
        <Link
          href="/register"
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition inline-block"
        >
          Create Trainer Account
        </Link>
      </section>

      <Footer />
    </main>
  );
}