import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCircleIcon, BriefcaseIcon, ShieldIcon, MailIcon, SettingsIcon } from "lucide-react";

// 1. Spostiamo la logica dentro un componente asincrono interno
async function ProfileContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  // Recuperiamo i dati dell'utente (incluso il ruolo)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Il Tuo Profilo</h1>
        <p className="text-gray-500 mt-1">Gestisci i tuoi dati e le tue credenziali nell'associazione.</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner colorato in alto */}
        <div className="h-24 bg-indigo-600"></div>
        
        <div className="px-6 pb-6 relative">
          {/* Avatar centrato */}
          <div className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center shadow-sm">
            <span className="text-3xl font-bold text-indigo-600">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="pt-14 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name || 'Nome non inserito'}</h2>
              <p className="text-indigo-600 font-medium flex items-center gap-1.5 mt-1">
                <BriefcaseIcon className="w-4 h-4" />
                {profile?.job_title || 'Associato'}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <MailIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Email Istituzionale</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <ShieldIcon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Livello Permessi</p>
                  <p className="font-medium capitalize">{profile?.role || 'User'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEZIONE VISIBILE SOLO AGLI ADMIN */}
      {profile?.role === 'admin' && (
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <ShieldIcon className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold">Strumenti Direttivo</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            Poiché sei un amministratore, hai accesso agli strumenti di gestione della bacheca e della piattaforma.
          </p>
          <Link 
            href="/protected/admin"
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
            Apri Pannello Admin
          </Link>
        </div>
      )}
    </div>
  );
}

// 2. Il wrapper esportato di default che implementa Suspense
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
