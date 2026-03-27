import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Trash2Icon } from "lucide-react"; // Importiamo l'icona del cestino

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

  // Recupero il profilo dell'utente loggato per avere il nome corretto e controllare se è admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  // Recuperiamo gli avvisi dal DB
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  const announcements = (data as Announcement[]) || [];

  // -------------------------------------------------------------
  // SERVER ACTION: Funzione per eliminare l'annuncio
  // -------------------------------------------------------------
  const deleteAnnouncement = async (formData: FormData) => {
    "use server";
    const supabaseServer = await createClient();
    const announcementId = formData.get("id") as string;

    // Supabase controllerà automaticamente le RLS. 
    // Se non sei admin, la query di delete fallirà silenziosamente in backend.
    await supabaseServer
      .from('announcements')
      .delete()
      .eq('id', announcementId);

    // Ricarichiamo la pagina per far sparire la card all'istante
    revalidatePath("/protected");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Bacheca Avvisi</h1>
        <p className="text-gray-500 mt-1">
          Ciao {profile?.full_name || 'Associato'}, ecco le ultime novità.
        </p>
      </header>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-gray-500 italic">Nessun avviso presente al momento.</p>
        ) : (
          announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`bg-white rounded-xl shadow-sm border p-6 relative overflow-hidden group ${
                announcement.is_pinned ? 'border-indigo-200' : 'border-gray-200'
              }`}
            >
              {/* Barra colorata laterale per quelli fissati */}
              {announcement.is_pinned && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
              )}
              
              {/* Tasto Cancella visibile SOLO AGLI ADMIN, in alto a destra */}
              {isAdmin && (
                <form action={deleteAnnouncement} className="absolute top-4 right-4">
                  <input type="hidden" name="id" value={announcement.id} />
                  <button 
                    type="submit"
                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Elimina Avviso"
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                </form>
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
                  <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md mr-10">
                    Importante
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2 pr-8">{announcement.title}</h2>
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
