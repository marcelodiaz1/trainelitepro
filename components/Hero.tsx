"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  className?: string;
}

export default function Hero({ title, subtitle, ctaText, ctaLink, className }: HeroProps) {
  return (
    <section
      className={`py-32 text-center bg-gradient-to-b from-[#111111] to-[#0b0b0b] ${className ?? ""}`}
    >
      <motion.h1
        className="text-5xl md:text-6xl font-bold mb-6"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {title.split("\n").map((line, i) => (
          <span key={i} className="block">
            {line.includes("<span>") 
              ? <span className="text-[#ff6b1a]">{line.replace(/<span>|<\/span>/g, "")}</span>
              : line
            }
          </span>
        ))}
      </motion.h1>

      <motion.p
        className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Link
          href={ctaLink}
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          {ctaText}
        </Link>
      </motion.div>
    </section>
  );
}