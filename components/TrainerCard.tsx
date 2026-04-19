"use client";

import { motion } from "framer-motion";
import LocalizedLink from "@/components/LocalizedLink";
import { Star } from "lucide-react";

interface TrainerCardProps {
  name: string;
  specialty: string;
  image: string;
  profileLink: string;
  rating?: number;
  dict: any; // Added dict prop
}

export default function TrainerCard({ 
  name, 
  specialty, 
  image, 
  profileLink, 
  rating = 0,
  dict 
}: TrainerCardProps) {
  const t = dict?.trainerCard;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-[#161616] rounded-2xl overflow-hidden border border-gray-800 shadow-lg hover:shadow-2xl transition flex flex-col"
    >
      {/* Profile Image */}
      <div className="h-52 w-full relative">
        <img src={image} className="w-full h-full object-cover" alt={name} />
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl md:text-2xl font-semibold">{name}</h3>
        <p className="text-gray-400 mb-3">
          {specialty || t?.defaultSpecialty}
        </p>

        {/* Star Rating */}
        <div className="flex items-center gap-1 text-yellow-400 mb-4">          
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
                }
              />
            ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View Profile Button */}
        <LocalizedLink
          href={profileLink}
          className="mt-4 bg-[#ff6b1a] text-black font-bold py-2 px-4 rounded-xl text-center hover:scale-105 transition"
        >
          {t?.viewProfile || "View Profile"}
        </LocalizedLink>
      </div>
    </motion.div>
  );
}