"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, Users, Salad, ChartNoAxesColumn, Zap, Heart, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

// Metadata keeps the icons, order must match the JSON "items" array
const benefitIcons = [
  <Users size={40} />,
  <Dumbbell size={40} />,
  <Salad size={40} />,
  <ChartNoAxesColumn size={40} />,
  <Zap size={40} />,
  <Heart size={40} />,
  <Trophy size={40} />,
];

export default function Benefits({ dict }: { dict: any }) {
  const t = dict.benefitsPage;

  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">
      <Navbar dict={dict} />

      <Hero
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        ctaText={t.hero.cta}
        ctaLink="/register"
      />

      {/* BENEFITS / FEATURES */}
      <section className="py-28 px-6 space-y-16 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          {t.mainTitle}
        </h2>

        {t.items.map((item: any, i: number) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#161616] p-10 rounded-2xl border border-gray-800 hover:border-[#ff6b1a] transition flex flex-col md:flex-row items-start gap-8"
          >
            <div className="text-[#ff6b1a]">{benefitIcons[i]}</div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-400 text-lg">{item.text}</p>
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/register"
            className="bg-[#ff6b1a] px-12 py-5 rounded-xl font-bold text-xl md:text-2xl shadow-lg hover:scale-105 transition"
          >
            {t.ctaButton}
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center bg-[#111111]">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          {t.finalCta.title} <span className="text-[#ff6b1a]">{t.finalCta.highlight}</span>
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          {t.finalCta.description}
        </p>
        <Link
          href="/register"
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          {t.finalCta.button}
        </Link>
      </section>

      <Footer dict={dict} />
    </main>
  );
}