import { useState, useEffect } from 'react'

function HeadToHead({ matches }) {
  const [selectedTeam1, setSelectedTeam1] = useState('')
  const [selectedTeam2, setSelectedTeam2] = useState('')
  const [comparisonData, setComparisonData] = useState(null)
  
  // Takım listesini oluştur
  const teams = [...new Set(matches.flatMap(match => [match.team1, match.team2]))].sort()
  
  // Takım karşılaştırma verilerini hesapla
  useEffect(() => {
    if (selectedTeam1 && selectedTeam2 && selectedTeam1 !== selectedTeam2) {
      calculateTeamComparison()
    } else {
      setComparisonData(null)
    }
  }, [selectedTeam1, selectedTeam2, matches])

  const calculateTeamStats = (teamName) => {
    // Takımın oynadığı tüm maçları bul
    const teamMatches = matches.filter(match => 
      (match.team1 === teamName || match.team2 === teamName) &&
      match.score1 !== undefined && match.score2 !== undefined
    )

    let wins = 0
    let losses = 0
    let draws = 0
    let goalsFor = 0
    let goalsAgainst = 0

    teamMatches.forEach(match => {
      let teamScore, opponentScore
      
      if (match.team1 === teamName) {
        teamScore = parseInt(match.score1)
        opponentScore = parseInt(match.score2)
      } else {
        teamScore = parseInt(match.score2)
        opponentScore = parseInt(match.score1)
      }
      
      goalsFor += teamScore
      goalsAgainst += opponentScore
      
      if (teamScore > opponentScore) {
        wins++
      } else if (teamScore < opponentScore) {
        losses++
      } else {
        draws++
      }
    })

    return {
      totalMatches: teamMatches.length,
      wins,
      losses,
      draws,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      winPercentage: teamMatches.length > 0 ? Math.round((wins / teamMatches.length) * 100) : 0,
      points: (wins * 3) + (draws * 1),
      matches: teamMatches
    }
  }
  
  const calculateTeamComparison = () => {
    const team1Stats = calculateTeamStats(selectedTeam1)
    const team2Stats = calculateTeamStats(selectedTeam2)

    // İki takım arasındaki head-to-head maçları da hesapla
    const h2hMatches = matches.filter(match => 
      (match.team1 === selectedTeam1 && match.team2 === selectedTeam2) ||
      (match.team1 === selectedTeam2 && match.team2 === selectedTeam1)
    ).filter(match => match.score1 !== undefined && match.score2 !== undefined)

    let h2hTeam1Wins = 0
    let h2hTeam2Wins = 0
    let h2hDraws = 0

    h2hMatches.forEach(match => {
      let team1Score, team2Score
      
      if (match.team1 === selectedTeam1) {
        team1Score = parseInt(match.score1)
        team2Score = parseInt(match.score2)
      } else {
        team1Score = parseInt(match.score2)
        team2Score = parseInt(match.score1)
      }
      
      if (team1Score > team2Score) {
        h2hTeam1Wins++
      } else if (team2Score > team1Score) {
        h2hTeam2Wins++
      } else {
        h2hDraws++
      }
    })

    setComparisonData({
      team1: { name: selectedTeam1, ...team1Stats },
      team2: { name: selectedTeam2, ...team2Stats },
      headToHead: {
        totalMatches: h2hMatches.length,
        team1Wins: h2hTeam1Wins,
        team2Wins: h2hTeam2Wins,
        draws: h2hDraws,
        matches: h2hMatches.sort((a, b) => {
          const dateA = a.date.split('.').reverse().join('-')
          const dateB = b.date.split('.').reverse().join('-')
          return dateB.localeCompare(dateA)
        })
      }
    })
  }

  const getBetterTeam = (stat1, stat2, higherIsBetter = true) => {
    if (stat1 === stat2) return 'equal'
    if (higherIsBetter) {
      return stat1 > stat2 ? 'team1' : 'team2'
    } else {
      return stat1 < stat2 ? 'team1' : 'team2'
    }
  }

  const getStatColor = (comparison, team) => {
    if (comparison === 'equal') return 'text-gray-600'
    if (comparison === team) return 'text-green-600 font-bold'
    return 'text-red-600'
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white text-center">
          🥊 Takım Karşılaştırma
        </h2>
        <p className="text-blue-100 text-center mt-1">
          Takımların tüm maç istatistiklerini karşılaştırın
        </p>
      </div>
      
      <div className="p-6">
        {/* Takım Seçim Alanı */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Takım
              </label>
              <select
                value={selectedTeam1}
                onChange={(e) => setSelectedTeam1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Takım Seçin</option>
                {teams.map(team => (
                  <option key={team} value={team} disabled={team === selectedTeam2}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-3xl font-bold text-gray-400 mt-6 md:mt-8">
              🆚
            </div>
            
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. Takım
              </label>
              <select
                value={selectedTeam2}
                onChange={(e) => setSelectedTeam2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Takım Seçin</option>
                {teams.map(team => (
                  <option key={team} value={team} disabled={team === selectedTeam1}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Karşılaştırma Sonuçları */}
        {comparisonData && selectedTeam1 && selectedTeam2 && (
          <div className="space-y-8">
            {/* Takım İsimleri */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {selectedTeam1} 🆚 {selectedTeam2}
              </h3>
            </div>
            
            {/* Genel İstatistikler Karşılaştırması */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                📊 Genel İstatistikler Karşılaştırması
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg table-fixed">
                  <colgroup>
                    <col className="w-1/3" />
                    <col className="w-1/3" />
                    <col className="w-1/3" />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-2 py-3 text-center font-medium text-blue-700">
                        <div className="truncate" title={comparisonData.team1.name}>
                          {comparisonData.team1.name}
                        </div>
                      </th>
                      <th className="border border-gray-300 px-2 py-3 text-center font-medium text-gray-700">
                        İstatistik
                      </th>
                      <th className="border border-gray-300 px-2 py-3 text-center font-medium text-purple-700">
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
                        <div key={index} className={`p-3 rounded-lg border-2 ${resultColor}`}>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              {match.date} - {match.group}
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
                  <p><strong>{comparisonData.team1.name}</strong> daha yüksek galibiyet oranına sahip (%{comparisonData.team1.winPercentage} vs %{comparisonData.team2.winPercentage})</p>
                ) : comparisonData.team2.winPercentage > comparisonData.team1.winPercentage ? (
                  <p><strong>{comparisonData.team2.name}</strong> daha yüksek galibiyet oranına sahip (%{comparisonData.team2.winPercentage} vs %{comparisonData.team1.winPercentage})</p>
                ) : (
                  <p>Her iki takım da aynı galibiyet oranına sahip (%{comparisonData.team1.winPercentage})</p>
                )}
                
                {comparisonData.team1.goalsFor > comparisonData.team2.goalsFor ? (
                  <p><strong>{comparisonData.team1.name}</strong> daha fazla gol atmış ({comparisonData.team1.goalsFor} vs {comparisonData.team2.goalsFor})</p>
                ) : comparisonData.team2.goalsFor > comparisonData.team1.goalsFor ? (
                  <p><strong>{comparisonData.team2.name}</strong> daha fazla gol atmış ({comparisonData.team2.goalsFor} vs {comparisonData.team1.goalsFor})</p>
                ) : (
                  <p>Her iki takım da aynı sayıda gol atmış ({comparisonData.team1.goalsFor})</p>
                )}

                {comparisonData.headToHead.totalMatches > 0 && (
                  <>
                    {comparisonData.headToHead.team1Wins > comparisonData.headToHead.team2Wins ? (
                      <p>Aralarındaki maçlarda <strong>{comparisonData.team1.name}</strong> üstün ({comparisonData.headToHead.team1Wins}-{comparisonData.headToHead.team2Wins})</p>
                    ) : comparisonData.headToHead.team2Wins > comparisonData.headToHead.team1Wins ? (
                      <p>Aralarındaki maçlarda <strong>{comparisonData.team2.name}</strong> üstün ({comparisonData.headToHead.team2Wins}-{comparisonData.headToHead.team1Wins})</p>
                    ) : (
                      <p>Aralarındaki maçlarda eşitlik var ({comparisonData.headToHead.team1Wins}-{comparisonData.headToHead.team2Wins})</p>
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