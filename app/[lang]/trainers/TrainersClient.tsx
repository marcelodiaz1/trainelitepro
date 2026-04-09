"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrainerCard from "@/components/TrainerCard";
// Import the location constants
import { LOCATIONS_DATA, COUNTRIES, CountryName } from "@/lib/locations";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Trainer {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  profile_picture?: string | null;
  bio?: string | null;
  rating?: number;
  address?: string | null; 
}

export default function TrainersPage({ dict }: { dict: any }) {
  const t = dict?.trainersPage;
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [filtered, setFiltered] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  
  // New Location Filter States
  const [selectedCountry, setSelectedCountry] = useState<CountryName | "All">("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  const [page, setPage] = useState(1);
  const pageSize = 6;

  if (!t) return null;

  const getImageUrl = (path: string | null | undefined) => {
    const bucketName = "avatars";
    if (!path || path.trim() === "") return "https://placehold.co/600x400";
    if (path.startsWith("http")) return path;
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
  };

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "trainer")
        .eq("status", "active");

      if (error) {
        console.error("Error fetching trainers:", error.message);
      } else {
        setTrainers(data as Trainer[]);
      }
      setLoading(false);
    };
    fetchTrainers();
  }, []);

  // Filter Logic
  useEffect(() => {
    let filteredList = [...trainers];

    // 1. Search Filter
    if (search.trim()) {
      const s = search.toLowerCase();
      filteredList = filteredList.filter((tr) =>
        `${tr.first_name ?? ""} ${tr.last_name ?? ""}`.toLowerCase().includes(s)
      );
    }

    // 2. Rating Filter
    if (minRating > 0) {
      filteredList = filteredList.filter((tr) => (tr.rating ?? 0) >= minRating);
    }

    // 3. Country Filter
    if (selectedCountry !== "All") {
      filteredList = filteredList.filter((tr) => 
        tr.address?.includes(selectedCountry)
      );
    }

    // 4. Region Filter
    if (selectedRegion !== "All") {
      filteredList = filteredList.filter((tr) => 
        tr.address?.includes(selectedRegion)
      );
    }

    setFiltered(filteredList);
    setPage(1);
  }, [search, minRating, selectedCountry, selectedRegion, trainers]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen">
      <Navbar dict={dict}/>
      <section className="py-28 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">{t.title}</h1>

        {/* Filters Grid */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 justify-center items-center flex-wrap max-w-6xl mx-auto">
          {/* Name Search */}
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#161616] text-white border border-gray-800 focus:border-orange-500 focus:outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Rating Select */}
          <select
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#161616] text-white border border-gray-800 focus:outline-none"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value={0}>{t.filters.allRatings}</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r}+ {t.filters.stars}</option>
            ))}
          </select>

          {/* Country Select */}
          <select
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#161616] text-white border border-gray-800 focus:outline-none"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value as CountryName | "All");
              setSelectedRegion("All"); // Reset region when country changes
            }}
          >
            <option value="All">All Countries</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          {/* Region Select (Dynamic) */}
          <select
            disabled={selectedCountry === "All"}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#161616] text-white border border-gray-800 focus:outline-none disabled:opacity-30 transition"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="All">All Regions</option>
            {selectedCountry !== "All" && LOCATIONS_DATA[selectedCountry].map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">{t.status.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-center">{t.status.noResults}</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {paginated.map((trainer) => ( 
                <TrainerCard
                  key={trainer.id}
                  rating={trainer.rating}
                  name={`${trainer.first_name ?? ""} ${trainer.last_name ?? ""}`.trim()}
                  specialty={trainer.specialty}
                  image={getImageUrl(trainer.profile_picture)}
                  profileLink={`/trainers/${trainer.id}`}
                  dict={dict}  
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-12">
                <button
                  disabled={page === 1} 
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-[#161616] rounded-lg disabled:opacity-40 hover:bg-[#222] transition"
                >
                  {t.pagination.prev}
                </button>
                <span className="text-gray-400 font-medium">
                  {t.pagination.pageOf.replace("{page}", page.toString()).replace("{totalPages}", totalPages.toString())}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-[#161616] rounded-lg disabled:opacity-40 hover:bg-[#222] transition"
                >
                  {t.pagination.next}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <Footer dict={dict} />
    </main>
  );
}