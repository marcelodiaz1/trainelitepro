"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrainerCard from "@/components/TrainerCard";

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
  const [location, setLocation] = useState<string>("All");
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

  useEffect(() => {
    let filteredList = [...trainers];
    if (search.trim()) {
      const s = search.toLowerCase();
      filteredList = filteredList.filter((tr) =>
        `${tr.first_name ?? ""} ${tr.last_name ?? ""}`.toLowerCase().includes(s)
      );
    }
    if (minRating > 0) {
      filteredList = filteredList.filter((tr) => (tr.rating ?? 0) >= minRating);
    }
    if (location !== "All") {
      filteredList = filteredList.filter((tr) => tr.address?.includes(location) ?? false);
    }
    setFiltered(filteredList);
    setPage(1);
  }, [search, minRating, location, trainers]);

  const locations = Array.from(
    new Set(trainers.map((tr) => tr.address?.split(",")[0] || "").filter(Boolean))
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="bg-[#0b0b0b] text-white min-h-screen">
      <Navbar dict={dict}/>
      <section className="py-28 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">{t.title}</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-8 justify-center items-center">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="px-4 py-2 rounded-lg bg-[#161616] text-white border border-gray-700 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-lg bg-[#161616] text-white border border-gray-700 focus:outline-none"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value={0}>{t.filters.allRatings}</option>
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>{r}+ {t.filters.stars}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 rounded-lg bg-[#161616] text-white border border-gray-700 focus:outline-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="All">{t.filters.allLocations}</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
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
                <span className="text-gray-400">
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