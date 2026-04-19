"use client";

import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function TermsClient({ dict }: { dict: any }) {
  const t = dict.termsPage;

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen">
      {/* HERO SECTION */}
      <section className="pt-32 pb-16 px-6 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 italic uppercase tracking-tighter">
            {t.title}
          </h1>
          <div className="h-1 w-24 bg-[#ff6b1a] mx-auto mb-6" />
          <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-sm">
            {t.effectiveDate}
          </p>
        </motion.div>
      </section>

      {/* TERMS CONTENT */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {t.sections.map((section: any, index: number) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-8 border-l border-white/10 hover:border-[#ff6b1a] transition-colors"
              >
                <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0b0b0b] border-2 border-[#ff6b1a]" />
                <h2 className="text-2xl font-black uppercase italic mb-4 text-white">
                  {section.heading}
                </h2>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* DISCLOSURE CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-24 p-10 rounded-3xl bg-gradient-to-br from-[#161616] to-[#0f0f0f] border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl font-black italic">!</div>
            <h3 className="text-xl font-bold text-[#ff6b1a] mb-4 uppercase">{t.disclaimer.title}</h3>
            <p className="text-gray-300 italic leading-relaxed">
              {t.disclaimer.content}
            </p>
          </motion.div>
        </div>
      </section>

      <Footer dict={dict} />
    </main>
  );
}