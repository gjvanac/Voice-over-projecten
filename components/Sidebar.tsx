import Link from 'next/link';

export default function Sidebar() {
  console.log('Sidebar component is rendering');
  return (
    <div className="w-64 bg-gray-800 h-screen p-4">
      <h2 className="text-white text-xl font-semibold mb-4">Menu</h2>
      <nav>
        <ul>
          <li className="mb-2">
            <Link href="/">
              <span className="text-gray-300 hover:text-white cursor-pointer">Opdrachten</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/opdrachtgevers">
              <span className="text-gray-300 hover:text-white cursor-pointer">Opdrachtgevers</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}