import Navigation from "@/components/Navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Aggiungo flex e text-black per forzare il tema chiaro se il genitore è scuro
    <div className="min-h-screen bg-gray-50 text-black flex flex-col">
      {/* Il menu di navigazione */}
      <Navigation />
      
      {/* 
        Il contenitore principale.
        Uso flex-1 per fargli prendere tutto lo spazio disponibile.
        Aggiungo pt-8 (padding top) per distanziare il contenuto dall'alto.
      */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pl-64 md:pb-8">
        {children}
      </main>
    </div>
  );
}
