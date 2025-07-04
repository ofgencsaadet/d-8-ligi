import { useState, useEffect } from 'react'
import ShareModal from './ShareModal'
import { isWithinWeek, getWeatherForecast, getWeatherForDateTime, getMockWeatherData } from '../utils/weather'

function TournamentBracket({ data }) {
  const [shareModal, setShareModal] = useState({ isVisible: false, match: null })
  const [forecastData, setForecastData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)

  // Hava durumu verilerini yükle
  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setWeatherLoading(true)
        
        // API'den hava durumu verisini çek
        const weather = await getWeatherForecast()
        
        if (weather) {
          setForecastData(weather)
        }
      } catch (error) {
        console.error('Hava durumu verisi yüklenirken hata:', error)
      } finally {
        setWeatherLoading(false)
      }
    }

    loadWeatherData()
  }, [])

  // Maç için hava durumu verisini getir
  const getMatchWeather = (match) => {
    if (!match?.date || !isWithinWeek(match.date)) return null
    
    // API'den gerçek hava durumu ver
    const realWeather = getWeatherForDateTime(forecastData, match.date, match.time)
    
    if (realWeather) return realWeather
    
    // API verisi yoksa deterministik mock data kullan
    return getMockWeatherData(match.date, match.time)
  }

  // Konfeti bileşeni
  const Confetti = () => {
    const confettiPieces = []
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe']
    
    // 50 konfeti parçası oluştur
    for (let i = 0; i < 50; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      const randomDelay = Math.random() * 3
      const randomDuration = 3 + Math.random() * 2
      const randomLeft = Math.random() * 100
      
      confettiPieces.push(
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${randomLeft}%`,
            animationDelay: `${randomDelay}s`,
            animationDuration: `${randomDuration}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-sm"
            style={{
              backgroundColor: randomColor,
            }}
          />
        </div>
      )
    }
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiPieces}
      </div>
    )
  }

  if (!data || !data.quarterFinals) {
    return null
  }

  // Paylaşım modal'ını aç
  const openShareModal = (match) => {
    if (match.played) {
      setShareModal({ isVisible: true, match })
    }
  }

  // Paylaşım modal'ını kapat
  const closeShareModal = () => {
    setShareModal({ isVisible: false, match: null })
  }

  // Maç kutusu bileşeni
  const MatchBox = ({ match, size = 'normal', showScore = true, className = '' }) => {
    if (!match) return (
      <div className={`w-full h-16 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm ${className}`}>
        Beklemede
      </div>
    )

    const isPlayed = match.played
    const isWinner = (team) => match.winner === team
    
    let bgColor = 'bg-gray-100'
    if (isPlayed) {
      bgColor = 'bg-white'
    }

    const sizeClasses = {
      small: 'h-12 text-xs',
      normal: 'h-14 text-sm',
      large: 'h-16 text-base'
    }

    return (
      <div className={`w-full ${className}`}>
        <div 
          className={`w-full ${sizeClasses[size]} ${bgColor} rounded border-2 border-gray-200 shadow-sm transition-all hover:shadow-md cursor-pointer ${isPlayed ? 'hover:border-blue-300' : ''}`}
          onClick={() => openShareModal(match)}
        >
          <div className="h-full flex flex-col">
            {/* Takım 1 */}
            <div className={`flex-1 flex items-center px-3 border-b border-gray-200 ${isWinner(match.team1) ? 'bg-green-100 font-bold text-green-800' : ''}`}>
              <span className="flex-1 truncate">{match.team1}</span>
              {showScore && isPlayed && (
                <span className="ml-2 font-bold text-blue-600">{match.score1}</span>
              )}
            </div>
            
            {/* Takım 2 */}
            <div className={`flex-1 flex items-center px-3 ${isWinner(match.team2) ? 'bg-green-100 font-bold text-green-800' : ''}`}>
              <span className="flex-1 truncate">{match.team2}</span>
              {showScore && isPlayed && (
                <span className="ml-2 font-bold text-blue-600">{match.score2}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Tarih - sadece normal ve large size için */}
        {(size === 'normal' || size === 'large') && match.date && (
          <div className="text-xs text-gray-500 px-2 py-1 mt-1 bg-gray-50 rounded text-center">
            <div className="flex items-center justify-center gap-2">
              <span>{match.date} {match.time && `- ${match.time}`}</span>
              
              {/* Hava durumu */}
              {(() => {
                const weather = getMatchWeather(match)
                return weather ? (
                  <div className="flex items-center gap-1">
                    <span>{weather.icon}</span>
                    <span className="font-medium text-blue-600">{weather.temperature}°C</span>
                  </div>
                ) : null
              })()}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Maç izle butonu bileşeni - ayrı olarak
  const WatchButton = ({ match }) => {
    const isPlayed = match?.played
    const hasLink = match?.link && match.link.trim() !== ''
    
    return (
      <div className="h-6 mt-1">
        {isPlayed && hasLink && (
          <button 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              window.open(match.link, '_blank');
            }}
          >
            📺 Maçı İzle
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8 relative">
      {/* Başlık */}
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          🏆 Kupa Yolu
        </h2>
        {data.champion && (
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-lg">
            <span className="text-2xl mr-2 animate-bounce-gentle">🏆</span>
            <span className="text-lg md:text-xl font-bold text-yellow-800">Şampiyon: {data.champion}</span>
          </div>
        )}
      </div>

      {/* Mobil görünüm - Kaydırılabilir masaüstü bracket */}
      <div className="block lg:hidden">
        {/* Kaydırma ipucu */}
        <div className="text-center mb-4 text-sm text-gray-500">
          ← Sağa sola kaydırarak tüm kupa yolunu görün →
        </div>
        
        {/* Kaydırılabilir bracket container */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1200px] mx-auto">
            {/* Ana Bracket Grid - Masaüstü ile tamamen aynı */}
            <div className="grid grid-cols-9 gap-4 items-center min-h-[300px]">
              {/* Sol Çeyrek Finaller */}
              <div className="col-span-1 space-y-16">
                <div>
                  <MatchBox match={data.quarterFinals[0]} size="normal" />
                  <WatchButton match={data.quarterFinals[0]} />
                </div>
                <div>
                  <MatchBox match={data.quarterFinals[1]} size="normal" />
                  <WatchButton match={data.quarterFinals[1]} />
                </div>
              </div>
              
              {/* Sol Bağlantı - Düzeltilmiş çizgi */}
              <div className="col-span-1 flex flex-col items-center justify-center h-full">
                <div className="relative w-full h-32">
                  {/* Üst horizontal çizgi (sol çeyrek final 1'den) - kutu ortasından */}
                  <div className="absolute -top-16 left-0 w-3/4 h-1 bg-gray-600"></div>
                  {/* Üst vertical çizgi */}
                  <div className="absolute -top-16 left-3/4 w-1 h-24 bg-gray-600"></div>
                  {/* Orta horizontal çizgi (yarı finale giden) */}
                  <div className="absolute top-7 left-3/4 w-1/4 h-1 bg-gray-600"></div>
                  {/* Alt vertical çizgi */}
                  <div className="absolute bottom-0 left-3/4 w-1 h-24 bg-gray-600"></div>
                  {/* Alt horizontal çizgi (sol çeyrek final 2'den) - kutu ortasından */}
                  <div className="absolute -bottom-0 left-0 w-3/4 h-1 bg-gray-600"></div>
                </div>
              </div>

              {/* Sol Yarı Final */}
              <div className="col-span-1">
                <MatchBox match={data.semiFinals[0]} size="normal" />
                <WatchButton match={data.semiFinals[0]} />
              </div>

              {/* Sol Final Bağlantısı */}
              <div className="col-span-1 flex justify-center items-end pb-7">
                <div className="w-full h-1 bg-gray-600"></div>
              </div>

              {/* Final + Kupa - Düzeltilmiş spacing */}
              <div className="col-span-1 flex flex-col items-center space-y-3">
                <div className="mt-24">
                  <MatchBox match={data.final} size="normal" />
                  <WatchButton match={data.final} />
                </div>
                <div className="text-4xl animate-bounce-gentle">🏆</div>
                {data.champion && (
                  <div className="text-center">
                    <div className="text-xs text-gray-600">Şampiyon</div>
                    <div className="text-sm font-bold text-yellow-600">{data.champion}</div>
                  </div>
                )}
              </div>

              {/* Sağ Final Bağlantısı */}
              <div className="col-span-1 flex justify-center items-end pb-7">
                <div className="w-full h-1 bg-gray-600"></div>
              </div>

              {/* Sağ Yarı Final */}
              <div className="col-span-1">
                <MatchBox match={data.semiFinals[1]} size="normal" />
                <WatchButton match={data.semiFinals[1]} />
              </div>

              {/* Sağ Bağlantı - Düzeltilmiş çizgi */}
              <div className="col-span-1 flex flex-col items-center justify-center h-full">
                <div className="relative w-full h-32">
                  {/* Üst horizontal çizgi (sağ çeyrek final 1'den) - kutu ortasından */}
                  <div className="absolute -top-16 right-0 w-3/4 h-1 bg-gray-600"></div>
                  {/* Üst vertical çizgi */}
                  <div className="absolute -top-16 right-3/4 w-1 h-24 bg-gray-600"></div>
                  {/* Orta horizontal çizgi (yarı finale giden) */}
                  <div className="absolute top-7 right-3/4 w-1/4 h-1 bg-gray-600"></div>
                  {/* Alt vertical çizgi */}
                  <div className="absolute top-6 right-3/4 w-1 h-28 bg-gray-600"></div>
                  {/* Alt horizontal çizgi (sağ çeyrek final 2'den) - kutu ortasından */}
                  <div className="absolute -bottom-2 right-0 w-3/4 h-1 bg-gray-600"></div>
                </div>
              </div>

              {/* Sağ Çeyrek Finaller */}
              <div className="col-span-1 space-y-16">
                <div>
                  <MatchBox match={data.quarterFinals[2]} size="normal" />
                  <WatchButton match={data.quarterFinals[2]} />
                </div>
                <div>
                  <MatchBox match={data.quarterFinals[3]} size="normal" />
                  <WatchButton match={data.quarterFinals[3]} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kaydırma ipucu - 3.lük için */}
        {data.thirdPlace && (
          <div className="text-center mt-8 mb-4 text-sm text-gray-500">
            ← Sağa sola kaydırarak tüm kupa yolunu görün →
          </div>
        )}

        {/* 3. lük maçı - Alt kısım */}
        {data.thirdPlace && (
          <div className="mt-8 pt-8 border-t-2 border-gray-300">
            <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">🥉 3. lük Maçı</h3>
            <div className="flex justify-center">
              <div className="w-64">
                <MatchBox match={data.thirdPlace} size="normal" />
                <WatchButton match={data.thirdPlace} />
                
                {/* Kazanan bilgisi için sabit alan */}
                <div className="h-8 mt-3 flex items-center justify-center">
                  {data.thirdPlace.winner && (
                    <span className="text-sm font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      🥉 3. lük: {data.thirdPlace.winner}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop görünüm - Düzeltilmiş bracket */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto">
          {/* Ana Bracket Grid */}
          <div className="grid grid-cols-9 gap-4 items-center min-h-[300px]">
            {/* Sol Çeyrek Finaller */}
            <div className="col-span-1 space-y-16">
              <div>
                <MatchBox match={data.quarterFinals[0]} size="normal" />
                <WatchButton match={data.quarterFinals[0]} />
              </div>
              <div>
                <MatchBox match={data.quarterFinals[1]} size="normal" />
                <WatchButton match={data.quarterFinals[1]} />
              </div>
            </div>
            
            {/* Sol Bağlantı - Düzeltilmiş çizgi */}
            <div className="col-span-1 flex flex-col items-center justify-center h-full">
              <div className="relative w-full h-32">
                {/* Üst horizontal çizgi (sol çeyrek final 1'den) - kutu ortasından */}
                <div className="absolute -top-16 left-0 w-3/4 h-1 bg-gray-600"></div>
                {/* Üst vertical çizgi */}
                <div className="absolute -top-16 left-3/4 w-1 h-24 bg-gray-600"></div>
                {/* Orta horizontal çizgi (yarı finale giden) */}
                <div className="absolute top-7 left-3/4 w-1/4 h-1 bg-gray-600"></div>
                {/* Alt vertical çizgi */}
                <div className="absolute bottom-0 left-3/4 w-1 h-24 bg-gray-600"></div>
                {/* Alt horizontal çizgi (sol çeyrek final 2'den) - kutu ortasından */}
                <div className="absolute -bottom-0 left-0 w-3/4 h-1 bg-gray-600"></div>
              </div>
            </div>

            {/* Sol Yarı Final */}
            <div className="col-span-1">
              <MatchBox match={data.semiFinals[0]} size="normal" />
              <WatchButton match={data.semiFinals[0]} />
            </div>

            {/* Sol Final Bağlantısı */}
            <div className="col-span-1 flex justify-center items-end pb-7">
              <div className="w-full h-1 bg-gray-600"></div>
            </div>

            {/* Final + Kupa - Düzeltilmiş spacing */}
            <div className="col-span-1 flex flex-col items-center space-y-3">
              <div className="mt-24">
                <MatchBox match={data.final} size="normal" />
                <WatchButton match={data.final} />
              </div>
              <div className="text-4xl animate-bounce-gentle">🏆</div>
              {data.champion && (
                <div className="text-center">
                  <div className="text-xs text-gray-600">Şampiyon</div>
                  <div className="text-sm font-bold text-yellow-600">{data.champion}</div>
                </div>
              )}
            </div>

            {/* Sağ Final Bağlantısı */}
            <div className="col-span-1 flex justify-center items-end pb-7">
              <div className="w-full h-1 bg-gray-600"></div>
            </div>

            {/* Sağ Yarı Final */}
            <div className="col-span-1">
              <MatchBox match={data.semiFinals[1]} size="normal" />
              <WatchButton match={data.semiFinals[1]} />
            </div>

            {/* Sağ Bağlantı - Düzeltilmiş çizgi */}
            <div className="col-span-1 flex flex-col items-center justify-center h-full">
              <div className="relative w-full h-32">
                {/* Üst horizontal çizgi (sağ çeyrek final 1'den) - kutu ortasından */}
                <div className="absolute -top-16 right-0 w-3/4 h-1 bg-gray-600"></div>
                {/* Üst vertical çizgi */}
                <div className="absolute -top-16 right-3/4 w-1 h-24 bg-gray-600"></div>
                {/* Orta horizontal çizgi (yarı finale giden) */}
                <div className="absolute top-7 right-3/4 w-1/4 h-1 bg-gray-600"></div>
                {/* Alt vertical çizgi */}
                <div className="absolute top-6 right-3/4 w-1 h-28 bg-gray-600"></div>
                {/* Alt horizontal çizgi (sağ çeyrek final 2'den) - kutu ortasından */}
                <div className="absolute -bottom-2 right-0 w-3/4 h-1 bg-gray-600"></div>
              </div>
            </div>

            {/* Sağ Çeyrek Finaller */}
            <div className="col-span-1 space-y-16">
              <div>
                <MatchBox match={data.quarterFinals[2]} size="normal" />
                <WatchButton match={data.quarterFinals[2]} />
              </div>
              <div>
                <MatchBox match={data.quarterFinals[3]} size="normal" />
                <WatchButton match={data.quarterFinals[3]} />
              </div>
            </div>
          </div>
        </div>

        {/* 3. lük maçı - Alt kısım */}
        {data.thirdPlace && (
          <div className="mt-16 pt-8 border-t-2 border-gray-300">
            <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">🥉 3. lük Maçı</h3>
            <div className="flex justify-center">
              <div className="w-64">
                <MatchBox match={data.thirdPlace} size="normal" />
                <WatchButton match={data.thirdPlace} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal 
        match={shareModal.match}
        isVisible={shareModal.isVisible}
        onClose={closeShareModal}
      />

      {/* Konfeti bileşeni */}
      {data.champion && <Confetti />}
    </div>
  )
}

export default TournamentBracket 