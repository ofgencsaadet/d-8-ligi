import { useState, useEffect } from 'react'
import Header from './components/Header'
import StandingsTable from './components/StandingsTable'
import MatchList from './components/MatchList'
import LoadingSpinner from './components/LoadingSpinner'
import QuoteModal from './components/QuoteModal'
import HeadToHead from './components/HeadToHead'

function App() {
  const [standings, setStandings] = useState(null)
  const [playedMatches, setPlayedMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showQuoteModal, setShowQuoteModal] = useState(true)
  const [activeTab, setActiveTab] = useState('default') // Varsayılan görünüm
  const [initialTeams, setInitialTeams] = useState(null) // Otomatik takım seçimi için
  const [showHeadToHeadModal, setShowHeadToHeadModal] = useState(false) // Modal kontrolü

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

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setShowHeadToHeadModal(false)
        setInitialTeams(null)
      }
    }
    document.addEventListener('keydown', handleEsc, false)
    return () => {
      document.removeEventListener('keydown', handleEsc, false)
    }
  }, [])

  // Takım karşılaştırma fonksiyonu
  const handleTeamComparison = (team1, team2) => {
    setInitialTeams({ team1, team2 })
    setShowHeadToHeadModal(true)
  }

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
      {/* Söz Modal'ı */}
      <QuoteModal 
        isVisible={showQuoteModal} 
        onClose={() => setShowQuoteModal(false)} 
      />
      
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Navigasyon Buton - sadece takım karşılaştırma için */}
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowHeadToHeadModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🥊 Takım Karşılaştırma
          </button>
        </div>

        {/* Varsayılan görünüm */}
        <>
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

          {/* Oynanacak Maçlar */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              📅 Oynanacak Maçlar
            </h2>
            <MatchList 
              matches={upcomingMatches} 
              type="upcoming" 
              onTeamComparison={handleTeamComparison}
            />
          </section>

          {/* Oynanmış Maçlar */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              ✅ Oynanmış Maçlar
            </h2>
            <MatchList matches={playedMatches} type="played" />
          </section>
        </>
        
        {/* Head-to-Head Modal */}
        {showHeadToHeadModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHeadToHeadModal(false)
                setInitialTeams(null)
              }
            }}
          >
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">🏆 Takım Karşılaştırması</h2>
                <button
                  onClick={() => {
                    setShowHeadToHeadModal(false)
                    setInitialTeams(null)
                  }}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label="Kapat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <HeadToHead matches={playedMatches} initialTeams={initialTeams} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Saadet Partisi Of İlçe Gençlik Kolları D-8 Şampiyonlar Ligi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  )
}

export default App 