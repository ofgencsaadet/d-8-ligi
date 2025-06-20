import { useState } from 'react'

function MatchList({ matches, type }) {
  const [sortByDate, setSortByDate] = useState(true)
  
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
    if (teamName.length > 15) {
      return teamName.substring(0, 15) + '...'
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
                      {/* Saat */}
                      <div className="text-sm text-gray-500 lg:w-1/4">
                        {match.time && <div>🕐 {match.time}</div>}
                        <div className="mt-1 text-xs font-medium text-blue-600">
                          {match.group}
                        </div>
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
                      
                      {/* Sonuç durumu */}
                      <div className="text-center lg:w-1/4">
                        {type === 'upcoming' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Beklemede
                          </span>
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
                      {/* Tarih ve Saat */}
                      <div className="text-sm text-gray-500 lg:w-1/4">
                        <div>📅 {formatDate(match.date)}</div>
                        {match.time && <div className="mt-1">🕐 {match.time}</div>}
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
                      
                      {/* Sonuç durumu */}
                      <div className="text-center lg:w-1/4">
                        {type === 'upcoming' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                            ⏳ Beklemede
                          </span>
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
    </div>
  )
}

export default MatchList 