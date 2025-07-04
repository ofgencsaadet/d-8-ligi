import { useState, useEffect } from 'react'
import { isWithinWeek, getWeatherForecast, getWeatherForDateTime, getMockWeatherData } from '../utils/weather'
import ShareModal from './ShareModal'

function MatchList({ matches, type, onTeamComparison }) {
  const [sortByDate, setSortByDate] = useState(true)
  const [forecastData, setForecastData] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [shareModal, setShareModal] = useState({ isVisible: false, match: null })

  // Hava durumu verilerini yükle (sadece upcoming maçlar için)
  useEffect(() => {
    if (type === 'upcoming') {
      const hasWeeklyMatches = matches.some(match => isWithinWeek(match.date))
      
      if (import.meta.env.DEV) {
        console.log('Hava durumu useEffect:', {
          type,
          matchCount: matches.length,
          hasWeeklyMatches,
          weeklyMatches: matches.filter(match => isWithinWeek(match.date)).map(m => ({ date: m.date, time: m.time }))
        })
      }
      
      if (hasWeeklyMatches) {
        setWeatherLoading(true)
        if (import.meta.env.DEV) {
          console.log('Hava durumu API çağrısı başlatılıyor...')
        }
        
        // Gerçek API çağrısı
        getWeatherForecast()
          .then(data => {
            if (import.meta.env.DEV) {
              console.log('Hava durumu API yanıtı:', data)
            }
            setForecastData(data)
          })
          .catch(error => {
            console.error('Hava durumu yüklenirken hata:', error)
            setForecastData(null)
          })
          .finally(() => {
            setWeatherLoading(false)
          })
      } else {
        if (import.meta.env.DEV) {
          console.log('7 gün içinde maç yok, hava durumu API çağrısı yapılmıyor')
        }
      }
    }
  }, [matches, type])

  // Belirli bir maç için hava durumu al
  const getMatchWeather = (match) => {
    if (!match.date || !isWithinWeek(match.date)) {
      if (import.meta.env.DEV) {
        console.log('Hava durumu gösterilmiyor - tarih yok veya 7 gün dışında:', {
          hasDate: !!match.date,
          withinWeek: match.date ? isWithinWeek(match.date) : false
        })
      }
      return null
    }
    
    if (import.meta.env.DEV) {
      console.log('getMatchWeather çağrıldı:', {
        matchDate: match.date,
        matchTime: match.time,
        hasForecastData: !!forecastData
      })
    }
    
    // Gerçek API verisi varsa onu kullan
    const realWeather = getWeatherForDateTime(forecastData, match.date, match.time)
    
    if (import.meta.env.DEV) {
      console.log('API hava durumu:', realWeather)
    }
    
    if (realWeather) return realWeather
    
    if (import.meta.env.DEV) {
      console.log('API verisi yok, mock veri kullanılıyor')
    }
    
    // API verisi yoksa deterministik mock data kullan
    return getMockWeatherData(match.date, match.time)
  }

  // Paylaşım modal'ını aç
  const openShareModal = (match) => {
    setShareModal({ isVisible: true, match })
  }

  // Paylaşım modal'ını kapat
  const closeShareModal = () => {
    setShareModal({ isVisible: false, match: null })
  }


  
  const formatDate = (dateString) => {
    // Eğer dateString undefined, null veya string değilse fallback döndür
    if (!dateString || typeof dateString !== 'string') {
      return 'Tarih bilinmiyor'
    }
    
    // Excel'den gelen "16.06.2024" formatını "2024-06-16" formatına çevir
    const parts = dateString.split('.')
    if (parts.length === 3) {
      const [day, month, year] = parts
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long' 
      }
      return new Date(isoDate).toLocaleDateString('tr-TR', options)
    }
    
    // Fallback: eğer format farklıysa olduğu gibi döndür
    return dateString
  }

  const formatTeamName = (teamName) => {
    // Eğer teamName undefined, null veya string değilse fallback döndür
    if (!teamName || typeof teamName !== 'string') {
      return 'Takım bilinmiyor'
    }
    
    // Takım ismini mobile'da kısalt
    if (teamName.length > 18) {
      return teamName.substring(0, 18) + '...'
    }
    return teamName
  }

  const sortMatchesByDate = (matches) => {
    return [...matches].sort((a, b) => {
      // Tarihi DD.MM.YYYY formatından YYYY-MM-DD formatına çevir
      const dateA = a.date ? a.date.split('.').reverse().join('-') : '9999-12-31'
      const dateB = b.date ? b.date.split('.').reverse().join('-') : '9999-12-31'
      
      // Oynanmış maçlar için ters sıralama (yeniden eskiye)
      // Oynanacak maçlar için normal sıralama (eskiden yeniye)
      const isReverse = type === 'played'
      
      // Önce tarihe göre sırala
      if (dateA !== dateB) {
        return isReverse ? dateB.localeCompare(dateA) : dateA.localeCompare(dateB)
      }
      
      // Eğer tarihler aynıysa saate göre sırala
      const timeA = a.time || '23:59'
      const timeB = b.time || '23:59'
      return isReverse ? timeB.localeCompare(timeA) : timeA.localeCompare(timeB)
    })
  }

  const groupedMatches = matches.reduce((acc, match) => {
    if (!acc[match.group]) {
      acc[match.group] = []
    }
    acc[match.group].push(match)
    return acc
  }, {})

  if (matches.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">
          {type === 'played' ? '🏆' : '📅'}
        </div>
        <p className="text-xl text-gray-500">
          {type === 'played' ? 'Henüz oynanmış maç bulunmuyor.' : 'Henüz planlanmış maç bulunmuyor.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sıralama Toggle Butonu */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sıralama:</span>
            <button
              onClick={() => setSortByDate(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !sortByDate 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📂 Gruplara Göre
            </button>
            <button
              onClick={() => setSortByDate(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortByDate 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📅 Tarihe Göre
            </button>
          </div>
        </div>
      </div>

      {/* Maç Listesi */}
      {sortByDate ? (
        // Tarihe göre sıralı tek liste
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h3 className="text-xl font-bold text-white text-center">
              Tüm Maçlar - Tarihe Göre Sıralı
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {sortMatchesByDate(matches).map((match, index) => {
              const currentDate = match.date
              const previousDate = index > 0 ? sortMatchesByDate(matches)[index - 1].date : null
              const showDateSeparator = currentDate !== previousDate

              return (
                <div key={index}>
                  {showDateSeparator && (
                    <div className="bg-gray-100 border-t-2 border-blue-200 px-6 py-3">
                      <div className="text-center text-sm font-semibold text-gray-700 flex items-center justify-center space-x-2">
                        <span className="h-px bg-gray-300 flex-1"></span>
                        <span className="px-3 bg-gray-100">
                          📅 {formatDate(currentDate)}
                        </span>
                        <span className="h-px bg-gray-300 flex-1"></span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
                      {/* Saat ve Hava Durumu */}
                      <div className="text-sm text-gray-500 lg:w-1/4">
                        {match.time && <div>🕐 {match.time}</div>}
                        <div className="mt-1 text-xs font-medium text-blue-600">
                          {match.group}
                        </div>
                        
                        {/* Hava Durumu */}
                        {type === 'upcoming' && isWithinWeek(match.date) && (() => {
                          const weather = getMatchWeather(match)
                          return weather ? (
                            <div className="mt-2 flex items-center space-x-1 text-xs">
                              <span>{weather.icon}</span>
                              <span className="font-medium text-blue-600">{weather.temperature}°C</span>
                              <span 
                                className="text-gray-500 hidden sm:inline cursor-help" 
                                title={weather.originalDescription ? `API: ${weather.originalDescription}` : weather.description}
                              >
                                {weather.description}
                              </span>
                            </div>
                          ) : null
                        })()}
                      </div>
                      
                      {/* Maç */}
                      <div className="flex items-center justify-center lg:w-1/2">
                        <div className="flex items-center space-x-3 text-base w-full">
                          <div className="text-right font-medium text-gray-800 flex-1 min-w-0">
                            <span className="block leading-tight lg:hidden" title={match.team1}>
                              {formatTeamName(match.team1)}
                            </span>
                            <span className="hidden lg:block leading-tight">
                              {match.team1}
                            </span>
                          </div>
                          
                          {type === 'played' ? (
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span className="text-xl font-bold text-blue-600">
                                {match.score1}
                              </span>
                              <span className="text-gray-400">-</span>
                              <span className="text-xl font-bold text-blue-600">
                                {match.score2}
                              </span>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-lg font-bold flex-shrink-0">
                              vs
                            </div>
                          )}
                          
                          <div className="text-left font-medium text-gray-800 flex-1 min-w-0">
                            <span className="block leading-tight lg:hidden" title={match.team2}>
                              {formatTeamName(match.team2)}
                            </span>
                            <span className="hidden lg:block leading-tight">
                              {match.team2}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sonuç durumu ve Butonlar */}
                      <div className="text-center lg:w-1/4">
                        {type === 'upcoming' && (
                          <div className="flex flex-col space-y-2 items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              ⏳ Beklemede
                            </span>
                            {onTeamComparison && (
                              <button
                                onClick={() => onTeamComparison(match.team1, match.team2)}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200"
                              >
                                <span className="mr-1">⚖️</span>
                                Takımları Karşılaştır
                              </button>
                            )}
                          </div>
                        )}
                        {type === 'played' && (
                          <div className="flex flex-col space-y-2 items-center">
                            {match.videoLink && (
                              <a
                                href={match.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                              >
                                <span className="mr-1">📺</span>
                                Maçı İzle
                              </a>
                            )}
                            <button
                              onClick={() => openShareModal(match)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                              <span className="mr-1">📤</span>
                              Sonucu Paylaş
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        // Gruplara göre sıralı liste (mevcut)
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([groupName, groupMatches]) => (
            <div key={groupName} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white text-center">
                  {groupName}
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {groupMatches.map((match, index) => (
                  <div key={index} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
                      {/* Tarih, Saat ve Hava Durumu */}
                      <div className="text-sm text-gray-500 lg:w-1/4">
                        <div>📅 {formatDate(match.date)}</div>
                        {match.time && <div className="mt-1">🕐 {match.time}</div>}
                        
                        {/* Hava Durumu */}
                        {type === 'upcoming' && isWithinWeek(match.date) && (() => {
                          const weather = getMatchWeather(match)
                          return weather ? (
                            <div className="mt-2 flex items-center space-x-1 text-xs">
                              <span>{weather.icon}</span>
                              <span className="font-medium text-blue-600">{weather.temperature}°C</span>
                              <span 
                                className="text-gray-500 hidden sm:inline cursor-help" 
                                title={weather.originalDescription ? `API: ${weather.originalDescription}` : weather.description}
                              >
                                {weather.description}
                              </span>
                            </div>
                          ) : null
                        })()}
                      </div>
                      
                      {/* Maç */}
                      <div className="flex items-center justify-center lg:w-1/2">
                        <div className="flex items-center space-x-3 text-base w-full">
                          <div className="text-right font-medium text-gray-800 flex-1 min-w-0">
                            <span className="block leading-tight lg:hidden" title={match.team1}>
                              {formatTeamName(match.team1)}
                            </span>
                            <span className="hidden lg:block leading-tight">
                              {match.team1}
                            </span>
                          </div>
                          
                          {type === 'played' ? (
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <span className="text-xl font-bold text-blue-600">
                                {match.score1}
                              </span>
                              <span className="text-gray-400">-</span>
                              <span className="text-xl font-bold text-blue-600">
                                {match.score2}
                              </span>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-lg font-bold flex-shrink-0">
                              vs
                            </div>
                          )}
                          
                          <div className="text-left font-medium text-gray-800 flex-1 min-w-0">
                            <span className="block leading-tight lg:hidden" title={match.team2}>
                              {formatTeamName(match.team2)}
                            </span>
                            <span className="hidden lg:block leading-tight">
                              {match.team2}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sonuç durumu ve Butonlar */}
                      <div className="text-center lg:w-1/4">
                        {type === 'upcoming' && (
                          <div className="flex flex-col space-y-2 items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              ⏳ Beklemede
                            </span>
                            {onTeamComparison && (
                              <button
                                onClick={() => onTeamComparison(match.team1, match.team2)}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-200"
                              >
                                <span className="mr-1">⚖️</span>
                                Takımları Karşılaştır
                              </button>
                            )}
                          </div>
                        )}
                        {type === 'played' && (
                          <div className="flex flex-col space-y-2 items-center">
                            {match.videoLink && (
                              <a
                                href={match.videoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                              >
                                <span className="mr-1">📺</span>
                                Maçı İzle
                              </a>
                            )}
                            <button
                              onClick={() => openShareModal(match)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                              <span className="mr-1">📤</span>
                              Sonucu Paylaş
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        match={shareModal.match}
        isVisible={shareModal.isVisible}
        onClose={closeShareModal}
      />
    </div>
  )
}

export default MatchList 