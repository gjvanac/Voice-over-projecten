import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '../components/Sidebar';

interface Opdrachtgever {
  id: string;
  naam: string;
}

interface Opdracht {
  id: string;
  opdrachtgeverId: string;
  beschrijving: string;
  bedrag: number;
  gefactureerd: boolean;
  gearchiveerd: boolean;
  datum: string;
  maand: string;
}

export default function Home() {
  const [opdrachtgevers, setOpdrachtgevers] = useState<Opdrachtgever[]>([]);
  const [opdrachten, setOpdrachten] = useState<Opdracht[]>([]);
  const [nieuweOpdracht, setNieuweOpdracht] = useState({
    opdrachtgeverId: '',
    beschrijving: '',
    bedrag: 0,
    gefactureerd: false,
    gearchiveerd: false,
    maand: getCurrentYearMonth(),
  });
  const [bewerkOpdracht, setBewerkOpdracht] = useState<Opdracht | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const opdrachtgeversRes = await fetch('/api/db?type=opdrachtgevers');
        const opdrachtgeversData = await opdrachtgeversRes.json();
        setOpdrachtgevers(opdrachtgeversData);

        const opdrachtenRes = await fetch('/api/db?type=opdrachten');
        const opdrachtenData = await opdrachtenRes.json();
        setOpdrachten(opdrachtenData.map((o: any) => ({
          ...o,
          gefactureerd: o.gefactureerd === 1,
          gearchiveerd: o.gearchiveerd === 1
        })));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
    loadData();
  }, []);

  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  const voegOpdrachtToe = async () => {
    if (nieuweOpdracht.opdrachtgeverId && nieuweOpdracht.beschrijving && nieuweOpdracht.bedrag) {
      const nieuweOpdrachtMetId = {
        ...nieuweOpdracht,
        id: uuidv4(),
        datum: new Date().toISOString().split('T')[0],
      };

      try {
        const response = await fetch('/api/db?type=opdracht', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(nieuweOpdrachtMetId),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        setOpdrachten([...opdrachten, nieuweOpdrachtMetId]);
        setNieuweOpdracht({
          opdrachtgeverId: '',
          beschrijving: '',
          bedrag: 0,
          gefactureerd: false,
          gearchiveerd: false,
          maand: getCurrentYearMonth(),
        });
      } catch (error) {
        console.error('Error adding opdracht:', error);
      }
    }
  };

  const updateOpdracht = async () => {
    if (bewerkOpdracht) {
      try {
        const response = await fetch('/api/db?type=opdracht', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bewerkOpdracht),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        setOpdrachten(opdrachten.map(opdracht =>
          opdracht.id === bewerkOpdracht.id ? bewerkOpdracht : opdracht
        ));
        setBewerkOpdracht(null);
      } catch (error) {
        console.error('Error updating opdracht:', error);
      }
    }
  };

  const updateOpdrachtState = async (id: string, updates: Partial<Opdracht>) => {
    const updatedOpdracht = opdrachten.find(o => o.id === id);
    if (updatedOpdracht) {
      const newOpdracht = { ...updatedOpdracht, ...updates };
      setBewerkOpdracht(newOpdracht);
      await updateOpdracht();
    }
  };

  const getOpdrachtgeverNaam = (opdrachtgeverId: string) => {
    const opdrachtgever = opdrachtgevers.find(og => og.id === opdrachtgeverId);
    return opdrachtgever ? opdrachtgever.naam : 'Onbekende opdrachtgever';
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 p-10 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Opdrachten</h1>

        {/* Nieuwe opdracht toevoegen */}
        <div className="mb-8 bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Nieuwe Opdracht</h2>
          <div className="flex flex-wrap -mx-2">
            <div className="px-2 mb-4 w-full sm:w-1/2 md:w-1/5">
              <select
                value={nieuweOpdracht.opdrachtgeverId}
                onChange={(e) => setNieuweOpdracht({...nieuweOpdracht, opdrachtgeverId: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">Selecteer opdrachtgever</option>
                {opdrachtgevers.map(opdrachtgever => (
                  <option key={opdrachtgever.id} value={opdrachtgever.id}>{opdrachtgever.naam}</option>
                ))}
              </select>
            </div>
            <div className="px-2 mb-4 w-full sm:w-1/2 md:w-1/5">
              <input
                type="text"
                value={nieuweOpdracht.beschrijving}
                onChange={(e) => setNieuweOpdracht({...nieuweOpdracht, beschrijving: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="Beschrijving"
              />
            </div>
            <div className="px-2 mb-4 w-full sm:w-1/2 md:w-1/5">
              <input
                type="number"
                value={nieuweOpdracht.bedrag}
                onChange={(e) => setNieuweOpdracht({...nieuweOpdracht, bedrag: parseFloat(e.target.value)})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="Bedrag"
              />
            </div>
            <div className="px-2 mb-4 w-full sm:w-1/2 md:w-1/5">
              <input
                type="month"
                value={nieuweOpdracht.maand}
                onChange={(e) => setNieuweOpdracht({...nieuweOpdracht, maand: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div className="px-2 mb-4 w-full sm:w-1/2 md:w-1/5">
              <button onClick={voegOpdrachtToe} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Opdracht Toevoegen
              </button>
            </div>
          </div>
        </div>

        {/* Opdrachten lijst */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Opdrachten</h2>
          <ul>
            {opdrachten.map(opdracht => (
              <li key={opdracht.id} className="mb-4 p-4 bg-gray-700 rounded">
                <div className="flex items-center">
                  <span className="w-1/6 font-medium truncate pr-2">{getOpdrachtgeverNaam(opdracht.opdrachtgeverId)}</span>
                  <span className="w-1/6 truncate pr-2">
                    {bewerkOpdracht?.id === opdracht.id ? (
                      <input
                        type="text"
                        value={bewerkOpdracht.beschrijving}
                        onChange={(e) => setBewerkOpdracht({...bewerkOpdracht, beschrijving: e.target.value})}
                        className="bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      opdracht.beschrijving
                    )}
                  </span>
                  <span className="w-1/6 text-right pr-2">
                    {bewerkOpdracht?.id === opdracht.id ? (
                      <input
                        type="number"
                        value={bewerkOpdracht.bedrag}
                        onChange={(e) => setBewerkOpdracht({...bewerkOpdracht, bedrag: parseFloat(e.target.value)})}
                        className="bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      `€${opdracht.bedrag.toFixed(2)}`
                    )}
                  </span>
                  <span className="w-1/6 pr-2">
                    {bewerkOpdracht?.id === opdracht.id ? (
                      <input
                        type="month"
                        value={bewerkOpdracht.maand}
                        onChange={(e) => setBewerkOpdracht({...bewerkOpdracht, maand: e.target.value})}
                        className="bg-gray-600 text-white border border-gray-500 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      opdracht.maand
                    )}
                  </span>
                  <div className="w-2/6 flex justify-end items-center space-x-2">
                    <label className="flex items-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={opdracht.gefactureerd}
                        onChange={(e) => updateOpdrachtState(opdracht.id, { gefactureerd: e.target.checked })}
                        className="mr-1"
                      />
                      <span className="text-sm">Gefactureerd</span>
                    </label>
                    <label className="flex items-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={opdracht.gearchiveerd}
                        onChange={(e) => updateOpdrachtState(opdracht.id, { gearchiveerd: e.target.checked })}
                        className="mr-1"
                      />
                      <span className="text-sm">Archief</span>
                    </label>
                    {bewerkOpdracht?.id === opdracht.id ? (
                      <>
                        <button
                          onClick={updateOpdracht}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
                        >
                          Opslaan
                        </button>
                        <button
                          onClick={() => setBewerkOpdracht(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-sm"
                        >
                          Annuleren
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setBewerkOpdracht(opdracht)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-sm"
                      >
                        Bewerken
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}