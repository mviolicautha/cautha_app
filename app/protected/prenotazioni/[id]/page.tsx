"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, addDays, startOfToday, isSameDay, setHours, setMinutes, isBefore, addMinutes, startOfDay, endOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, ArrowLeftIcon, Trash2Icon } from "lucide-react";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  resource_id: number;
  user_id: string; // <-- Aggiunto user_id per il controllo
}

interface Resource {
  id: number;
  name: string;
  parent_id: number | null;
}

export default function CalendarPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = Number(params.id);
  const supabase = createClient();

  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [room, setRoom] = useState<Resource | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Stati Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  const generateTimeSlots = (date: Date) => {
    const slots = [];
    let currentSlot = setMinutes(setHours(startOfDay(date), 8), 0);
    const endSlot = setMinutes(setHours(startOfDay(date), 23), 0);

    while (isBefore(currentSlot, endSlot) || currentSlot.getTime() === endSlot.getTime()) {
      slots.push(new Date(currentSlot));
      currentSlot = addMinutes(currentSlot, 30);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Prendo l'utente loggato per sapere chi è
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: roomData } = await supabase.from("resources").select("*").eq("id", roomId).single();
      if (roomData) setRoom(roomData);

      const dayStart = startOfDay(selectedDate);
      const dayEnd = endOfDay(selectedDate);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*, resources(parent_id)")
        .gte("start_time", dayStart.toISOString())
        .lte("end_time", dayEnd.toISOString());

      if (bookingsData) {
        const relevantBookings = bookingsData.filter((b) => {
          if (b.resource_id === roomId) return true;
          if (roomData?.parent_id === null && b.resources?.parent_id === roomId) return true;
          if (roomData?.parent_id !== null && b.resource_id === roomData?.parent_id) return true;
          return false;
        });
        setBookings(relevantBookings);
      }
      setLoading(false);
    }
    fetchData();
  }, [roomId, selectedDate, supabase]);

  const getBookingForSlot = (slotTime: Date) => {
    return bookings.find((b) => {
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      const slotMs = slotTime.getTime();
      return slotMs >= bStart && slotMs < bEnd;
    });
  };

  const getAvailableDurations = (startSlot: Date | null) => {
    if (!startSlot) return [];
    const durations = [];
    let currentSlot = new Date(startSlot);
    let totalMinutes = 0;
    
    while (totalMinutes < 600) {
      totalMinutes += 30;
      currentSlot = addMinutes(currentSlot, 30);
      if (getBookingForSlot(new Date(currentSlot.getTime() - 1000))) break;
      if (currentSlot.getHours() === 23 && currentSlot.getMinutes() > 30) {
        durations.push(totalMinutes);
        break;
      }
      durations.push(totalMinutes);
    }
    return durations;
  };

  // Funzione CREA
   const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingTitle || !currentUserId) return;

    // Aggiungo il recupero del profilo prima di salvare la prenotazione
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, job_title")
      .eq("id", currentUserId)
      .single();

    const authorFullName = profile?.full_name || "Associato";
    const authorJobTitle = profile?.job_title || "Membro";
    
    // Unisco il titolo inserito dall'utente con il suo nome e qualifica
    const finalTitle = `${bookingTitle} - ${authorFullName} (${authorJobTitle})`;

    const startTime = new Date(selectedSlot);
    const endTime = addMinutes(startTime, selectedDuration);

    const { error } = await supabase.from("bookings").insert({
      resource_id: roomId,
      user_id: currentUserId,
      title: finalTitle, // <-- Uso il titolo completo
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
    });

    if (error) {
      alert("Errore: " + error.message);
    } else {
      setIsBookingModalOpen(false);
      setBookingTitle("");
      setSelectedDuration(30);
      setSelectedDate(new Date(selectedDate));
    }
  };


  // Funzione ELIMINA
  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingToDelete.id);

    if (error) {
      alert("Impossibile cancellare la prenotazione. " + error.message);
    } else {
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
      setSelectedDate(new Date(selectedDate)); // Ricarica la vista
    }
  };

  if (!room) return <div className="p-8 text-center flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-3xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="font-bold text-lg text-gray-900">{room.name}</h1>
          <p className="text-xs text-gray-500">Blocchi da 30 minuti</p>
        </div>
      </div>

      <div className="bg-white px-4 py-3 border-b overflow-x-auto whitespace-nowrap flex gap-3 hide-scrollbar">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center justify-center min-w-[64px] h-16 rounded-xl border transition-all ${
                isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-md" : "bg-white border-gray-200 text-gray-700"
              }`}
            >
              <span className="text-xs font-medium uppercase">{format(day, "EEE", { locale: it })}</span>
              <span className="text-lg font-bold">{format(day, "dd")}</span>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-6 space-y-2 pb-24">
        {loading ? (
          <p className="text-center text-gray-500 text-sm py-10">Caricamento disponibilità...</p>
        ) : (
          timeSlots.map((slot) => {
            const booking = getBookingForSlot(slot);
            const isOccupied = !!booking;
            const isExternalBlock = booking && booking.resource_id !== roomId;
            // Capiamo se la prenotazione è dell'utente loggato
            const isMyBooking = booking && booking.user_id === currentUserId;

            return (
              <div key={slot.toISOString()} className="flex items-center gap-3">
                <div className="w-14 flex-shrink-0 text-right text-gray-500 font-medium text-xs">
                  {format(slot, "HH:mm")}
                </div>
                
                <div className="flex-1 relative">
                  {isOccupied ? (
                    <div 
                      onClick={() => {
                        if (isMyBooking) {
                          setBookingToDelete(booking);
                          setIsDeleteModalOpen(true);
                        }
                      }}
                      className={`p-3 rounded-lg border-l-4 ${
                        isMyBooking 
                          ? 'bg-blue-50 border-blue-400 cursor-pointer hover:bg-blue-100' // Mostra che è cliccabile
                          : isExternalBlock 
                            ? 'bg-amber-50 border-amber-400 opacity-80' 
                            : 'bg-red-50 border-red-400 opacity-80'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className={`font-bold text-xs truncate ${
                          isMyBooking ? 'text-blue-800' : isExternalBlock ? 'text-amber-800' : 'text-red-800'
                        }`}>
                          {booking.title}
                        </h3>
                        {isMyBooking && (
                          <Trash2Icon className="w-4 h-4 text-blue-400 shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSelectedDuration(30);
                        setIsBookingModalOpen(true);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-dashed border-gray-300 bg-white hover:bg-indigo-50 hover:border-indigo-400 transition-colors group flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-gray-400 group-hover:text-indigo-600">Disponibile</span>
                      <CalendarIcon className="w-3 h-3 text-gray-300 group-hover:text-indigo-500" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal di PRENOTAZIONE */}
      {isBookingModalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-8 transform transition-transform">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Dettagli Evento</h2>
            <form onSubmit={handleBooking} className="space-y-5">
              <div className="flex items-center gap-4 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <div className="flex-1">
                  <label className="text-xs text-indigo-600 font-bold uppercase block mb-1">Inizio</label>
                  <div className="text-lg font-semibold text-indigo-900">{format(selectedSlot, "HH:mm")}</div>
                </div>
                <div className="flex-1 border-l border-indigo-200 pl-4">
                  <label className="text-xs text-indigo-600 font-bold uppercase block mb-1">Fine</label>
                  <select 
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                    className="w-full bg-transparent text-lg font-semibold text-indigo-900 outline-none cursor-pointer"
                  >
                    {getAvailableDurations(selectedSlot).map((duration) => (
                      <option key={duration} value={duration}>
                        {format(addMinutes(selectedSlot, duration), "HH:mm")} ({duration >= 60 ? `${duration/60}h` : `${duration}m`})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titolo o Motivo</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                  placeholder="Es. Riunione direttivo..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Conferma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal di CANCELLAZIONE */}
      {isDeleteModalOpen && bookingToDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 transform transition-transform">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2Icon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2 text-gray-900">Rimuovi Prenotazione</h2>
            <p className="text-sm text-center text-gray-500 mb-6">
              Sei sicuro di voler cancellare l'evento <strong>"{bookingToDelete.title}"</strong>?<br/>Questa azione non può essere annullata.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Indietro
              </button>
              <button
                type="button"
                onClick={handleDeleteBooking}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 shadow-sm"
              >
                Rimuovi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
