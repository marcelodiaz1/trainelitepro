"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  ClipboardCheck,
  ListChecks,
  Activity,
  UtensilsCrossed,
  Apple,
  CreditCard,
  Settings,
  Menu,
  Salad,
  LogOut
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define roles for clarity
type Role = "admin" | "trainer" | "trainee";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["admin", "trainer", "trainee"] },
  { name: "Trainers", icon: Dumbbell, href: "/dashboard/trainers", roles: ["admin"] },
  { name: "Trainees", icon: Users, href: "/dashboard/trainees", roles: ["admin", "trainer"] },
  { name: "Evaluations", icon: ClipboardCheck, href: "/dashboard/evaluations", roles: ["admin", "trainer", "trainee"] },
  { name: "Routines", icon: ListChecks, href: "/dashboard/routines", roles: ["admin", "trainer", "trainee"] },
  { name: "Exercises", icon: Activity, href: "/dashboard/exercises", roles: ["admin"] },
  { name: "Meal Plans", icon: UtensilsCrossed, href: "/dashboard/meal-plans", roles: ["admin", "trainer", "trainee"] },
  { name: "Meals", icon: Salad, href: "/dashboard/meals", roles: ["admin", "trainer"] },
  { name: "Ingredients", icon: Apple, href: "/dashboard/ingredients", roles: ["admin"] },
  { name: "Plans", icon: ClipboardList, href: "/dashboard/plans", roles: ["admin", "trainer"] },
  { name: "Payments", icon: CreditCard, href: "/dashboard/payments", roles: ["admin", "trainer", "trainee"] },
  { name: "Settings", icon: Settings, href: "/dashboard/settings", roles: ["admin", "trainer", "trainee"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch role from your 'profiles' table where id matches user.id
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
    router.push("/login");
  };

  // Filter the menu based on the user's role
  const filteredMenu = menu.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-[#111] p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        <Menu size={22} />
      </button>

      <aside
        className={`
        bg-[#111111] w-64 min-h-screen p-6 fixed md:relative
        flex flex-col z-40
        transition-transform
        ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <h2 className="text-2xl font-bold mb-10 text-[#ff6b1a] uppercase italic tracking-tighter">
          TrainElitePro
        </h2>

        <nav className="space-y-2 flex-1">
          {loading ? (
            // Skeleton loader or simple text while fetching role
            <div className="animate-pulse space-y-4">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="h-10 bg-[#1a1a1a] rounded-lg w-full" />
               ))}
            </div>
          ) : (
            filteredMenu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)} // Close mobile menu on click
                  className={`flex items-center gap-3 p-3 rounded-lg text-xs font-bold uppercase tracking-widest transition
                  ${
                    active
                      ? "bg-[#ff6b1a] text-black shadow-lg shadow-orange-600/20"
                      : "hover:bg-[#1a1a1a] text-gray-500 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>
    </>
  );
}