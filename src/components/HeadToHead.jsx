import React, { useState, useMemo, useEffect } from 'react'

function HeadToHead({ matches, playoffData, initialTeams }) {
  const [selectedTeam1, setSelectedTeam1] = useState('')
  const [selectedTeam2, setSelectedTeam2] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'league', 'playoff', 'all'

  // İlk takımları otomatik seç
  useEffect(() => {
    if (initialTeams) {
      setSelectedTeam1(initialTeams.team1)
      setSelectedTeam2(initialTeams.team2)
    }
  }, [initialTeams])

  // Playoff verilerini normal maç formatına çevir
  const convertPlayoffToMatches = () => {
    if (!playoffData) return []
    
    const playoffMatches = []
    
    // Çeyrek finaller
    if (playoffData.quarterFinals) {
      playoffData.quarterFinals.forEach(match => {
        if (match.score1 !== null && match.score2 !== null) {
          playoffMatches.push({
            ...match,
            isPlayoff: true,
            round: 'Çeyrek Final'
          })
        }
      })
    }
    
    // Yarı finaller
    if (playoffData.semiFinals) {
      playoffData.semiFinals.forEach(match => {
        if (match.score1 !== null && match.score2 !== null) {
          playoffMatches.push({
            ...match,
            isPlayoff: true,
            round: 'Yarı Final'
          })
        }
      })
    }
    
    // Final
    if (playoffData.final && playoffData.final.score1 !== null && playoffData.final.score2 !== null) {
      playoffMatches.push({
        ...playoffData.final,
        isPlayoff: true,
        round: 'Final'
      })
    }
    
    // 3. lük maçı
    if (playoffData.thirdPlace && playoffData.thirdPlace.score1 !== null && playoffData.thirdPlace.score2 !== null) {
      playoffMatches.push({
        ...playoffData.thirdPlace,
        isPlayoff: true,
        round: '3. lük Maçı'
      })
    }
    
    return playoffMatches
  }

  const playoffMatches = convertPlayoffToMatches()

  // Aktif sekmeyede göre maçları filtrele
  const getActiveMatches = () => {
    switch (activeTab) {
      case 'league':
        return matches || []
      case 'playoff':
        return playoffMatches
      case 'all':
        return [...(matches || []), ...playoffMatches]
      default:
        return [...(matches || []), ...playoffMatches]
    }
  }

  const activeMatches = getActiveMatches()

  // Takım listesini al
  const teams = useMemo(() => {
    const teamSet = new Set()
    activeMatches.forEach(match => {
      if (match.score1 !== null && match.score2 !== null) {
        teamSet.add(match.team1)
        teamSet.add(match.team2)
      }
    })
    return Array.from(teamSet).sort()
  }, [activeMatches])

  // Takım istatistiklerini hesapla (seçili sekmedeki maçlardan)
  const calculateTeamStats = (teamName) => {
    let totalMatches = 0
    let wins = 0
    let draws = 0
    let losses = 0
    let goalsFor = 0
    let goalsAgainst = 0

    activeMatches.forEach(match => {
      if (match.score1 === null || match.score2 === null) return

      if (match.team1 === teamName) {
        totalMatches++
        goalsFor += match.score1
        goalsAgainst += match.score2
        if (match.score1 > match.score2) wins++
        else if (match.score1 === match.score2) draws++
        else losses++
      } else if (match.team2 === teamName) {
        totalMatches++
        goalsFor += match.score2
        goalsAgainst += match.score1
        if (match.score2 > match.score1) wins++
        else if (match.score2 === match.score1) draws++
        else losses++
      }
    })

    const goalDifference = goalsFor - goalsAgainst
    const winPercentage = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
    const points = wins * 3 + draws

    return {
      totalMatches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference,
      winPercentage,
      points
    }
  }

  // İki takım karşılaştırması
  const calculateTeamComparison = () => {
    if (!selectedTeam1 || !selectedTeam2) return null

    const team1Stats = calculateTeamStats(selectedTeam1)
    const team2Stats = calculateTeamStats(selectedTeam2)

    // Direkt karşılaşmaları bul
    const headToHeadMatches = activeMatches.filter(match => 
      match.score1 !== null && match.score2 !== null &&
      ((match.team1 === selectedTeam1 && match.team2 === selectedTeam2) ||
       (match.team1 === selectedTeam2 && match.team2 === selectedTeam1))
    )

    let headToHeadStats = {
      totalMatches: headToHeadMatches.length,
      team1Wins: 0,
      team2Wins: 0,
      draws: 0,
      matches: headToHeadMatches.map(match => ({
        ...match,
        date: new Date(match.date).toLocaleDateString('tr-TR'),
        displayRound: match.isPlayoff ? match.round : 'Lig Maçı'
      })).reverse()
    }

    headToHeadMatches.forEach(match => {
      const isTeam1Home = match.team1 === selectedTeam1
      const team1Score = isTeam1Home ? match.score1 : match.score2
      const team2Score = isTeam1Home ? match.score2 : match.score1

      if (team1Score > team2Score) headToHeadStats.team1Wins++
      else if (team2Score > team1Score) headToHeadStats.team2Wins++
      else headToHeadStats.draws++
    })

    return {
      team1: { name: selectedTeam1, ...team1Stats },
      team2: { name: selectedTeam2, ...team2Stats },
      headToHead: headToHeadStats
    }
  }

  const comparisonData = calculateTeamComparison()

  // Hangi takımın daha iyi olduğunu belirle
  const getBetterTeam = (stat1, stat2, higherIsBetter = true) => {
    if (stat1 === stat2) return 'equal'
    if (higherIsBetter) {
      return stat1 > stat2 ? 'team1' : 'team2'
    } else {
      return stat1 < stat2 ? 'team1' : 'team2'
    }
  }

  // İstatistik rengi belirle
  const getStatColor = (comparison, team) => {
    if (comparison === 'equal') return 'text-gray-600'
    if (comparison === team) return 'text-green-600 font-semibold'
    return 'text-red-600'
  }

  // Sekme butonlarının stil sınıfları
  const getTabClass = (tabName) => {
    const baseClass = "px-4 py-2 font-medium text-sm rounded-lg transition-all duration-200"
    if (activeTab === tabName) {
      return `${baseClass} bg-blue-600 text-white shadow-md`
    }
    return `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🏆 Takım Karşılaştırması
        </h3>

        {/* Sekme sistemi */}
        {playoffMatches.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('all')}
                className={getTabClass('all')}
              >
                📊 Toplam
              </button>
              <button
                onClick={() => setActiveTab('league')}
                className={getTabClass('league')}
              >
                🏟️ Lig Maçları
              </button>
              <button
                onClick={() => setActiveTab('playoff')}
                className={getTabClass('playoff')}
              >
                🏆 Kupa Yolu
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İlk Takım
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedTeam1}
              onChange={(e) => setSelectedTeam1(e.target.value)}
            >
              <option value="">Takım seçin...</option>
              {teams.filter(team => team !== selectedTeam2).map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İkinci Takım
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedTeam2}
              onChange={(e) => setSelectedTeam2(e.target.value)}
            >
              <option value="">Takım seçin...</option>
              {teams.filter(team => team !== selectedTeam1).map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
        </div>

        {comparisonData && (
          <div className="space-y-6">
            {/* Aktif sekme bilgisi */}
            <div className="text-center text-sm text-gray-600 bg-blue-50 p-2 rounded">
              {activeTab === 'all' && '📊 Tüm maçların (lig + playoff) istatistikleri gösteriliyor'}
              {activeTab === 'league' && '🏟️ Sadece lig maçlarının istatistikleri gösteriliyor'}
              {activeTab === 'playoff' && '🏆 Sadece playoff maçlarının istatistikleri gösteriliyor'}
            </div>

            {/* Genel İstatistikler Karşılaştırması */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📊 Genel İstatistikler
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed border-collapse border border-gray-300">
                  <colgroup>
                    <col style={{ width: '33.33%' }} />
                    <col style={{ width: '33.34%' }} />
                    <col style={{ width: '33.33%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <th className="border border-gray-300 px-2 py-3 text-center font-bold">
                        <div className="truncate" title={comparisonData.team1.name}>
                          {comparisonData.team1.name}
                        </div>
                      </th>
                      <th className="border border-gray-300 px-2 py-3 text-center font-bold">
                        İstatistik
                      </th>
                      <th className="border border-gray-300 px-2 py-3 text-center font-bold">
                        <div className="truncate" title={comparisonData.team2.name}>
                          {comparisonData.team2.name}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.totalMatches, comparisonData.team2.totalMatches), 'team1')}`}>
                        {comparisonData.team1.totalMatches}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium bg-gray-50">
                        Toplam Maç
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.totalMatches, comparisonData.team2.totalMatches), 'team2')}`}>
                        {comparisonData.team2.totalMatches}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.wins, comparisonData.team2.wins), 'team1')}`}>
                        {comparisonData.team1.wins}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium">
                        Galibiyet
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.wins, comparisonData.team2.wins), 'team2')}`}>
                        {comparisonData.team2.wins}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.draws, comparisonData.team2.draws), 'team1')}`}>
                        {comparisonData.team1.draws}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium bg-gray-50">
                        Beraberlik
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.draws, comparisonData.team2.draws), 'team2')}`}>
                        {comparisonData.team2.draws}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.losses, comparisonData.team2.losses, false), 'team1')}`}>
                        {comparisonData.team1.losses}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium">
                        Mağlubiyet
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.losses, comparisonData.team2.losses, false), 'team2')}`}>
                        {comparisonData.team2.losses}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.goalsFor, comparisonData.team2.goalsFor), 'team1')}`}>
                        {comparisonData.team1.goalsFor}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium bg-gray-50">
                        Attığı Gol
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.goalsFor, comparisonData.team2.goalsFor), 'team2')}`}>
                        {comparisonData.team2.goalsFor}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.goalsAgainst, comparisonData.team2.goalsAgainst, false), 'team1')}`}>
                        {comparisonData.team1.goalsAgainst}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium">
                        Yediği Gol
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.goalsAgainst, comparisonData.team2.goalsAgainst, false), 'team2')}`}>
                        {comparisonData.team2.goalsAgainst}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.goalDifference, comparisonData.team2.goalDifference), 'team1')}`}>
                        {comparisonData.team1.goalDifference > 0 ? '+' : ''}{comparisonData.team1.goalDifference}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium bg-gray-50">
                        Averaj
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.goalDifference, comparisonData.team2.goalDifference), 'team2')}`}>
                        {comparisonData.team2.goalDifference > 0 ? '+' : ''}{comparisonData.team2.goalDifference}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.winPercentage, comparisonData.team2.winPercentage), 'team1')}`}>
                        %{comparisonData.team1.winPercentage}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium">
                        Galibiyet Oranı
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.winPercentage, comparisonData.team2.winPercentage), 'team2')}`}>
                        %{comparisonData.team2.winPercentage}
                      </td>
                    </tr>
                    <tr>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.points, comparisonData.team2.points), 'team1')}`}>
                        {comparisonData.team1.points}
                      </td>
                      <td className="border border-gray-300 px-2 py-3 text-center font-medium bg-gray-50">
                        Toplam Puan
                      </td>
                      <td className={`border border-gray-300 px-2 py-3 text-center ${getStatColor(getBetterTeam(comparisonData.team1.points, comparisonData.team2.points), 'team2')}`}>
                        {comparisonData.team2.points}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Head-to-Head Karşılaşmaları */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                🎯 Aralarındaki Karşılaşmalar
              </h4>
              
              {comparisonData.headToHead.totalMatches === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-3">🤝</div>
                  <p className="text-lg text-gray-500">
                    Bu takımlar henüz karşılaşmamış.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Head-to-Head Özet */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="text-center">
                      <p className="text-lg font-medium text-gray-800 mb-2">
                        Toplam {comparisonData.headToHead.totalMatches} karşılaşma
                        {(() => {
                          const leagueMatches = comparisonData.headToHead.matches.filter(m => !m.isPlayoff).length
                          const playoffMatches = comparisonData.headToHead.matches.filter(m => m.isPlayoff).length
                          if (leagueMatches > 0 && playoffMatches > 0) {
                            return ` (${leagueMatches} lig, ${playoffMatches} playoff)`
                          }
                          return ''
                        })()}
                      </p>
                      <div className="flex justify-center items-center gap-6 text-sm">
                        <span className="text-blue-600 font-semibold">
                          {comparisonData.team1.name}: {comparisonData.headToHead.team1Wins} galibiyet
                        </span>
                        <span className="text-gray-600">
                          {comparisonData.headToHead.draws} beraberlik
                        </span>
                        <span className="text-purple-600 font-semibold">
                          {comparisonData.team2.name}: {comparisonData.headToHead.team2Wins} galibiyet
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Maç Geçmişi */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {comparisonData.headToHead.matches.map((match, index) => {
                      const isTeam1Home = match.team1 === comparisonData.team1.name
                      const team1Score = isTeam1Home ? match.score1 : match.score2
                      const team2Score = isTeam1Home ? match.score2 : match.score1
                      
                      let resultColor = 'bg-yellow-100 border-yellow-300'
                      if (team1Score > team2Score) resultColor = 'bg-blue-100 border-blue-300'
                      else if (team2Score > team1Score) resultColor = 'bg-purple-100 border-purple-300'
                      
                      return (
                        <div key={index} className={`p-3 rounded-lg border-2 ${resultColor} ${match.isPlayoff ? 'ring-2 ring-yellow-300' : ''}`}>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                {match.isPlayoff && (
                                  <span className="text-yellow-600">
                                    {match.round === 'Final' ? '🏆' : 
                                     match.round === 'Yarı Final' ? '🔥' : 
                                     match.round === 'Çeyrek Final' ? '⚡' : 
                                     match.round === '3. lük Maçı' ? '🥉' : '🏆'}
                                  </span>
                                )}
                                <span>{match.date} - {match.displayRound}</span>
                              </div>
                            </div>
                            <div className="text-xl font-bold">
                              {team1Score} - {team2Score}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sonuç Özeti */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">
                📋 Karşılaştırma Özeti
              </h4>
              <div className="text-gray-700 space-y-2">
                {comparisonData.team1.winPercentage > comparisonData.team2.winPercentage ? (
                  <p><strong>{comparisonData.team1.name}</strong> daha yüksek galibiyet oranına sahip (%{comparisonData.team1.winPercentage} - %{comparisonData.team2.winPercentage})</p>
                ) : comparisonData.team2.winPercentage > comparisonData.team1.winPercentage ? (
                  <p><strong>{comparisonData.team2.name}</strong> daha yüksek galibiyet oranına sahip (%{comparisonData.team2.winPercentage} - %{comparisonData.team1.winPercentage})</p>
                ) : (
                  <p>Her iki takım da aynı galibiyet oranına sahip (%{comparisonData.team1.winPercentage})</p>
                )}
                
                {comparisonData.team1.goalsFor > comparisonData.team2.goalsFor ? (
                  <p><strong>{comparisonData.team1.name}</strong> daha fazla gol atmış ({comparisonData.team1.goalsFor} - {comparisonData.team2.goalsFor})</p>
                ) : comparisonData.team2.goalsFor > comparisonData.team1.goalsFor ? (
                  <p><strong>{comparisonData.team2.name}</strong> daha fazla gol atmış ({comparisonData.team2.goalsFor} - {comparisonData.team1.goalsFor})</p>
                ) : (
                  <p>Her iki takım da aynı sayıda gol atmış ({comparisonData.team1.goalsFor})</p>
                )}

                {comparisonData.headToHead.totalMatches > 0 && (
                  <>
                    {comparisonData.headToHead.team1Wins > comparisonData.headToHead.team2Wins ? (
                      <p>Aralarındaki maçlarda <strong>{comparisonData.team1.name}</strong> galibiyet sayısı olarak üstün ({comparisonData.headToHead.team1Wins} - {comparisonData.headToHead.team2Wins})</p>
                    ) : comparisonData.headToHead.team2Wins > comparisonData.headToHead.team1Wins ? (
                      <p>Aralarındaki maçlarda <strong>{comparisonData.team2.name}</strong> galibiyet sayısı olarak üstün ({comparisonData.headToHead.team2Wins} - {comparisonData.headToHead.team1Wins})</p>
                    ) : (
                      <p>Aralarındaki maçlarda eşitlik var ({comparisonData.headToHead.team1Wins} - {comparisonData.headToHead.team2Wins})</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HeadToHead 