import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '../components/Sidebar';

interface Opdrachtgever {
  id: string;
  naam: string;
}

export default function Opdrachtgevers() {
  const [opdrachtgevers, setOpdrachtgevers] = useState<Opdrachtgever[]>([]);
  const [nieuweOpdrachtgever, setNieuweOpdrachtgever] = useState('');
  const [bewerkOpdrachtgever, setBewerkOpdrachtgever] = useState<Opdrachtgever | null>(null);

  useEffect(() => {
    async function loadOpdrachtgevers() {
      try {
        const response = await fetch('/api/db?type=opdrachtgevers');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setOpdrachtgevers(data);
      } catch (error) {
        console.error('Error loading opdrachtgevers:', error);
      }
    }
    loadOpdrachtgevers();
  }, []);

  const voegOpdrachtgeverToe = async () => {
    if (nieuweOpdrachtgever.trim() !== '') {
      try {
        const nieuweId = uuidv4();
        const response = await fetch('/api/db?type=opdrachtgever', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: nieuweId, naam: nieuweOpdrachtgever }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        setOpdrachtgevers([...opdrachtgevers, { id: nieuweId, naam: nieuweOpdrachtgever }]);
        setNieuweOpdrachtgever('');
      } catch (error) {
        console.error('Error adding opdrachtgever:', error);
      }
    }
  };

  const updateOpdrachtgever = async () => {
    if (bewerkOpdrachtgever) {
      try {
        const response = await fetch('/api/db?type=opdrachtgever', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bewerkOpdrachtgever),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        setOpdrachtgevers(opdrachtgevers.map(o => 
          o.id === bewerkOpdrachtgever.id ? bewerkOpdrachtgever : o
        ));
        setBewerkOpdrachtgever(null);
      } catch (error) {
        console.error('Error updating opdrachtgever:', error);
      }
    }
  };

  const verwijderOpdrachtgever = async (id: string) => {
    try {
      const response = await fetch(`/api/db?type=opdrachtgever&id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setOpdrachtgevers(opdrachtgevers.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting opdrachtgever:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 p-10 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Opdrachtgevers</h1>

        <div className="mb-6">
          <input
            type="text"
            value={nieuweOpdrachtgever}
            onChange={(e) => setNieuweOpdrachtgever(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mr-2"
            placeholder="Naam nieuwe opdrachtgever"
          />
          <button 
            onClick={voegOpdrachtgeverToe}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Toevoegen
          </button>
        </div>

        <ul>
          {opdrachtgevers.map((opdrachtgever) => (
            <li key={opdrachtgever.id} className="bg-gray-800 p-4 mb-2 rounded flex justify-between items-center">
              {bewerkOpdrachtgever?.id === opdrachtgever.id ? (
                <>
                  <input
                    type="text"
                    value={bewerkOpdrachtgever.naam}
                    onChange={(e) => setBewerkOpdrachtgever({...bewerkOpdrachtgever, naam: e.target.value})}
                    className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mr-2"
                  />
                  <div>
                    <button
                      onClick={updateOpdrachtgever}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Opslaan
                    </button>
                    <button
                      onClick={() => setBewerkOpdrachtgever(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded"
                    >
                      Annuleren
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {opdrachtgever.naam}
                  <div>
                    <button
                      onClick={() => setBewerkOpdrachtgever(opdrachtgever)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded mr-2"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => verwijderOpdrachtgever(opdrachtgever.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
                    >
                      Verwijderen
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}