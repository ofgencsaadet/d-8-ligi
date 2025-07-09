import { useState } from 'react'
import ShareModal from './ShareModal'

function StandingsTable({ groupName, teams, qualifiedTeams = new Set() }) {
  const [shareModalVisible, setShareModalVisible] = useState(false)

  const getPositionIcon = (position) => {
    return `${position}.`
  }

  const handleShare = () => {
    setShareModalVisible(true)
  }

  const handleCloseShareModal = () => {
    setShareModalVisible(false)
  }

  // ShareModal için data hazırla
  const shareData = {
    groupName,
    teams: teams.slice(0, 4), // İlk 4 takım
    date: new Date().toLocaleDateString('tr-TR')
  }

  // Çeyrek finale gidip gitmediğini kontrol et
  const isQualified = (teamName) => {
    return qualifiedTeams.has(teamName)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex-1 text-center">
            {groupName}
          </h3>
          <button
            onClick={handleShare}
            className="ml-3 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
          >
            <span>📤</span>
            <span>Paylaş</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-hover">
          <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">
                  Sıra
                </th>
                <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                  Takım
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  O
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  G
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  B
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  M
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  A
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Y
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  AV
                </th>
                <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  P
                </th>
              </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {teams.map((team, index) => {
              const qualified = isQualified(team.team)
              return (
                <tr key={team.team} className={`transition-colors ${
                  qualified 
                    ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 border-l-4 border-green-500 dark:border-green-400' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}>
                <td className="px-2 py-4 whitespace-nowrap text-sm w-10 text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getPositionIcon(index + 1)}
                  </span>
                </td>
                <td className="px-1 py-4 w-20">
                    <div className={`text-xs font-medium truncate ${
                      qualified ? 'text-green-700 dark:text-green-400 font-bold' : 'text-gray-900 dark:text-gray-100'
                    }`} title={team.team}>
                    {team.team}
                      {qualified && <span className="ml-1 text-green-600 dark:text-green-400 text-base">🏆</span>}
                  </div>
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {team.played}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 text-center font-medium">
                  {team.won}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400 text-center font-medium">
                  {team.drawn}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-center font-medium">
                  {team.lost}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {team.goalsFor}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                  {team.goalsAgainst}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-medium ${
                    team.goalDifference > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : team.goalDifference < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </span>
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200">
                    {team.points}
                  </span>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap gap-4 justify-center">
          <span><strong>O:</strong> Oynanan</span>
          <span><strong>G:</strong> Galibiyet</span>
          <span><strong>B:</strong> Beraberlik</span>
          <span><strong>M:</strong> Mağlubiyet</span>
          <span><strong>A:</strong> Atılan</span>
          <span><strong>Y:</strong> Yenilen</span>
          <span><strong>AV:</strong> Averaj</span>
          <span><strong>P:</strong> Puan</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-green-600 dark:text-green-400 font-medium">🏆 Çeyrek finale giden takımlar</span>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        type="standings"
        data={shareData}
        isVisible={shareModalVisible}
        onClose={handleCloseShareModal}
      />
    </div>
  )
}

export default StandingsTable 