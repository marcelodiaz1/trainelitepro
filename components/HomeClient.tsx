"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, Users, Salad, ChartNoAxesColumn } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import TestimonialCard from "@/components/TestimonialCard";
import Footer from "@/components/Footer";

// Mapping icons to their Lucide components
const iconMap: Record<string, React.ReactNode> = {
  "Users": <Users size={30} />,
  "Dumbbell": <Dumbbell size={30} />,
  "Salad": <Salad size={30} />,
  "ChartNoAxesColumn": <ChartNoAxesColumn size={30} />,
};

export default function HomeClient({ dict }: { dict: any }) { 
  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">
      <Navbar dict={dict}/>
      <HeroSlider  dict={dict} />

      {/* STATS */}
      <section className="py-24 bg-[#111111]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 text-center gap-10">
          <Stat number="10k+" label={dict.stats.workouts} />
          <Stat number="5k+" label={dict.stats.trainers} />
          <Stat number="40k+" label={dict.stats.trainees} />
          <Stat number="98%" label={dict.stats.satisfaction} />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-28 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
          {dict.features.mainTitle}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {dict.features.items.map((feature: any, i: number) => { 
            const IconComponent = iconMap[feature.icon.replace(/[< />0-9size={}]/g, '')] || <Dumbbell size={30} />;

            return (
              <motion.div
                key={i}
                whileHover={{ y: -10, scale: 1.02 }}
                whileInView={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#161616] p-8 rounded-2xl border border-gray-800 hover:border-[#ff6b1a] transition"
              >
                <div className="text-[#ff6b1a] mb-4">{IconComponent}</div>
                <h3 className="text-xl md:text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.text}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/register"
            className="bg-[#ff6b1a] px-10 py-4 rounded-xl font-bold text-lg md:text-xl shadow-lg hover:scale-105 transition"
          >
            {dict.features.cta}
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-28 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
          {dict.testimonials.title}
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {dict.testimonials.items.map((t: any, i: number) => (
            <TestimonialCard
              key={i}
              name={t.name}
              role={t.role}
              image={`/trainers/images${i === 0 ? '' : i === 1 ? '3' : '1'}.jpg`} // Mapping to your specific image paths
              quote={t.quote}
            />
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center bg-[#111111]">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          {dict.finalCta.titlePre} <span className="text-[#ff6b1a]">{dict.finalCta.titleHighlight}</span>
        </h2>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          {dict.finalCta.description}
        </p>

        <Link
          href="/register"
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          {dict.finalCta.button}
        </Link>
      </section>

      <Footer dict={dict} />
    </main>
  );
}

function Stat({ number, label }: any) {
  return (
    <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 40 }}>
      <h3 className="text-4xl md:text-5xl font-bold text-[#ff6b1a] mb-2">{number}</h3>
      <p className="text-gray-400">{label}</p>
    </motion.div>
  );
}