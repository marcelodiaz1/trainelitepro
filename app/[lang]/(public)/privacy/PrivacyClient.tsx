"use client";

import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function PrivacyClient({ dict }: { dict: any }) {
  const t = dict.privacyPage;

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen">
      {/* HEADER */}
      <section className="pt-32 pb-16 px-6 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b]">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter"
        >
          {t.title}
        </motion.h1>
        <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">
          {t.lastUpdated}: {new Date().toLocaleDateString()}
        </p>
      </section>

      {/* CONTENT */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="prose prose-invert prose-orange max-w-none space-y-12"
          >
            {t.sections.map((section: any, index: number) => (
              <div key={index} className="group">
                <h2 className="text-3xl font-bold text-[#ff6b1a] mb-4 flex items-center gap-4">
                  <span className="opacity-20 text-5xl">0{index + 1}</span>
                  {section.heading}
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg italic">
                  {section.content}
                </p>
                <div className="h-px w-full bg-white/5 mt-8 group-hover:bg-[#ff6b1a]/20 transition-colors" />
              </div>
            ))}
          </motion.div>

          {/* CONTACT BOX */}
          <div className="mt-20 p-8 rounded-3xl bg-[#111111] border border-white/5 text-center">
            <h3 className="text-2xl font-bold mb-4">{t.contact.title}</h3>
            <p className="text-gray-400 mb-6">{t.contact.description}</p>
            <a 
              href="mailto:privacy@trainelitepro.com" 
              className="text-[#ff6b1a] text-xl font-bold hover:underline"
            >
              privacy@trainelitepro.com
            </a>
          </div>
        </div>
      </section>

      <Footer dict={dict} />
    </main>
  );
}