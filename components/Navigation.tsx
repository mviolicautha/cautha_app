"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, UserIcon } from "lucide-react"; // Se non hai lucide-react, vedremo come fare

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Bacheca", href: "/protected", icon: HomeIcon },
    { name: "Prenotazioni", href: "/protected/prenotazioni", icon: CalendarIcon },
    { name: "Profilo", href: "/protected/profilo", icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-full w-full space-y-1 ${
                    isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {/* Se non hai installato lucide-react, puoi rimpiazzare <Icon /> con testo o SVG personalizzati */}
                  <div className={`p-1 rounded-full ${isActive ? "bg-indigo-50" : ""}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Sidebar Nav */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">Cautha Cortona</h2>
        </div>
        <ul className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700 font-semibold" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="p-4 border-t border-gray-200">
          <form action="/auth/signout" method="post">
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors">
              Disconnetti
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
