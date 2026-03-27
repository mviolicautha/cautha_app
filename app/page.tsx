import Link from 'next/link';

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50 text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Cautha Cortona
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl">
        Portale riservato agli associati. Accedi con la tua email istituzionale per consultare la disponibilità della sede e prenotare le sale per i tuoi eventi o le tue attività.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/auth/login"
          className="rounded-md bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 transition-colors"
        >
          Accedi al Portale
        </Link>
      </div>
    </div>
  );
}
