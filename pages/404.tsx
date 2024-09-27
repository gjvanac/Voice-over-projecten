import Link from "next/link";

export default function Custom404() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-4">Oeps! Pagina niet gevonden.</p>
        <Link href="/" className="text-blue-500 hover:text-blue-400">
          Ga terug naar de hoofdpagina
        </Link>
      </div>
    </div>
  );
}
