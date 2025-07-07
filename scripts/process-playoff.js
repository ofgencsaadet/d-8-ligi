import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Kupa Yolu Excel dosyasını işle
async function processPlayoffExcel() {
  const inputPath = path.join(__dirname, '..', 'data', 'playoff-sonuclari.xlsx')
  
  // Excel dosyası var mı kontrol et
  if (!fs.existsSync(inputPath)) {
    console.log('⚠️ playoff-sonuclari.xlsx dosyası bulunamadı. Template oluşturuluyor...')
    const { createPlayoffTemplate } = await import('./create-playoff-template.js')
    createPlayoffTemplate()
    
    // Template'i playoff-sonuclari.xlsx olarak kopyala
    const templatePath = path.join(__dirname, '..', 'data', 'playoff-template.xlsx')
    fs.copyFileSync(templatePath, inputPath)
    console.log('✅ playoff-sonuclari.xlsx oluşturuldu. Lütfen maç sonuçlarını girin.')
    return
  }

  try {
    // Excel dosyasını oku
    const workbook = XLSX.readFile(inputPath)
    const worksheet = workbook.Sheets['Playoff']
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

    // Veriyi işle
    const playoff = {
      quarterFinals: [],
      semiFinals: [],
      final: null,
      thirdPlace: null,
      champion: null
    }

    // Veriyi satır satır işle - Excel formatı: her maç için 2 satır
    for (let i = 1; i < data.length; i += 3) { // Her 3 satırda bir maç (matchType, teams, boş satır)
      const matchTypeRow = data[i]
      const teamsRow = data[i + 1]
      
      if (!matchTypeRow || !teamsRow) continue
      
      const matchType = matchTypeRow[0]
      const team1 = teamsRow[0]
      const team2 = teamsRow[1]
      const score1 = teamsRow[3] // Skor 1
      const score2 = teamsRow[4] // Skor 2
      const date = teamsRow[5]   // Tarih
      const time = teamsRow[6]   // Saat
      const link = teamsRow[7]   // Link (H sütunu)
      
      if (!matchType || !team1 || !team2) {
        continue
      }

      // Excel tarihini düzelt
      let formattedDate = ''
      if (date && typeof date === 'number') {
        // Excel tarih numarasını JavaScript Date'e çevir (1900'den itibaren gün sayısı)
        const excelDate = new Date((date - 25569) * 86400 * 1000)
        formattedDate = excelDate.toLocaleDateString('tr-TR')
      } else if (date && typeof date === 'string') {
        formattedDate = date.trim()
      }

      // Excel saatini düzelt
      let formattedTime = ''
      if (time && typeof time === 'number') {
        // Excel saat formatı (0.875 = 21:00 gibi)
        const hours = Math.floor(time * 24)
        const minutes = Math.floor((time * 24 * 60) % 60)
        formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      } else if (time && typeof time === 'string') {
        formattedTime = time.trim()
      }

      const match = {
        matchType: matchType?.trim(),
        team1: team1?.trim(),
        team2: team2?.trim(),
        score1: score1 !== undefined && score1 !== '' ? parseInt(score1) : null,
        score2: score2 !== undefined && score2 !== '' ? parseInt(score2) : null,
        date: formattedDate,
        time: formattedTime,
        link: link && typeof link === 'string' ? link.trim() : null,
        played: score1 !== undefined && score1 !== '' && score2 !== undefined && score2 !== '',
        winner: null
      }

      // Galibi belirle
      if (match.played) {
        if (match.score1 > match.score2) {
          match.winner = match.team1
        } else if (match.score2 > match.score1) {
          match.winner = match.team2
        } else {
          match.winner = 'Beraberlik' // Penaltıyla belirlenebilir
        }
      }

      // Maç türüne göre kategorize et
      if (matchType.includes('Çeyrek Final')) {
        playoff.quarterFinals.push(match)
      } else if (matchType.includes('Yarı Final')) {
        playoff.semiFinals.push(match)
      } else if (matchType.includes('Final') && !matchType.includes('3. lük')) {
        playoff.final = match
        if (match.winner && match.winner !== 'Beraberlik') {
          playoff.champion = match.winner
        }
      } else if (matchType.includes('3. lük')) {
        playoff.thirdPlace = match
      }
    }

    // Çeyrek finalleri sırala
    playoff.quarterFinals.sort((a, b) => {
      const aNum = parseInt(a.matchType.match(/\d+/)[0])
      const bNum = parseInt(b.matchType.match(/\d+/)[0])
      return aNum - bNum
    })

    // Yarı finalleri sırala
    playoff.semiFinals.sort((a, b) => {
      const aNum = parseInt(a.matchType.match(/\d+/)[0])
      const bNum = parseInt(b.matchType.match(/\d+/)[0])
      return aNum - bNum
    })

    // Yarı finallerdeki takım isimlerini çeyrek final galiplere göre güncelle
    const qfWinners = playoff.quarterFinals.map(match => match.winner).filter(Boolean)
    
    if (playoff.semiFinals.length >= 2 && qfWinners.length >= 4) {
      // Yarı Final 1: QF1 Galibi vs QF2 Galibi
      if (playoff.semiFinals[0].team1 === 'QF1 Galibi') {
        playoff.semiFinals[0].team1 = qfWinners[0]
      }
      if (playoff.semiFinals[0].team2 === 'QF2 Galibi') {
        playoff.semiFinals[0].team2 = qfWinners[1]
      }
      
      // Yarı Final 2: QF3 Galibi vs QF4 Galibi
      if (playoff.semiFinals[1].team1 === 'QF3 Galibi') {
        playoff.semiFinals[1].team1 = qfWinners[2]
      }
      if (playoff.semiFinals[1].team2 === 'QF4 Galibi') {
        playoff.semiFinals[1].team2 = qfWinners[3]
      }
    }

    // Final ve 3. lük maçlarındaki takım isimlerini yarı final sonuçlarına göre güncelle
    const sfWinners = playoff.semiFinals.map(match => match.winner).filter(Boolean)
    const sfLosers = playoff.semiFinals.map(match => {
      if (match.played && match.winner && match.winner !== 'Beraberlik') {
        return match.winner === match.team1 ? match.team2 : match.team1
      }
      return null
    }).filter(Boolean)

    if (playoff.final && sfWinners.length >= 2) {
      if (playoff.final.team1 === 'YF1 Galibi') {
        playoff.final.team1 = sfWinners[0]
      }
      if (playoff.final.team2 === 'YF2 Galibi') {
        playoff.final.team2 = sfWinners[1]
      }
    }

    if (playoff.thirdPlace && sfLosers.length >= 2) {
      if (playoff.thirdPlace.team1 === 'YF1 Mağlubu') {
        playoff.thirdPlace.team1 = sfLosers[0]
      }
      if (playoff.thirdPlace.team2 === 'YF2 Mağlubu') {
        playoff.thirdPlace.team2 = sfLosers[1]
      }
    }

    // JSON dosyalarını oluştur
    const outputDir = path.join(__dirname, '..', 'public', 'data')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Playoff verilerini kaydet
    fs.writeFileSync(
      path.join(outputDir, 'playoff.json'),
      JSON.stringify(playoff, null, 2),
      'utf8'
    )

    console.log('✅ Kupa Yolu verileri işlendi:')
    console.log(`   - Çeyrek Final: ${playoff.quarterFinals.length} maç`)
    console.log(`   - Yarı Final: ${playoff.semiFinals.length} maç`)
    console.log(`   - Final: ${playoff.final ? '1 maç' : 'Henüz yok'}`)
    console.log(`   - 3. lük: ${playoff.thirdPlace ? '1 maç' : 'Henüz yok'}`)
    console.log(`   - Şampiyon: ${playoff.champion || 'Henüz yok'}`)

  } catch (error) {
    console.error('❌ Kupa Yolu Excel işleme hatası:', error.message)
  }
}

// Script çalıştır
processPlayoffExcel()

export { processPlayoffExcel }