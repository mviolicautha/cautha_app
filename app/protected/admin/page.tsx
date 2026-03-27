import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdminPanel() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  // Controllo se l'utente è davvero un Admin e prendo il suo titolo
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, job_title")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    // Se non è admin, lo rimando alla bacheca normale
    return redirect("/protected");
  }

  // Server Action per salvare l'avviso
  const addAnnouncement = async (formData: FormData) => {
    "use server";
    const supabaseServer = await createClient();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPinned = formData.get("is_pinned") === "on";

    // Concateniamo Nome e Titolo per la firma dell'avviso
    const authorFullName = profile.full_name || "Utente";
    const authorJobTitle = profile.job_title || "Associato";
    const authorString = `${authorFullName} (${authorJobTitle})`;

    const { error } = await supabaseServer.from("announcements").insert({
      title,
      content,
      is_pinned: isPinned,
      author_name: authorString
    });

    if (!error) {
      revalidatePath("/protected"); // Ricarica la bacheca per tutti
      redirect("/protected");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Pannello Direttivo</h1>
        <p className="text-gray-500 mt-1">Pubblica un nuovo avviso in bacheca per tutti gli associati.</p>
      </header>

      <form action={addAnnouncement} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Titolo Avviso</label>
          <input 
            type="text" 
            name="title" 
            required 
            className="w-full px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
            placeholder="Es. Chiusura straordinaria sede"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Contenuto (Testo)</label>
          <textarea 
            name="content" 
            required 
            rows={6}
            className="w-full px-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-colors"
            placeholder="Scrivi qui il messaggio per gli associati..."
          />
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <input 
            type="checkbox" 
            name="is_pinned" 
            id="is_pinned"
            className="w-5 h-5 accent-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500 cursor-pointer appearance-auto color-scheme-light"
            style={{ colorScheme: 'light' }}
          />
          <label htmlFor="is_pinned" className="text-sm font-medium text-gray-800 cursor-pointer select-none">
            Fissa in alto nella bacheca (Avviso Importante)
          </label>
        </div>


        <button 
          type="submit" 
          className="w-full py-3.5 mt-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Pubblica in Bacheca
        </button>
      </form>
    </div>
  );
}
