"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import LocalizedLink from "@/components/LocalizedLink";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Users } from "lucide-react";

// Icons and links stay in the code, text comes from dict
const slideMeta = [
  {
    image: "/hero/hero1.jpg",
    primaryLink: "/register",
    secondaryLink: "/benefits",
    icon: <Dumbbell size={20} />,
  },
  {
    image: "/hero/hero2.jpg",
    primaryLink: "/trainers",
    secondaryLink: "/benefits",
    icon: <Users size={20} />,
  },
  {
    image: "/hero/hero3.jpg",
    primaryLink: "/register",
    secondaryLink: "/pricing",
    icon: <Dumbbell size={20} />,
  },
];

export default function HeroSlider({ dict }: { dict: any }) {
  const [index, setIndex] = useState(0);
  const heroDict = dict.hero; // Array of 3 items from JSON

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slideMeta.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Merge the static metadata (images/links) with the translated text
  const currentMeta = slideMeta[index];
  const currentText = heroDict[index];

  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      {/* IMAGE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMeta.image}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={currentMeta.image}
            alt="fitness"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* OVERLAYS */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute w-[600px] h-[600px] bg-[#ff6b1a] blur-[200px] opacity-30 rounded-full" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-4xl text-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentText.title}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              {currentText.title}
            </h1>

            <p className="text-xl text-gray-200 mb-10">
              {currentText.description}
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <LocalizedLink
                href={currentMeta.primaryLink}
                className="flex items-center gap-2 bg-[#ff6b1a] px-10 py-4 rounded-xl text-lg font-bold hover:scale-105 transition"
              >
                {currentMeta.icon}
                {currentText.primaryText}
              </LocalizedLink>

              <LocalizedLink
                href={currentMeta.secondaryLink}
                className="border border-white px-10 py-4 rounded-xl hover:bg-white hover:text-black transition"
              >
                {currentText.secondaryText}
              </LocalizedLink>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DOT INDICATORS */}
      <div className="absolute bottom-10 flex gap-3">
        {slideMeta.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === i ? "bg-[#ff6b1a]" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
}