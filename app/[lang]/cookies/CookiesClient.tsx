"use client";

import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { Cookie, ShieldCheck, BarChart3, Target } from "lucide-react";

export default function CookiesClient({ dict }: { dict: any }) {
  const t = dict.cookiesPage;

  const icons = [
    <ShieldCheck key="1" className="text-[#ff6b1a]" size={32} />,
    <BarChart3 key="2" className="text-[#ff6b1a]" size={32} />,
    <Target key="3" className="text-[#ff6b1a]" size={32} />
  ];

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="pt-32 pb-16 px-6 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/5 rounded-full border border-[#ff6b1a]/30">
              <Cookie size={48} className="text-[#ff6b1a]" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4">
            {t.title}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg italic">
            {t.intro}
          </p>
        </motion.div>
      </section>

      {/* COOKIE TYPES GRID */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {t.types.map((type: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111111] p-8 rounded-3xl border border-white/5 hover:border-[#ff6b1a]/50 transition-all group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform">
                  {icons[index]}
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase italic">{type.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {type.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* DETAILED CONTENT */}
          <div className="mt-24 max-w-3xl mx-auto space-y-12">
            <div className="p-8 border-l-2 border-[#ff6b1a] bg-white/5 rounded-r-2xl">
              <h2 className="text-2xl font-bold mb-4 italic uppercase">{t.howToManage.title}</h2>
              <p className="text-gray-300 leading-relaxed">
                {t.howToManage.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer dict={dict} />
    </main>
  );
}