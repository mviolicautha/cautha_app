import Navigation from "@/components/Navigation"; // Usa il percorso corretto (../../ o ../) se necessario

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Contenitore principale: su mobile aggiunge padding in basso (per la nav), su desktop aggiunge margine a sinistra (per la sidebar) */}
      <main className="pb-20 md:pb-8 md:pl-64 pt-8 px-4 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
