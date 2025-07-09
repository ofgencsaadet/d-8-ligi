import { useState, useEffect, useRef } from 'react'
import ShareModal from './ShareModal'
import { isWithinWeek, getWeatherForecast, getWeatherForDateTime, getMockWeatherData } from '../utils/weather'

function TournamentBracket({ data, onTeamComparison }) {
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

  // Takım ismi component'i - gerçek taşma kontrolü ile
  const TeamName = ({ teamName }) => {
    const textRef = useRef(null)
    const [needsAnimation, setNeedsAnimation] = useState(false)

    useEffect(() => {
      const checkOverflow = () => {
        if (textRef.current && teamName) {
          // Element'in içeriği taşıyor mu kontrol et
          const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth + 5 // 5px tolerans
          setNeedsAnimation(isOverflowing)
        }
      }

      // DOM tam yüklendikten sonra kontrol et
      const timer = setTimeout(checkOverflow, 100)
      
      // Window resize'da da kontrol et
      window.addEventListener('resize', checkOverflow)
      
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', checkOverflow)
      }
    }, [teamName]) // animationKey dependency'sini kaldırdık

    return (
      <div 
        ref={textRef}
        className={`${needsAnimation ? 'animate-marquee' : ''} whitespace-nowrap`}
      >
        {teamName}
      </div>
    )
  }

  // Konfeti bileşeni
  const Confetti = () => {
    const confettiPieces = []
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe']
    
    // 50 konfeti parçası oluştur
    for (let i = 0; i < 50; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      const randomDelay = Math.random() * 0.5 // 0-0.5 saniye gecikme (çok kısa)
      const randomDuration = 2 + Math.random() * 1.5 // 2-3.5 saniye süre (daha hızlı)
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

  // Şampiyon arka plan yazısı bileşeni
  const ChampionBackground = ({ championName }) => {
    const championTexts = []
    const animationClasses = ['animate-champion-float-1', 'animate-champion-float-2', 'animate-champion-float-3']
    const textSizes = ['text-3xl', 'text-4xl', 'text-5xl']
    const textColors = ['text-yellow-400', 'text-yellow-500', 'text-amber-400', 'text-orange-400']
    
    // 4 adet şampiyon yazısı oluştur - rastgele pozisyonlarda
    for (let i = 0; i < 4; i++) {
      const randomAnimation = animationClasses[Math.floor(Math.random() * animationClasses.length)]
      const randomSize = textSizes[Math.floor(Math.random() * textSizes.length)]
      const randomColor = textColors[Math.floor(Math.random() * textColors.length)]
      const randomTop = 5 + Math.random() * 90 // Tamamen rastgele dikey pozisyon
      const randomLeft = 5 + Math.random() * 90 // Tamamen rastgele yatay pozisyon
      const randomDelay = i * 1.5 // Sıralı doğma: 0s, 1.5s, 3s, 4.5s
      
      championTexts.push(
        <div
          key={i}
          className={`absolute font-bold ${randomAnimation} ${randomSize} ${randomColor} select-none whitespace-nowrap`}
          style={{
            top: `${randomTop}%`,
            left: `${randomLeft}%`,
            animationDelay: `${randomDelay}s`,
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            transform: 'translate(-50%, -50%)',
            fontWeight: 'bold',
            letterSpacing: '3px',
            opacity: 0.5 // Sabit opacity - hiç kaybolmaz
          }}
        >
          🏆 {championName} 🏆
        </div>
      )
    }
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {championTexts}
      </div>
    )
  }

  if (!data || !data.quarterFinals) {
    return null
  }

  // Paylaşım modal'ını aç
  const openShareModal = (match) => {
    if (match.played) {
      // Hangi turdan geldiğini belirle ve group bilgisini ekle
      let groupInfo = 'Kupa Yolu'
      
      // Çeyrek finaller
      if (data.quarterFinals && data.quarterFinals.includes(match)) {
        groupInfo = 'Kupa Yolu - Çeyrek Final'
      }
      // Yarı finaller  
      else if (data.semiFinals && data.semiFinals.includes(match)) {
        groupInfo = 'Kupa Yolu - Yarı Final'
      }
      // Final
      else if (data.final && data.final === match) {
        groupInfo = 'Kupa Yolu - Final'
      }
      // 3. lük maçı
      else if (data.thirdPlace && data.thirdPlace === match) {
        groupInfo = 'Kupa Yolu - 3. lük Maçı'
      }
      
      // Maç objesini group bilgisi ile birlikte gönder
      const matchWithGroup = {
        ...match,
        group: groupInfo
      }
      
      setShareModal({ isVisible: true, match: matchWithGroup })
    }
  }

  // Maç kutusuna tıklama handler
  const handleMatchClick = (match) => {
    if (match.played) {
      // Oynanmış maç - paylaşım modalını aç
      openShareModal(match)
    } else if (onTeamComparison && match.team1 && match.team2) {
      // Oynanacak maç - takım karşılaştırmasını aç
      onTeamComparison(match.team1, match.team2)
    }
  }

  // Paylaşım modal'ını kapat
  const closeShareModal = () => {
    setShareModal({ isVisible: false, match: null })
  }

  // Çizgi rengini belirle - kazanan yoluna göre
  const getLineColor = (section, position) => {
    if (!data) return 'bg-gray-600'
    
    // Sol yarı final çizgileri
    if (section === 'left-semi') {
      const semiFinal = data.semiFinals?.[0]
      if (semiFinal?.played && semiFinal?.winner) {
        const qf1Winner = data.quarterFinals?.[0]?.winner
        const qf2Winner = data.quarterFinals?.[1]?.winner
        
        if (position === 'top' && qf1Winner === semiFinal.winner) {
          return 'bg-green-500' // Çeyrek Final 1'den gelen kazandı
        } else if (position === 'bottom' && qf2Winner === semiFinal.winner) {
          return 'bg-green-500' // Çeyrek Final 2'den gelen kazandı
        }
      }
    }
    
    // Sağ yarı final çizgileri
    if (section === 'right-semi') {
      const semiFinal = data.semiFinals?.[1]
      if (semiFinal?.played && semiFinal?.winner) {
        const qf3Winner = data.quarterFinals?.[2]?.winner
        const qf4Winner = data.quarterFinals?.[3]?.winner
        
        if (position === 'top' && qf3Winner === semiFinal.winner) {
          return 'bg-green-500' // Çeyrek Final 3'ten gelen kazandı
        } else if (position === 'bottom' && qf4Winner === semiFinal.winner) {
          return 'bg-green-500' // Çeyrek Final 4'ten gelen kazandı
        }
      }
    }
    
    // Final çizgileri
    if (section === 'final') {
      const final = data.final
      if (final?.played && final?.winner) {
        const leftSemiWinner = data.semiFinals?.[0]?.winner
        const rightSemiWinner = data.semiFinals?.[1]?.winner
        
        if (position === 'left' && leftSemiWinner === final.winner) {
          return 'bg-green-500' // Sol yarı finalden gelen kazandı
        } else if (position === 'right' && rightSemiWinner === final.winner) {
          return 'bg-green-500' // Sağ yarı finalden gelen kazandı
        }
      }
    }
    
    return 'bg-gray-600' // Varsayılan renk
  }

  // Maç kutusu bileşeni
  const MatchBox = ({ match, size = 'normal', showScore = true, className = '' }) => {
    if (!match) return (
      <div className={`w-full h-16 bg-gray-100 dark:bg-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm ${className}`}>
        Beklemede
      </div>
    )

    const isPlayed = match.played
    const isWinner = (team) => match.winner === team
    
    let bgColor = 'bg-gray-100 dark:bg-gray-700'
    if (isPlayed) {
      bgColor = 'bg-white dark:bg-gray-800'
    }

    const sizeClasses = {
      small: 'h-12 text-xs',
      normal: 'h-14 text-sm',
      large: 'h-16 text-base'
    }

    return (
      <div className={`w-full ${className}`}>
        <div 
          className={`w-full ${sizeClasses[size]} ${bgColor} rounded border-2 border-gray-200 dark:border-gray-600 shadow-sm transition-all hover:shadow-md cursor-pointer ${isPlayed ? 'hover:border-blue-300 dark:hover:border-blue-500' : 'hover:border-purple-300 dark:hover:border-purple-500'}`}
          onClick={() => handleMatchClick(match)}
        >
          <div className="h-full flex flex-col">
            {/* Takım 1 */}
            <div className={`flex-1 flex items-center px-3 border-b border-gray-200 dark:border-gray-600 ${isWinner(match.team1) ? 'bg-green-100 dark:bg-green-900/30 font-bold text-green-800 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
              <div className="flex-1 min-w-0 mr-2 overflow-hidden">
                <TeamName 
                  teamName={match.team1} 
                />
              </div>
              {showScore && isPlayed && (
                <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">{match.score1}</span>
              )}
            </div>
            
            {/* Takım 2 */}
            <div className={`flex-1 flex items-center px-3 ${isWinner(match.team2) ? 'bg-green-100 dark:bg-green-900/30 font-bold text-green-800 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}`}>
              <div className="flex-1 min-w-0 mr-2 overflow-hidden">
                <TeamName 
                  teamName={match.team2} 
                />
              </div>
              {showScore && isPlayed && (
                <span className="font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">{match.score2}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Tarih - sadece normal ve large size için */}
        {(size === 'normal' || size === 'large') && match.date && (
          <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 mt-1 bg-gray-50 dark:bg-gray-700 rounded text-center">
            <div className="flex items-center justify-center gap-1 flex-wrap">
              <span className="text-xs">📅 {match.date}</span>
              {match.time && <span className="text-xs">🕒 {match.time}</span>}
              
              {/* Hava durumu */}
              {(() => {
                const weather = getMatchWeather(match)
                return weather ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{weather.icon}</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400 text-xs">{weather.temperature}°C</span>
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-8 relative">
      {/* Şampiyon arka plan yazısı */}
      {data.champion && <ChampionBackground championName={data.champion} />}
      
      {/* Başlık */}
      <div className="text-center mb-6 relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          🏆 Kupa Yolu
        </h2>
        {data.champion && (
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/50 border-2 border-yellow-400 dark:border-yellow-500 rounded-lg shadow-lg">
            <span className="text-2xl mr-2 animate-bounce-gentle">🏆</span>
            <span className="text-lg md:text-xl font-bold text-yellow-800 dark:text-yellow-200">Şampiyon: {data.champion}</span>
          </div>
        )}
      </div>

      {/* Mobil görünüm - Kaydırılabilir masaüstü bracket */}
      <div className="block lg:hidden relative z-10">
        {/* Kaydırma ipucu */}
        <div className="text-center mb-4 text-sm text-gray-500 dark:text-gray-400">
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
                  <div className={`absolute -top-16 left-0 w-3/4 h-1 ${getLineColor('left-semi', 'top')}`}></div>
                  {/* Üst vertical çizgi */}
                  <div className={`absolute -top-16 left-3/4 w-1 h-24 ${getLineColor('left-semi', 'top')}`}></div>
                  {/* Orta horizontal çizgi (yarı finale giden) */}
                  <div className={`absolute top-7 left-3/4 w-1/4 h-1 ${getLineColor('left-semi', data.semiFinals?.[0]?.winner === data.quarterFinals?.[0]?.winner ? 'top' : 'bottom')}`}></div>
                  {/* Alt vertical çizgi */}
                  <div className={`absolute bottom-0 left-3/4 w-1 h-24 ${getLineColor('left-semi', 'bottom')}`}></div>
                  {/* Alt horizontal çizgi (sol çeyrek final 2'den) - kutu ortasından */}
                  <div className={`absolute -bottom-0 left-0 w-3/4 h-1 ${getLineColor('left-semi', 'bottom')}`}></div>
                </div>
              </div>

              {/* Sol Yarı Final */}
              <div className="col-span-1">
                <MatchBox match={data.semiFinals[0]} size="normal" />
                <WatchButton match={data.semiFinals[0]} />
              </div>

              {/* Sol Final Bağlantısı */}
              <div className="col-span-1 flex justify-center items-end pb-7">
                <div className={`w-full h-1 ${getLineColor('final', 'left')}`}></div>
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
                <div className={`w-full h-1 ${getLineColor('final', 'right')}`}></div>
              </div>

              {/* Sağ Yarı Final */}
              <div className="col-span-1">
                <MatchBox match={data.semiFinals[1]} size="normal" />
                <WatchButton match={data.semiFinals[1]} />
              </div>

              {/* Sağ Bağlantı - Düzeltilmiş çizgi */}
              <div className="col-span-1 flex flex-col items-center justify-center h-full">
                <div className="relative w-full h-32">
                  {/* Üst horizontal çizgi (sağ çeyrek final 3'ten) - kutu ortasından */}
                  <div className={`absolute -top-16 right-0 w-3/4 h-1 ${getLineColor('right-semi', 'top')}`}></div>
                  {/* Üst vertical çizgi */}
                  <div className={`absolute -top-16 right-3/4 w-1 h-24 ${getLineColor('right-semi', 'top')}`}></div>
                  {/* Orta horizontal çizgi (yarı finale giden) */}
                  <div className={`absolute top-7 right-3/4 w-1/4 h-1 ${getLineColor('right-semi', data.semiFinals?.[1]?.winner === data.quarterFinals?.[2]?.winner ? 'top' : 'bottom')}`}></div>
                  {/* Alt vertical çizgi */}
                  <div className={`absolute top-6 right-3/4 w-1 h-28 ${getLineColor('right-semi', 'bottom')}`}></div>
                  {/* Alt horizontal çizgi (sağ çeyrek final 4'ten) - kutu ortasından */}
                  <div className={`absolute -bottom-2 right-0 w-3/4 h-1 ${getLineColor('right-semi', 'bottom')}`}></div>
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
          <div className="text-center mt-8 mb-4 text-sm text-gray-500 dark:text-gray-400">
            ← Sağa sola kaydırarak tüm kupa yolunu görün →
          </div>
        )}

        {/* 3. lük maçı - Alt kısım */}
        {data.thirdPlace && (
          <div className="mt-8 pt-8 border-t-2 border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">🥉 3. lük Maçı</h3>
            <div className="flex justify-center">
              <div className="w-64">
                <MatchBox match={data.thirdPlace} size="normal" />
                <WatchButton match={data.thirdPlace} />
                
                {/* Kazanan bilgisi için sabit alan */}
                <div className="h-8 mt-3 flex items-center justify-center">
                  {data.thirdPlace.winner && (
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded">
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
      <div className="hidden lg:block relative z-10">
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
                <div className={`absolute -top-16 left-0 w-3/4 h-1 ${getLineColor('left-semi', 'top')}`}></div>
                {/* Üst vertical çizgi */}
                <div className={`absolute -top-16 left-3/4 w-1 h-24 ${getLineColor('left-semi', 'top')}`}></div>
                {/* Orta horizontal çizgi (yarı finale giden) */}
                <div className={`absolute top-7 left-3/4 w-1/4 h-1 ${getLineColor('left-semi', data.semiFinals?.[0]?.winner === data.quarterFinals?.[0]?.winner ? 'top' : 'bottom')}`}></div>
                {/* Alt vertical çizgi */}
                <div className={`absolute bottom-0 left-3/4 w-1 h-24 ${getLineColor('left-semi', 'bottom')}`}></div>
                {/* Alt horizontal çizgi (sol çeyrek final 2'den) - kutu ortasından */}
                <div className={`absolute -bottom-0 left-0 w-3/4 h-1 ${getLineColor('left-semi', 'bottom')}`}></div>
              </div>
            </div>

            {/* Sol Yarı Final */}
            <div className="col-span-1">
              <MatchBox match={data.semiFinals[0]} size="normal" />
              <WatchButton match={data.semiFinals[0]} />
            </div>

            {/* Sol Final Bağlantısı */}
            <div className="col-span-1 flex justify-center items-end pb-7">
              <div className={`w-full h-1 ${getLineColor('final', 'left')}`}></div>
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
                  <div className="text-xs text-gray-600 dark:text-gray-400">Şampiyon</div>
                  <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{data.champion}</div>
                </div>
              )}
            </div>

            {/* Sağ Final Bağlantısı */}
            <div className="col-span-1 flex justify-center items-end pb-7">
              <div className={`w-full h-1 ${getLineColor('final', 'right')}`}></div>
            </div>

            {/* Sağ Yarı Final */}
            <div className="col-span-1">
              <MatchBox match={data.semiFinals[1]} size="normal" />
              <WatchButton match={data.semiFinals[1]} />
            </div>

            {/* Sağ Bağlantı - Düzeltilmiş çizgi */}
            <div className="col-span-1 flex flex-col items-center justify-center h-full">
              <div className="relative w-full h-32">
                {/* Üst horizontal çizgi (sağ çeyrek final 3'ten) - kutu ortasından */}
                <div className={`absolute -top-16 right-0 w-3/4 h-1 ${getLineColor('right-semi', 'top')}`}></div>
                {/* Üst vertical çizgi */}
                <div className={`absolute -top-16 right-3/4 w-1 h-24 ${getLineColor('right-semi', 'top')}`}></div>
                {/* Orta horizontal çizgi (yarı finale giden) */}
                <div className={`absolute top-7 right-3/4 w-1/4 h-1 ${getLineColor('right-semi', data.semiFinals?.[1]?.winner === data.quarterFinals?.[2]?.winner ? 'top' : 'bottom')}`}></div>
                {/* Alt vertical çizgi */}
                <div className={`absolute top-7 right-3/4 w-1 h-28 ${getLineColor('right-semi', 'bottom')}`}></div>
                {/* Alt horizontal çizgi (sağ çeyrek final 4'ten) - kutu ortasından */}
                <div className={`absolute -bottom-3 right-0 w-3/4 h-1 ${getLineColor('right-semi', 'bottom')}`}></div>
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
          <div className="mt-16 pt-8 border-t-2 border-gray-300 dark:border-gray-600">
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4 text-center">🥉 3. lük Maçı</h3>
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
      <div className="relative z-50">
        <ShareModal 
          match={shareModal.match}
          isVisible={shareModal.isVisible}
          onClose={closeShareModal}
        />
      </div>

      {/* Konfeti bileşeni */}
      {data.champion && <Confetti />}
    </div>
  )
}

export default TournamentBracket 