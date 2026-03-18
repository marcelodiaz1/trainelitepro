"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Users } from "lucide-react";

const slides = [
  {
    image: "/hero/hero1.jpg",
    title: "Grow Your Personal Training Business",
    description:
      "Create workouts, meal plans and manage clients in one powerful platform built for modern trainers.",
    primary: {
      text: "Start as Trainer",
      link: "/register",
      icon: <Dumbbell size={20} />,
    },
    secondary: {
      text: "View Trainer Benefits",
      link: "/benefits",
    },
  },
  {
    image: "/hero/hero2.jpg",
    title: "Find the Perfect Trainer",
    description:
      "Browse expert coaches, hire them online and receive personalized workouts and nutrition plans.",
    primary: {
      text: "Find a Trainer",
      link: "/trainers",
      icon: <Users size={20} />,
    },
    secondary: {
      text: "How It Works",
      link: "/benefits",
    },
  },
  {
    image: "/hero/hero3.jpg",
    title: "All-in-One Coaching Platform",
    description:
      "TrainElitePro helps trainers manage their entire coaching business while delivering elite results for clients.",
    primary: {
      text: "Create Account",
      link: "/register",
      icon: <Dumbbell size={20} />,
    },
    secondary: {
      text: "View Pricing",
      link: "/pricing",
    },
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">

      {/* IMAGE */}

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt="fitness"
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* DARK OVERLAY */}

      <div className="absolute inset-0 bg-black/60" />

      {/* GRADIENT LIGHT */}

      <div className="absolute w-[600px] h-[600px] bg-[#ff6b1a] blur-[200px] opacity-30 rounded-full" />

      {/* CONTENT */}

      <div className="relative z-10 max-w-4xl text-center px-6">

        <AnimatePresence mode="wait">

          <motion.div
            key={slide.title}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.7 }}
          >

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              {slide.title}
            </h1>

            <p className="text-xl text-gray-200 mb-10">
              {slide.description}
            </p>

            <div className="flex flex-wrap justify-center gap-6">

              <Link
                href={slide.primary.link}
                className="flex items-center gap-2 bg-[#ff6b1a] px-10 py-4 rounded-xl text-lg font-bold hover:scale-105 transition"
              >
                {slide.primary.icon}
                {slide.primary.text}
              </Link>

              <Link
                href={slide.secondary.link}
                className="border border-white px-10 py-4 rounded-xl hover:bg-white hover:text-black transition"
              >
                {slide.secondary.text}
              </Link>

            </div>

          </motion.div>

        </AnimatePresence>

      </div>

      {/* DOT INDICATORS */}

      <div className="absolute bottom-10 flex gap-3">

        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              index === i ? "bg-[#ff6b1a]" : "bg-gray-500"
            }`}
          />
        ))}

      </div>

    </section>
  );
}