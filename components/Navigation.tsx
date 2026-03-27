"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  CalendarIcon, 
  UserCircleIcon 
} from "lucide-react";

// 1. COMPONENTE INTERNO: Qui c'è la logica del menu e usePathname()
function NavigationContent() {
  const pathname = usePathname();

  // Voci di menu originali ripristinate
  const navItems = [
    { name: "Bacheca", href: "/protected", icon: HomeIcon },
    { name: "Prenotazioni", href: "/protected/prenotazioni", icon: CalendarIcon },
    { name: "Profilo", href: "/protected/profilo", icon: UserCircleIcon },
  ];

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen fixed top-0 left-0">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-indigo-700">Il Tuo Circolo</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/protected" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM BAR MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <nav className="flex items-center justify-around p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/protected" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full py-2 px-1 rounded-xl transition-all ${
                  isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className={`p-1.5 rounded-full mb-1 ${isActive ? "bg-indigo-50" : ""}`}>
                  <item.icon className={`w-6 h-6 ${isActive ? "text-indigo-600" : "text-gray-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] sm:text-xs ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

// 2. FIX DI COMPILAZIONE: Il componente esportato usa Suspense per aggirare il blocco di Next.js
export default function Navigation() {
  return (
    <Suspense fallback={
      <>
        {/* Placeholder mostrati durante il caricamento statico */}
        <div className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen fixed top-0 left-0 animate-pulse bg-gray-50/50" />
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-50" />
      </>
    }>
      <NavigationContent />
    </Suspense>
  );
}
