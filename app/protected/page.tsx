import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Definiamo il tipo per gli avvisi
interface Announcement {
  id: string;
  title: string;
  content: string;
  author_name: string;
  is_pinned: boolean;
  created_at: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Recuperiamo gli avvisi dal DB, mettendo in cima quelli "fissati" (pinned) e poi i più recenti
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  const announcements = (data as Announcement[]) || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Bacheca Avvisi</h1>
        <p className="text-gray-500 mt-1">
          Ciao {user.user_metadata?.full_name || user.email?.split('@')[0]}, ecco le ultime novità.
        </p>
      </header>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-gray-500 italic">Nessun avviso presente al momento.</p>
        ) : (
          announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden ${
                announcement.is_pinned ? 'border-indigo-200' : 'border-gray-200'
              }`}
            >
              {/* Barra colorata laterale per quelli fissati */}
              {announcement.is_pinned && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    announcement.is_pinned ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {announcement.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{announcement.author_name}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString('it-IT', { 
                        day: 'numeric', month: 'long', year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Etichetta se l'avviso è fissato */}
                {announcement.is_pinned && (
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                    Importante
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{announcement.title}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
