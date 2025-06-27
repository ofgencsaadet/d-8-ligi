import { useState } from 'react'
import ShareModal from './ShareModal'

function StandingsTable({ groupName, teams }) {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
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
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                Sıra
              </th>
              <th className="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Takım
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                O
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                G
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                B
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                M
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                A
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Y
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                AV
              </th>
              <th className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                P
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {teams.map((team, index) => (
              <tr key={team.team} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-4 whitespace-nowrap text-sm w-10 text-center">
                  <span className="text-sm font-medium text-gray-700">
                    {getPositionIcon(index + 1)}
                  </span>
                </td>
                <td className="px-1 py-4 w-20">
                  <div className="text-xs font-medium text-gray-900 truncate" title={team.team}>
                    {team.team}
                  </div>
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {team.played}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-green-600 text-center font-medium">
                  {team.won}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-yellow-600 text-center font-medium">
                  {team.drawn}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-red-600 text-center font-medium">
                  {team.lost}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {team.goalsFor}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {team.goalsAgainst}
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`font-medium ${
                    team.goalDifference > 0 
                      ? 'text-green-600' 
                      : team.goalDifference < 0 
                        ? 'text-red-600' 
                        : 'text-gray-500'
                  }`}>
                    {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                  </span>
                </td>
                <td className="px-1 py-4 whitespace-nowrap text-center">
                  <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                    {team.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500">
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