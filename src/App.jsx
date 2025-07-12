import { useState, useEffect } from 'react'
import Header from './components/Header'
import StandingsTable from './components/StandingsTable'
import MatchList from './components/MatchList'
import LoadingSpinner from './components/LoadingSpinner'
import QuoteModal from './components/QuoteModal'
import HeadToHead from './components/HeadToHead'
import TournamentBracket from './components/TournamentBracket'
import DarkModeToggle from './components/DarkModeToggle'
import MusicToggle from './components/MusicToggle'

function App() {
  const [standings, setStandings] = useState(null)
  const [playedMatches, setPlayedMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [playoffData, setPlayoffData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showQuoteModal, setShowQuoteModal] = useState(true)
  const [activeTab, setActiveTab] = useState('default') // Varsayılan görünüm
  const [initialTeams, setInitialTeams] = useState(null) // Otomatik takım seçimi için
  const [showHeadToHeadModal, setShowHeadToHeadModal] = useState(false) // Modal kontrolü

  // Çeyrek finale gidecek takımları hesapla
  const calculateQualifiedTeams = (standings) => {
    if (!standings) return new Set()
    
    const qualifiedTeams = new Set()
    const thirdPlaceTeams = []
    
    // Her gruptan ilk 2 takımı ekle
    Object.entries(standings).forEach(([groupName, teams]) => {
      if (teams.length >= 2) {
        qualifiedTeams.add(teams[0].team) // 1. takım
        qualifiedTeams.add(teams[1].team) // 2. takım
      }
      
      // 3. takımı topla (eğer varsa)
      if (teams.length >= 3) {
        thirdPlaceTeams.push({
          team: teams[2].team,
          goalDifference: teams[2].goalDifference,
          points: teams[2].points,
          goalsFor: teams[2].goalsFor
        })
      }
    })
    
    // 3. takımları averaja göre sırala (önce puan, sonra averaj, sonra atılan gol)
    thirdPlaceTeams.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points
      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
    
    // En iyi 2 tane 3. takımı ekle
    thirdPlaceTeams.slice(0, 2).forEach(team => {
      qualifiedTeams.add(team.team)
    })
    
    return qualifiedTeams
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Paralel olarak tüm JSON dosyalarını yükle
        const basePath = import.meta.env.PROD ? '/d-8-ligi' : ''
        const timestamp = new Date().getTime()
        const [standingsRes, playedRes, upcomingRes, playoffRes] = await Promise.all([
          fetch(`${basePath}/data/standings.json?v=${timestamp}`),
          fetch(`${basePath}/data/played.json?v=${timestamp}`),
          fetch(`${basePath}/data/upcoming.json?v=${timestamp}`),
          fetch(`${basePath}/data/playoff.json?v=${timestamp}`).catch(() => null)
        ])

        if (!standingsRes.ok || !playedRes.ok || !upcomingRes.ok) {
          throw new Error('Veri yükleme hatası')
        }

        const [standingsData, playedData, upcomingData, playoffDataResult] = await Promise.all([
          standingsRes.json(),
          playedRes.json(),
          upcomingRes.json(),
          playoffRes?.ok ? playoffRes.json() : null
        ])

        setStandings(standingsData)
        setPlayedMatches(playedData)
        setUpcomingMatches(upcomingData)
        setPlayoffData(playoffDataResult)
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

  // Çeyrek finale gidecek takımları hesapla
  const qualifiedTeams = calculateQualifiedTeams(standings)

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-600 dark:text-red-400 text-xl mb-2">⚠️ Hata</div>
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
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
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-700 dark:to-blue-700 dark:hover:from-purple-800 dark:hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🥊 Takım Karşılaştırma
          </button>
        </div>

        {/* Varsayılan görünüm */}
        <>
          {/* Tournament Bracket */}
          {playoffData && playoffData.quarterFinals && playoffData.quarterFinals.length > 0 && (
            <TournamentBracket 
              data={playoffData} 
              onTeamComparison={handleTeamComparison}
            />
          )}

          {/* Puan Tabloları */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
              📊 Puan Tabloları
            </h2>
            {standings && (
              <div className="grid gap-8 lg:grid-cols-1 xl:grid-cols-3">
                {Object.entries(standings).map(([groupName, teams]) => (
                  <StandingsTable 
                    key={groupName}
                    groupName={groupName}
                    teams={teams}
                    qualifiedTeams={qualifiedTeams}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Oynanacak Maçlar - Sadece maç varsa göster */}
          {upcomingMatches.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
              📅 Oynanacak Maçlar
            </h2>
            <MatchList 
              matches={upcomingMatches} 
              type="upcoming" 
              onTeamComparison={handleTeamComparison}
            />
          </section>
          )}

          {/* Oynanmış Maçlar */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
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
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">🏆 Takım Karşılaştırması</h2>
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
                <HeadToHead matches={playedMatches} playoffData={playoffData} initialTeams={initialTeams} />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Saadet Partisi Of İlçe Gençlik Kolları D-8 Şampiyonlar Ligi. Tüm hakları saklıdır.</p>
        </div>
      </footer>
      
      {/* Dark Mode Toggle - Ekranın sağ alt köşesinde sabit */}
      <DarkModeToggle />
      
      {/* Music Toggle - Ekranın sol alt köşesinde sabit */}
      <MusicToggle />
    </div>
  )
}

export default App 