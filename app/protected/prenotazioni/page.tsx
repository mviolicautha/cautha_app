import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";

interface Resource {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
}

export default async function PrenotazioniPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Recupero l'elenco delle sale dal database
  const { data } = await supabase
    .from('resources')
    .select('*')
    .order('id');

  const resources = (data as Resource[]) || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Prenotazione Spazi</h1>
        <p className="text-gray-500 mt-1">
          Seleziona la sala che vuoi prenotare per visualizzare il calendario delle disponibilità.
        </p>
      </header>

      {/* Regola della Sede Intera */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-amber-800">
              <strong>Attenzione:</strong> La prenotazione della <em>Sede Intera</em> blocca in automatico l'uso di tutte le altre sale secondarie.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((room) => (
          <div 
            key={room.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md hover:border-indigo-300 transition-all flex flex-col relative"
          >
            {/* Il Link che copre l'intera card per permettere il click */}
            <Link 
              href={`/protected/prenotazioni/${room.id}`}
              className="absolute inset-0 z-10"
            >
              <span className="sr-only">Prenota {room.name}</span>
            </Link>

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900 transition-colors">
                {room.name}
              </h3>
              <div className="p-2 bg-gray-50 rounded-lg transition-colors">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                room.parent_id === null 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
              }`}>
                {room.parent_id === null ? "Struttura Principale" : "Sala Secondaria"}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-auto">
              Clicca per vedere gli orari liberi e bloccare il tuo evento.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
