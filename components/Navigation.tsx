"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  CalendarIcon, 
  FolderIcon, 
  UsersIcon, 
  SettingsIcon,
  BellIcon
} from "lucide-react";

// 1. Spostiamo tutta la logica di navigazione nel componente "Content"
function NavigationContent() {
  const pathname = usePathname();

  // Mappa delle voci di menu. Modifica o aggiungi percorsi qui in base alle tue necessità
  const navItems = [
    { name: "Bacheca", href: "/protected", icon: HomeIcon },
    { name: "Prenotazioni", href: "/protected/prenotazioni", icon: CalendarIcon },
    { name: "Documenti", href: "/protected/documenti", icon: FolderIcon },
    { name: "Iscritti", href: "/protected/iscritti", icon: UsersIcon },
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

        <div className="p-4 border-t space-y-1">
          <Link
            href="/protected/notifiche"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <BellIcon className="w-5 h-5 text-gray-400" />
            <span>Notifiche</span>
          </Link>
          <Link
            href="/protected/impostazioni"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            <SettingsIcon className="w-5 h-5 text-gray-400" />
            <span>Impostazioni</span>
          </Link>
        </div>
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

// 2. Il componente esportato funge da wrapper per risolvere gli errori di Next.js 15+
export default function Navigation() {
  return (
    // Il fallback evita flash sgradevoli durante il caricamento fornendo gli ingombri vuoti
    <Suspense fallback={
      <>
        <div className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen fixed top-0 left-0 animate-pulse bg-gray-50/50" />
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t z-50" />
      </>
    }>
      <NavigationContent />
    </Suspense>
  );
}
