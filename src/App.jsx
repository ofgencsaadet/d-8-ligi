import { useState, useEffect } from 'react'
import Header from './components/Header'
import StandingsTable from './components/StandingsTable'
import MatchList from './components/MatchList'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [standings, setStandings] = useState(null)
  const [playedMatches, setPlayedMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Paralel olarak tüm JSON dosyalarını yükle
        const basePath = import.meta.env.PROD ? '/d-8-ligi' : ''
        const timestamp = new Date().getTime()
        const [standingsRes, playedRes, upcomingRes] = await Promise.all([
          fetch(`${basePath}/data/standings.json?v=${timestamp}`),
          fetch(`${basePath}/data/played.json?v=${timestamp}`),
          fetch(`${basePath}/data/upcoming.json?v=${timestamp}`)
        ])

        if (!standingsRes.ok || !playedRes.ok || !upcomingRes.ok) {
          throw new Error('Veri yükleme hatası')
        }

        const [standingsData, playedData, upcomingData] = await Promise.all([
          standingsRes.json(),
          playedRes.json(),
          upcomingRes.json()
        ])

        setStandings(standingsData)
        setPlayedMatches(playedData)
        setUpcomingMatches(upcomingData)
      } catch (err) {
        setError('Veriler yüklenirken hata oluştu: ' + err.message)
        console.error('Veri yükleme hatası:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Hata</div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Puan Tabloları */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📊 Puan Tabloları
          </h2>
          {standings && (
            <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-3">
              {Object.entries(standings).map(([groupName, teams]) => (
                <StandingsTable 
                  key={groupName}
                  groupName={groupName}
                  teams={teams}
                />
              ))}
            </div>
          )}
        </section>

        {/* Oynanmış Maçlar */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            ✅ Oynanmış Maçlar
          </h2>
          <MatchList matches={playedMatches} type="played" />
        </section>

        {/* Oynanacak Maçlar */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            📅 Oynanacak Maçlar
          </h2>
          <MatchList matches={upcomingMatches} type="upcoming" />
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Saadet Partisi Of İlçe Gençlik Kolları D-8 Futbol Turnuvası. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  )
}

export default App 