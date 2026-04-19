"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import LocalizedLink from "@/components/LocalizedLink";

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  className?: string;
}

export default function Hero({ title, subtitle, ctaText, ctaLink, className }: HeroProps) {
  const containerRef = useRef(null);

  // Hook into the scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Background moves slower (parallax)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  // Content fades out and moves up slightly as you scroll away
  const contentY = useTransform(scrollYProgress, [0, 1], ["0px", "-50px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={containerRef}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className ?? ""}`}
    >
      {/* Parallax Background Image */}
      <motion.div
        style={{
          backgroundImage: "url('/hero/hero3.jpg')",
          y: backgroundY,
        }}
        className="absolute inset-0 z-0 bg-cover bg-center"
      />

      {/* Dark Overlay to make text pop */}
      <div className="absolute inset-0 z-10 bg-black/50 bg-gradient-to-b from-black/40 via-transparent to-[#0b0b0b]" />

      {/* Hero Content */}
      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-20 text-center px-6 max-w-5xl mx-auto mt-20"
      >
        <motion.h1
          className="text-4xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-[0.9] text-white"
          initial={{ opacity: 0, y: 30 }}
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
          className="text-gray-200 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <LocalizedLink
            href={ctaLink}
            className="inline-block bg-[#ff6b1a] text-black px-14 py-5 text-xl md:text-2xl rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,107,26,0.4)]"
          >
            {ctaText}
          </LocalizedLink>
        </motion.div>
      </motion.div>
    </section>
  );
}