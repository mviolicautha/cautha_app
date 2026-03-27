import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Bacheca Avvisi</h1>
        <p className="text-gray-500 mt-1">Ciao {user.user_metadata?.full_name || 'Associato'}, ecco le ultime novità.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            D
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Direttivo</h3>
            <p className="text-xs text-gray-500">27 Marzo 2026</p>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Benvenuti nel nuovo Portale</h2>
        <p className="text-gray-600 leading-relaxed">
          Siamo felici di inaugurare la nuova web app dell'associazione Cautha Cortona. 
          Da oggi potrete consultare gli avvisi qui in bacheca e utilizzare la sezione "Prenotazioni" nel menu per riservare le sale della sede in totale autonomia.
        </p>
      </div>
    </div>
  );
}
