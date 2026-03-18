"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Dumbbell, Users, Salad, ChartNoAxesColumn, Zap, Heart, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

const benefits = [
  {
    icon: <Users size={40} />,
    title: "Seamless Client Management",
    text: "Manage every aspect of your trainees’ journey in one intuitive dashboard. Track sessions, progress, communication, and attendance effortlessly, so nothing slips through the cracks."
  },
  {
    icon: <Dumbbell size={40} />,
    title: "Custom Workouts",
    text: "Create personalized workout programs with ease. Use templates or design from scratch with our drag-and-drop workout builder, including exercise libraries, sets, reps, and rest times."
  },
  {
    icon: <Salad size={40} />,
    title: "Nutrition & Meal Plans",
    text: "Design complete nutrition programs for your clients. Track calories, macros, and meals, provide recipe suggestions, and allow trainees to follow meal plans directly from their app."
  },
  {
    icon: <ChartNoAxesColumn size={40} />,
    title: "Progress Tracking & Analytics",
    text: "Visualize every trainee’s improvements with detailed charts and reports. Track weight, strength, body composition, and performance metrics over time."
  },
  {
    icon: <Zap size={40} />,
    title: "Fast & Secure Payments",
    text: "Set your own rates, accept payments online, and manage subscriptions. Receive payouts quickly and securely, all integrated seamlessly into your workflow."
  },
  {
    icon: <Heart size={40} />,
    title: "Trainee Engagement",
    text: "Keep clients motivated with reminders, achievements, and personalized feedback. Boost adherence and satisfaction by making every interaction meaningful."
  },
  {
    icon: <Trophy size={40} />,
    title: "Gamified Results",
    text: "Turn fitness into a fun experience. Award badges, milestones, and challenges to your clients to keep them engaged, motivated, and coming back for more."
  }
];

export default function Benefits() {
  return (
    <main className="bg-[#0b0b0b] text-white overflow-hidden">

      <Navbar />

<Hero
  title={"Why <span>TrainElitePro</span> Is The Ultimate Fitness Platform"}
  subtitle="Everything you need to grow your fitness business and help your clients reach their goals — in one seamless platform."
  ctaText="Start Your Free Trial"
  ctaLink="/register"
/>

      {/* BENEFITS / FEATURES FULL WIDTH */}
      <section className="py-28 px-6 space-y-16 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Powerful Features That Trainers & Trainees Love
        </h2>

        {benefits.map((b, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#161616] p-10 rounded-2xl border border-gray-800 hover:border-[#ff6b1a] transition flex flex-col md:flex-row items-start gap-8"
          >
            <div className="text-[#ff6b1a]">{b.icon}</div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">{b.title}</h3>
              <p className="text-gray-400 text-lg">{b.text}</p>
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            href="/register"
            className="bg-[#ff6b1a] px-12 py-5 rounded-xl font-bold text-xl md:text-2xl shadow-lg hover:scale-105 transition"
          >
            Start Coaching Today
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 text-center bg-[#111111]">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Take Your Fitness Business to the <span className="text-[#ff6b1a]">Next Level</span>
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Sign up today and start managing clients, workouts, and nutrition seamlessly while growing your online fitness brand.
        </p>
        <Link
          href="/register"
          className="bg-[#ff6b1a] px-12 py-5 text-xl md:text-2xl rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          Create Trainer Account
        </Link>
      </section>

      <Footer/>
    </main>
  );
}