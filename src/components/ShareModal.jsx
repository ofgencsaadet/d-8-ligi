import { useState, useRef, useEffect } from 'react'
import { getRandomQuote } from '../utils/quotes'

function ShareModal({ match, type = 'match', data, isVisible, onClose }) {
  const [cardGenerated, setCardGenerated] = useState(false)
  const [shareText, setShareText] = useState('')
  const canvasRef = useRef(null)

  useEffect(() => {
    if (isVisible && (match || data)) {
      // Modal her açıldığında state'i resetle
      setCardGenerated(false)
      generateShareText()
      if (type === 'match') {
        generateMatchCard()
      } else if (type === 'standings') {
        generateStandingsCard()
      }
    }
  }, [isVisible, match, data, type])

  // ESC tuşu ile modal kapatma
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isVisible) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isVisible, onClose])

  const generateShareText = () => {
    let text = ''
    
    if (type === 'match' && match) {
      text = `🏆 D-8 ŞAMPİYONLAR LİGİ MAÇ SONUCU 🏆
⚽ ${match.team1} ${match.score1}-${match.score2} ${match.team2}
📅 ${match.date} | ${match.group}
🔗 https://ofgencsaadet.github.io/d-8-ligi`
    } else if (type === 'standings' && data) {
      text = `🏆 D-8 ŞAMPİYONLAR LİGİ PUAN DURUMU 🏆
📊 ${data.groupName}
🥇 1. ${data.teams[0]?.team} - ${data.teams[0]?.points} puan
🥈 2. ${data.teams[1]?.team} - ${data.teams[1]?.points} puan
🥉 3. ${data.teams[2]?.team} - ${data.teams[2]?.points} puan
📅 ${data.date}
🔗 https://ofgencsaadet.github.io/d-8-ligi`
    }
    
    setShareText(text)
  }

  const generateMatchCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = 1080
    canvas.height = 1920
    
    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Arka plan gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1080, 1920)

    // Beyaz kart alanını dinamik boyutla çizeceğiz - içerik çizildikten sonra

    const centerX = 540  // Dikey tasarım merkezi

    const drawCardContent = () => {
      
      // Başlık
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 64px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🏆 D-8 ŞAMPİYONLAR LİGİ', centerX, 400)

      // Maç sonucu iki satırda - çizgileri hizalı
      ctx.fillStyle = '#333333'
      ctx.font = 'bold 56px Arial'
      ctx.textAlign = 'center'
      
      // Takım isimlerini kelime bazında böl ve çok uzunsa alt satıra geç
      const wrapText = (text, maxWidth) => {
        const words = text.split(' ')
        if (words.length === 1) return [text] // Tek kelime ise olduğu gibi döndür
        
        let lines = []
        let currentLine = words[0]
        
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i]
          const metrics = ctx.measureText(testLine)
          
          if (metrics.width > maxWidth && currentLine !== '') {
            lines.push(currentLine)
            currentLine = words[i]
          } else {
            currentLine = testLine
          }
        }
        lines.push(currentLine)
        return lines
      }
      
      // Takım isimlerini sarmayla
      const maxTeamWidth = 400 // Max genişlik
      const team1Lines = wrapText(match.team1, maxTeamWidth)
      const team2Lines = wrapText(match.team2, maxTeamWidth)
      
      // En fazla satır sayısını bul
      const maxLines = Math.max(team1Lines.length, team2Lines.length)
      const startY = 600 // Başlangıç Y pozisyonu
      const lineHeight = 60 // Satır aralığı
      
      // Takım 1'i çiz (sağa hizalı)
      ctx.textAlign = 'right'
      team1Lines.forEach((line, index) => {
        const yPos = startY + (index * lineHeight)
        ctx.fillText(line, centerX - 30, yPos)
      })
      
      // Çizgiyi ortala (en uzun takım ismine göre)
      const dashY = startY + ((maxLines - 1) * lineHeight / 2)
      ctx.textAlign = 'center'
      ctx.fillText('-', centerX, dashY)
      
      // Takım 2'yi çiz (sola hizalı)  
      ctx.textAlign = 'left'
      team2Lines.forEach((line, index) => {
        const yPos = startY + (index * lineHeight)
        ctx.fillText(line, centerX + 30, yPos)
      })
      
      // İkinci satır: Skor (çizgiyi aynı X koordinatında)
      const scoreY = startY + (maxLines * lineHeight) + 80 // Takım isimlerinden sonra
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 120px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(match.score1, centerX - 30, scoreY)  // Sol skor
      
      ctx.textAlign = 'center'
      ctx.fillText('-', centerX, scoreY)  // Çizgi (aynı X)
      
      ctx.textAlign = 'left'
      ctx.fillText(match.score2, centerX + 30, scoreY)  // Sağ skor

      // Grup ve tarih (yer değişti, alt alta)
      ctx.fillStyle = '#666666'
      ctx.font = '42px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${match.group}`, centerX, scoreY + 120)
      ctx.fillText(`📅 ${match.date}`, centerX, scoreY + 180)

      // Website
      ctx.fillStyle = '#667eea'
      ctx.font = '36px Arial'
      ctx.fillText('ofgencsaadet.github.io/d-8-ligi', centerX, scoreY + 260)

      // Rastgele söz ekle
      const randomQuote = getRandomQuote()
      const quoteY = scoreY + 340
      
      // Söz metni (italic)
      ctx.fillStyle = '#555555'
      ctx.font = 'italic 28px Arial'
      ctx.textAlign = 'center'
      
      // Sözü satırlara böl (maksimum genişlik)
      const maxQuoteWidth = 800
      const words = randomQuote.text.split(' ')
      let lines = []
      let currentLine = words[0]
      
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i]
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxQuoteWidth && currentLine !== '') {
          lines.push(currentLine)
          currentLine = words[i]
        } else {
          currentLine = testLine
        }
      }
      lines.push(currentLine)
      
      // Söz satırlarını çiz (tırnak işaretleri sadece başta ve sonda)
      lines.forEach((line, index) => {
        let displayLine = line
        if (index === 0) displayLine = `"${line}` // İlk satıra başlangıç tırnağı
        if (index === lines.length - 1) displayLine = `${displayLine}"` // Son satıra bitiş tırnağı
        
        ctx.fillText(displayLine, centerX, quoteY + (index * 35))
      })
      
      // Söz yazarı
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 24px Arial'
      const authorY = quoteY + (lines.length * 35) + 40
      ctx.fillText(`- ${randomQuote.author}`, centerX, authorY)
      
      // Logo'yu söz yazarından sonra koy (dinamik pozisyon)
      return authorY // Söz yazarının Y pozisyonunu döndür
    }

    // Logo yükle ve çiz
    const logo = new Image()
    logo.crossOrigin = 'anonymous' // CORS sorunlarını önle
    
    logo.onload = () => {
      try {
        // Önce içeriği çiz ve son Y pozisyonunu al
        const lastContentY = drawCardContent()
        
        // Logo'yu söz yazarından sonra koy (dinamik pozisyon)
        const logoSize = 80
        const logoX = centerX - (logoSize / 2)  // Tam ortada
        const logoY = lastContentY + 60  // Söz yazarından 60px sonra
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
        
        // "Genç Saadet Of" yazısını logo'nun altına koy
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        const gencSaadetY = logoY + logoSize + 40
        ctx.fillText('Genç Saadet Of', centerX, gencSaadetY)
        
        // Şimdi beyaz kart alanını çiz - tüm içeriği kapsayacak şekilde
        const cardStartY = 200
        const cardEndY = gencSaadetY + 40  // Son yazıdan 40px sonra
        const cardHeight = cardEndY - cardStartY
        
        // Arka planı tekrar çiz
        const gradient = ctx.createLinearGradient(0, 0, 1080, 1920)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 1080, 1920)
        
        // Beyaz kart alanını dinamik boyutla çiz
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.roundRect = function(x, y, w, h, r) {
          this.beginPath()
          this.moveTo(x + r, y)
          this.lineTo(x + w - r, y)
          this.quadraticCurveTo(x + w, y, x + w, y + r)
          this.lineTo(x + w, y + h - r)
          this.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
          this.lineTo(x + r, y + h)
          this.quadraticCurveTo(x, y + h, x, y + h - r)
          this.lineTo(x, y + r)
          this.quadraticCurveTo(x, y, x + r, y)
          this.closePath()
          return this
        }
        ctx.roundRect(80, cardStartY, 920, cardHeight, 30).fill()
        
        // İçeriği tekrar çiz
        drawCardContent()
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Genç Saadet Of', centerX, gencSaadetY)
        
        // Logo çizildikten sonra kart hazır
        setCardGenerated(true)
      } catch (error) {
        console.error('Logo çizim hatası:', error)
        // Hata varsa sadece içeriği çiz
        drawCardContent()
        setCardGenerated(true)
      }
    }
    
    logo.onerror = (error) => {
      console.error('Logo yükleme hatası:', error)
      // Logo yüklenemezse sadece içeriği çiz
      const lastContentY = drawCardContent()
      
      // Logo olmadan da "Genç Saadet Of" yazısını ekle
      const gencSaadetY = lastContentY + 80
      
      // Beyaz kart alanını dinamik boyutla çiz
      const cardStartY = 200
      const cardEndY = gencSaadetY + 40
      const cardHeight = cardEndY - cardStartY
      
      // Arka planı tekrar çiz
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1920)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 1080, 1920)
      
      // Beyaz kart alanını çiz
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
      ctx.roundRect = function(x, y, w, h, r) {
        this.beginPath()
        this.moveTo(x + r, y)
        this.lineTo(x + w - r, y)
        this.quadraticCurveTo(x + w, y, x + w, y + r)
        this.lineTo(x + w, y + h - r)
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        this.lineTo(x + r, y + h)
        this.quadraticCurveTo(x, y + h, x, y + h - r)
        this.lineTo(x, y + r)
        this.quadraticCurveTo(x, y, x + r, y)
        this.closePath()
        return this
      }
      ctx.roundRect(80, cardStartY, 920, cardHeight, 30).fill()
      
      // İçeriği tekrar çiz
      drawCardContent()
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Genç Saadet Of', centerX, gencSaadetY)
      
      setCardGenerated(true)
    }
    
    // Logo'yu yükle - Vite base path ile uyumlu
    const logoPath = import.meta.env.BASE_URL + 'logo.png'
    logo.src = logoPath + '?' + new Date().getTime() // Cache busting
  }

  const generateStandingsCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    // 1600x1200 çözünürlük (daha uzun)
    const canvasWidth = 1600
    const canvasHeight = 1125
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    
    // Görüntü boyutları (CSS boyutları) - yeni oran 4:3
    canvas.style.width = '640px'
    canvas.style.height = '480px'
    
    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    // Beyaz arka plan
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    const centerX = canvasWidth / 2

    const drawCardContent = () => {
      // Başlık - D-8 Şampiyonlar Ligi
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 64px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('🏆 D-8 ŞAMPİYONLAR LİGİ', centerX, 100)

      // Ana tablo başlangıcı
      let tableStartY = 160
      
      // Grup header (mavi arka plan)
      const headerHeight = 80
      const tableWidth = 800 // Maksimum kompakt tablo
      const tableX = (canvasWidth - tableWidth) / 2
      
      // Mavi header arka planı
      const headerGradient = ctx.createLinearGradient(tableX, tableStartY, tableX + tableWidth, tableStartY)
      headerGradient.addColorStop(0, '#3B82F6')
      headerGradient.addColorStop(1, '#2563EB')
      ctx.fillStyle = headerGradient
      ctx.roundRect = function(x, y, w, h, r) {
        this.beginPath()
        this.moveTo(x + r, y)
        this.lineTo(x + w - r, y)
        this.quadraticCurveTo(x + w, y, x + w, y + r)
        this.lineTo(x + w, y + h - r)
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
        this.lineTo(x + r, y + h)
        this.quadraticCurveTo(x, y + h, x, y + h - r)
        this.lineTo(x, y + r)
        this.quadraticCurveTo(x, y, x + r, y)
        this.closePath()
        return this
      }
      ctx.roundRect(tableX, tableStartY, tableWidth, headerHeight, 8).fill()
      
      // Grup adı (beyaz yazı)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 42px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(data.groupName, centerX, tableStartY + 52)

      // Tablo header satırı (gri arka plan)
      const headerRowY = tableStartY + headerHeight
      const headerRowHeight = 60
      ctx.fillStyle = '#F9FAFB'
      ctx.fillRect(tableX, headerRowY, tableWidth, headerRowHeight)

      // Header yazıları
      ctx.fillStyle = '#6B7280'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      
      // Sütun genişlikleri (800px toplam) - Sıra-Takım arası açıldı
      const colWidths = [60, 245, 55, 55, 55, 55, 50, 50, 80, 50] // Sıra, Takım, O, G, B, M, A, Y, AV, P
      let currentX = tableX
      const headers = ['SIRA', 'TAKIM', 'O', 'G', 'B', 'M', 'A', 'Y', 'AV', 'P']
      
      headers.forEach((header, index) => {
        if (index === 1) { // TAKIM sütunu
          ctx.textAlign = 'left'
          ctx.fillText(header, currentX + 15, headerRowY + 40)
          ctx.textAlign = 'center' // Diğerleri için geri center yap
        } else {
          ctx.fillText(header, currentX + colWidths[index]/2, headerRowY + 40)
        }
        currentX += colWidths[index]
      })

      // Takım satırları - tüm takımları göster (en fazla 4)
      let currentRowY = headerRowY + headerRowHeight
      const rowHeight = 90
      
      // Tüm takımları göster (4 takıma kadar)
      const teamsToShow = data.teams.slice(0, 4)
      teamsToShow.forEach((team, index) => {
        // Satır arka planı (alternating colors)
        if (index % 2 === 0) {
          ctx.fillStyle = '#FFFFFF'
        } else {
          ctx.fillStyle = '#F9FAFB'
        }
        ctx.fillRect(tableX, currentRowY, tableWidth, rowHeight)
        
        // Satır border
        ctx.strokeStyle = '#E5E7EB'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(tableX, currentRowY + rowHeight)
        ctx.lineTo(tableX + tableWidth, currentRowY + rowHeight)
        ctx.stroke()

        currentX = tableX
        
        // Sıra numarası
        ctx.fillStyle = '#374151'
        ctx.font = 'bold 28px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`${index + 1}.`, currentX + colWidths[0]/2, currentRowY + 50)
        currentX += colWidths[0]
        
        // Takım adı (sol hizalı)
        ctx.fillStyle = '#111827'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'left'
        const teamName = team.team.length > 20 ? team.team.substring(0, 20) + '...' : team.team
        ctx.fillText(teamName, currentX + 15, currentRowY + 50)
        currentX += colWidths[1]
        
        // Oynanan
        ctx.fillStyle = '#6B7280'
        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(team.played.toString(), currentX + colWidths[2]/2, currentRowY + 50)
        currentX += colWidths[2]
        
        // Galibiyet (yeşil)
        ctx.fillStyle = '#10B981'
        ctx.font = 'bold 24px Arial'
        ctx.fillText(team.won.toString(), currentX + colWidths[3]/2, currentRowY + 50)
        currentX += colWidths[3]
        
        // Beraberlik (sarı)
        ctx.fillStyle = '#F59E0B'
        ctx.font = 'bold 24px Arial'
        ctx.fillText(team.drawn.toString(), currentX + colWidths[4]/2, currentRowY + 50)
        currentX += colWidths[4]
        
        // Mağlubiyet (kırmızı)
        ctx.fillStyle = '#EF4444'
        ctx.font = 'bold 24px Arial'
        ctx.fillText(team.lost.toString(), currentX + colWidths[5]/2, currentRowY + 50)
        currentX += colWidths[5]
        
        // Atılan gol
        ctx.fillStyle = '#6B7280'
        ctx.font = '24px Arial'
        ctx.fillText(team.goalsFor.toString(), currentX + colWidths[6]/2, currentRowY + 50)
        currentX += colWidths[6]
        
        // Yenilen gol
        ctx.fillText(team.goalsAgainst.toString(), currentX + colWidths[7]/2, currentRowY + 50)
        currentX += colWidths[7]
        
        // Averaj (renkli)
        const goalDiff = team.goalDifference
        if (goalDiff > 0) {
          ctx.fillStyle = '#10B981'
          ctx.fillText(`+${goalDiff}`, currentX + colWidths[8]/2, currentRowY + 50)
        } else if (goalDiff < 0) {
          ctx.fillStyle = '#EF4444'
          ctx.fillText(goalDiff.toString(), currentX + colWidths[8]/2, currentRowY + 50)
        } else {
          ctx.fillStyle = '#6B7280'
          ctx.fillText('0', currentX + colWidths[8]/2, currentRowY + 50)
        }
        currentX += colWidths[8]
        
        // Puan (mavi arka plan)
        const pointsX = currentX + 5
        const pointsY = currentRowY + 20
        const pointsWidth = colWidths[9] - 10
        const pointsHeight = 50
        
        ctx.fillStyle = '#DBEAFE'
        ctx.roundRect(pointsX, pointsY, pointsWidth, pointsHeight, 20).fill()
        
        ctx.fillStyle = '#1D4ED8'
        ctx.font = 'bold 28px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(team.points.toString(), pointsX + pointsWidth/2, pointsY + 35)
        
        currentRowY += rowHeight
      })

      // Legend (açıklamalar)
      const legendY = currentRowY + 30
      ctx.fillStyle = '#F9FAFB'
      ctx.fillRect(tableX, legendY, tableWidth, 50)
      
      ctx.fillStyle = '#6B7280'
      ctx.font = '18px Arial'
      ctx.textAlign = 'center'
      const legendText = 'O: Oynanan  G: Galibiyet  B: Beraberlik  M: Mağlubiyet  A: Atılan  Y: Yenilen  AV: Averaj  P: Puan'
      ctx.fillText(legendText, centerX, legendY + 32)

      // Website
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('ofgencsaadet.github.io/d-8-ligi', centerX, legendY + 80)

      // Rastgele söz
      const randomQuote = getRandomQuote()
      const quoteY = legendY + 130
      
      ctx.fillStyle = '#555555'
      ctx.font = 'italic 20px Arial'
      ctx.textAlign = 'center'
      
      // Sözü satırlara böl
      const maxQuoteWidth = 800
      const words = randomQuote.text.split(' ')
      let lines = []
      let currentLine = words[0]
      
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i]
        const metrics = ctx.measureText(testLine)
        
        if (metrics.width > maxQuoteWidth && currentLine !== '') {
          lines.push(currentLine)
          currentLine = words[i]
        } else {
          currentLine = testLine
        }
      }
      lines.push(currentLine)
      
      // Söz satırlarını çiz
      lines.forEach((line, index) => {
        let displayLine = line
        if (index === 0) displayLine = `"${line}`
        if (index === lines.length - 1) displayLine = `${displayLine}"`
        
        ctx.fillText(displayLine, centerX, quoteY + (index * 28))
      })
      
      // Söz yazarı
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 18px Arial'
      const authorY = quoteY + (lines.length * 28) + 30
      ctx.fillText(`- ${randomQuote.author}`, centerX, authorY)
      
      return authorY + 20
    }

    // Logo yükle ve çiz
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    
    logo.onload = () => {
      try {
        const lastContentY = drawCardContent()
        
        // Logo
        const logoSize = 80
        const logoX = centerX - (logoSize / 2)
        const logoY = lastContentY + 40
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
        
        // "Genç Saadet Of" yazısı
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        const gencSaadetY = logoY + logoSize + 45
        ctx.fillText('Genç Saadet Of', centerX, gencSaadetY)
        
        setCardGenerated(true)
      } catch (error) {
        console.error('Logo çizim hatası:', error)
        const lastContentY = drawCardContent()
        
        // Logo yüklenemezse sadece "Genç Saadet Of" yazısı
        ctx.fillStyle = '#667eea'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        const gencSaadetY = lastContentY + 60
        ctx.fillText('Genç Saadet Of', centerX, gencSaadetY)
        
        setCardGenerated(true)
      }
    }
    
    logo.onerror = (error) => {
      console.error('Logo yükleme hatası:', error)
      const lastContentY = drawCardContent()
      
      // Logo yüklenemezse sadece "Genç Saadet Of" yazısı
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      const gencSaadetY = lastContentY + 60
      ctx.fillText('Genç Saadet Of', centerX, gencSaadetY)
      
      setCardGenerated(true)
    }
    
    const logoPath = import.meta.env.BASE_URL + 'logo.png'
    logo.src = logoPath + '?' + new Date().getTime()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      alert('📋 Metin kopyalandı!')
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = shareText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('📋 Metin kopyalandı!')
    }
  }

  const downloadCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    
    let filename = 'd8-ligi-'
    if (type === 'match' && match) {
      filename += `${match.team1}-vs-${match.team2}.png`
    } else if (type === 'standings' && data) {
      filename += `puan-durumu-${data.groupName.replace(/\s+/g, '-')}.png`
    } else {
      filename += 'paylaşım.png'
    }
    
    link.download = filename
    link.href = canvas.toDataURL()
    link.click()
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        // Canvas'ı blob'a çevir
        const canvas = canvasRef.current
        if (canvas) {
          canvas.toBlob(async (blob) => {
            const file = new File([blob], 'd8-ligi-mac-sonucu.png', { type: 'image/png' })
            
            try {
              await navigator.share({
                title: 'D-8 Ligi Maç Sonucu',
                text: shareText,
                files: [file],
                url: 'https://ofgencsaadet.github.io/d-8-ligi'
              })
            } catch (err) {
              // Dosya paylaşımı desteklenmiyorsa sadece metin paylaş
              await navigator.share({
                title: 'D-8 Ligi Maç Sonucu',
                text: shareText,
                url: 'https://ofgencsaadet.github.io/d-8-ligi'
              })
            }
          })
        }
      } catch (err) {
        console.log('Paylaşım iptal edildi')
      }
    } else {
      // Fallback - metni kopyala
      copyToClipboard()
    }
  }

  

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - Fixed Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-xl z-10 transition-colors"
        >
          ×
        </button>

        {/* Header */}
        <div className="p-6 border-b pr-12">
          <h3 className="text-xl font-bold text-gray-800">
            {type === 'match' ? '📤 Sonucu Paylaş' : '📊 Puan Tablosunu Paylaş'}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bilgi Kutusu */}
          <div className="text-center bg-gray-50 rounded-lg p-4">
            {type === 'match' && match ? (
              <>
                <div className="text-lg font-semibold text-gray-800">
                  {match.team1} {match.score1}-{match.score2} {match.team2}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  📅 {match.date} | {match.group}
                </div>
              </>
            ) : type === 'standings' && data ? (
              <>
                <div className="text-lg font-semibold text-gray-800">
                  📊 {data.groupName}
                </div>
                <div className="text-sm text-gray-600 mt-2 space-y-1">
                  <div>🥇 {data.teams[0]?.team} - {data.teams[0]?.points} puan</div>
                  <div>🥈 {data.teams[1]?.team} - {data.teams[1]?.points} puan</div>
                  <div>🥉 {data.teams[2]?.team} - {data.teams[2]?.points} puan</div>
                  <div>4️⃣ {data.teams[3]?.team} - {data.teams[3]?.points} puan</div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  📅 {data.date}
                </div>
              </>
            ) : null}
          </div>

          {/* Canvas (gizli) */}
          <canvas
            ref={canvasRef}
            className="hidden"
            width="1080"
            height="1920"
          />

          {/* Önizleme */}
          {cardGenerated && (
            <div className="text-center">
              <h4 className="font-semibold text-gray-700 mb-3">🖼️ Paylaşım Kartı Önizlemesi</h4>
              <div className="bg-gray-100 rounded-lg p-4 inline-block">
                {type === 'match' ? (
                  <canvas
                    width="270"
                    height="480"
                    className="border rounded"
                    ref={(previewCanvas) => {
                      if (previewCanvas && canvasRef.current) {
                        const previewCtx = previewCanvas.getContext('2d')
                        previewCtx.drawImage(canvasRef.current, 0, 0, 270, 480)
                      }
                    }}
                  />
                ) : (
                  <canvas
                    width="480"
                    height="360"
                    className="border rounded"
                    ref={(previewCanvas) => {
                      if (previewCanvas && canvasRef.current) {
                        const previewCtx = previewCanvas.getContext('2d')
                        previewCtx.drawImage(canvasRef.current, 0, 0, 480, 360)
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Kartı İndir Butonu */}
          <div className="flex justify-center">
            <button
              onClick={downloadCard}
              className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <span>🖼️</span>
              <span>Kartı İndir</span>
            </button>
          </div>

          {/* Metin Önizlemesi */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2">📝 Paylaşım Metni</h4>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap mb-3">{shareText}</pre>
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
            >
              <span>📋</span>
              <span>Metni Kopyala</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal 