"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 
import { createClient } from "@supabase/supabase-js";

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

export default function PricingClient({ dict }: { dict: any }) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaypal, setShowPaypal] = useState(false);
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);

  const t = dict?.pricingPage;
  if (!t) return null;

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
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
            setPlans(plansData.map((plan: any) => ({
              title: plan.title,
              price: plan.price,
              features: plan.features,
              paypalButtonId: plan.paypal_button_id,
              cta: plan.cta,
            })));
          }
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const openPaypal = (buttonId: string) => {
    setActiveButtonId(buttonId);
    setShowPaypal(true);
    setTimeout(() => {
      const container = document.getElementById("paypal-container");
      if (container) container.innerHTML = ""; 
      if ((window as any).paypal?.HostedButtons) {
        (window as any).paypal.HostedButtons({ hostedButtonId: buttonId }).render("#paypal-container");
      }
    }, 500);
  };

  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">
      <Navbar dict={dict}/>
      
      <Script
        src="https://www.paypal.com/sdk/js?client-id=BAAcAlRTScS3Ftf0ZjeBTX4PIuY9psh5AJZ1BNAQpBJlzWI4Mwi5okAyotIbbruWnpqwAK9Ig3tJ_mRZww&components=hosted-buttons&disable-funding=venmo&currency=AUD"
        strategy="lazyOnload"
      />

      <section className="py-32 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b]">
        <h1 className="text-5xl md:text-6xl font-bold mb-6" dangerouslySetInnerHTML={{ __html: t.hero.title }} />
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">{t.hero.subtitle}</p>
      </section>

      <section className="py-28 px-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#ff6b1a]"></div>
            <p className="text-gray-500">{t.loading}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={`bg-[#161616] p-8 rounded-2xl border border-gray-800 flex flex-col justify-between ${plan.title === "Elite" ? "border-[#ff6b1a]" : ""}`}
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
                  <Link href={plan.cta} className="bg-gray-600 text-white font-bold px-8 py-3 rounded-xl text-lg text-center hover:bg-gray-500 transition">
                    {t.buttons.getStarted}
                  </Link>
                ) : plan.paypalButtonId ? (
                  <button onClick={() => openPaypal(plan.paypalButtonId!)} className="bg-[#ff6b1a] text-black font-bold px-8 py-3 rounded-xl text-lg text-center shadow-lg hover:scale-105 transition">
                    {t.buttons.choosePlan}
                  </button>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {showPaypal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#161616] p-10 rounded-2xl max-w-md w-full relative">
            <button onClick={() => setShowPaypal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
            <h3 className="text-2xl font-bold mb-6 text-center">{t.modal.title}</h3>
            <div id="paypal-container" className="min-h-[150px]"></div>
          </div>
        </div>
      )}

      <section className="py-32 text-center bg-[#111111]">
        <h2 className="text-5xl md:text-6xl font-bold mb-6" dangerouslySetInnerHTML={{ __html: t.finalCta.title }} />
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">{t.finalCta.description}</p>
        <Link href="/register" className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition inline-block text-black">
          {t.finalCta.button}
        </Link>
      </section>

      <Footer dict={dict} />
    </main>
  );
}