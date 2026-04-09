"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import {
  LayoutDashboard, Users, Dumbbell, ClipboardList, ClipboardCheck,
  ListChecks, Activity, UtensilsCrossed, Apple, CreditCard,
  Settings, Menu, Salad, LogOut
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Role = "admin" | "trainer" | "trainee";

export default function Sidebar({ dict }: { dict: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "en";
  const t = dict.sidebar;

  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Define menu inside the component to use translations
  const menu = [
    { name: t.dashboard, icon: LayoutDashboard, href: `/${lang}/dashboard`, roles: ["admin", "trainer", "trainee"] },
    { name: t.trainers, icon: Dumbbell, href: `/${lang}/dashboard/trainers`, roles: ["admin"] },
    { name: t.trainees, icon: Users, href: `/${lang}/dashboard/trainees`, roles: ["admin", "trainer"] },
    { name: t.evaluations, icon: ClipboardCheck, href: `/${lang}/dashboard/evaluations`, roles: ["admin", "trainer", "trainee"] },
    { name: t.routines, icon: ListChecks, href: `/${lang}/dashboard/routines`, roles: ["admin", "trainer", "trainee"] },
    { name: t.exercises, icon: Activity, href: `/${lang}/dashboard/exercises`, roles: ["admin"] },
    { name: t.mealPlans, icon: UtensilsCrossed, href: `/${lang}/dashboard/meal-plans`, roles: ["admin", "trainer", "trainee"] },
    { name: t.meals, icon: Salad, href: `/${lang}/dashboard/meals`, roles: ["admin", "trainer"] },
    { name: t.ingredients, icon: Apple, href: `/${lang}/dashboard/ingredients`, roles: ["admin"] },
    { name: t.plans, icon: ClipboardList, href: `/${lang}/dashboard/plans`, roles: ["admin", "trainer"] },
    { name: t.payments, icon: CreditCard, href: `/${lang}/dashboard/payments`, roles: ["admin", "trainer", "trainee"] },
    { name: t.settings, icon: Settings, href: `/${lang}/dashboard/settings`, roles: ["admin", "trainer", "trainee"] },
  ];

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users") 
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setUserRole(data.role as Role);
        }
      }
      setLoading(false);
    };
    getUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${lang}/login`);
  };

  const filteredMenu = menu.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <>
      <button
        className="fixed top-4 right-4 z-50 md:hidden bg-[#000] p-2 rounded border border-white/10"
        onClick={() => setOpen(!open)}
      >
        <Menu size={22} stroke="white"/>
      </button>

      <aside
        className={`
          bg-[#111111] w-64 min-h-screen p-6 fixed md:relative
          flex flex-col z-40 border-r border-white/5
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Link href={`/${lang}`} className="flex items-center gap-2 text-xl font-extrabold mb-8">
          <Dumbbell size={28} className="text-[#ff6b1a] drop-shadow-[0_0_8px_rgba(255,107,26,0.4)]" />
          <span className="bg-gradient-to-r from-[#ff6b1a] to-orange-400 bg-clip-text text-transparent italic tracking-tighter">
            TrainElitePro
          </span>
        </Link>

        <nav className="space-y-1.5 flex-1">
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-9 bg-white/5 rounded-lg w-full" />
              ))}
            </div>
          ) : (
            filteredMenu.map((item) => {
              const Icon = item.icon;
              // Check if pathname starts with the item href to keep parent active 
              const isActive = item.href.endsWith('/dashboard') 
                          ? pathname === item.href 
                          : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all
                  ${
                    isActive
                      ? "bg-[#ff6b1a] text-black shadow-lg shadow-orange-600/10"
                      : "hover:bg-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  <Icon size={16} strokeWidth={isActive ? 3 : 2} />
                  {item.name}
                </Link>
              );
            })
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          {t.logout}
        </button>
      </aside>
    </>
  );
}