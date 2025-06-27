import { useState, useRef, useEffect } from 'react'
import { getRandomQuote } from '../utils/quotes'

function ShareModal({ match, isVisible, onClose }) {
  const [cardGenerated, setCardGenerated] = useState(false)
  const [shareText, setShareText] = useState('')
  const canvasRef = useRef(null)

  useEffect(() => {
    if (isVisible && match) {
      // Modal her açıldığında state'i resetle
      setCardGenerated(false)
      generateShareText()
      generateMatchCard()
    }
  }, [isVisible, match])

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
    const text = `🏆 D-8 ŞAMPİYONLAR LİGİ MAÇ SONUCU 🏆
⚽ ${match.team1} ${match.score1}-${match.score2} ${match.team2}
📅 ${match.date} | ${match.group}
🔗 https://ofgencsaadet.github.io/d-8-ligi`
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

    // Beyaz kart alanı
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
    ctx.roundRect(80, 200, 920, 1200, 30).fill()

    const centerX = 540  // Dikey tasarım merkezi

    const drawCardContent = () => {
      // Logo pozisyonu (beyaz alan içinde)
      const logoSize = 80
      const logoX = centerX - (logoSize / 2)  // Tam ortada
      const logoY = 1250  // Beyaz alan içinde
      
      // Logo'nun altına "Genç Saadet Of" yazısı (ortalı)
      ctx.fillStyle = '#667eea'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Genç Saadet Of', centerX, logoY + logoSize + 40)
      
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
      ctx.fillText(`🏟️ ${match.group}`, centerX, scoreY + 120)
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
      ctx.fillText(`- ${randomQuote.author}`, centerX, quoteY + (lines.length * 35) + 40)

      setCardGenerated(true)
    }

    // Logo yükle ve çiz
    const logo = new Image()
    logo.crossOrigin = 'anonymous' // CORS sorunlarını önle
    
    logo.onload = () => {
      try {
        // Önce içeriği çiz
        drawCardContent()
        
        // Sonra logo'yu üzerine çiz (beyaz alan içinde)
        const logoSize = 80
        const logoX = centerX - (logoSize / 2)  // Tam ortada
        const logoY = 1250  // Beyaz alan içinde
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)
      } catch (error) {
        console.error('Logo çizim hatası:', error)
        // Hata varsa sadece içeriği çiz
        drawCardContent()
      }
    }
    
    logo.onerror = (error) => {
      console.error('Logo yükleme hatası:', error)
      // Logo yüklenemezse sadece içeriği çiz
      drawCardContent()
    }
    
    // Logo'yu yükle
    logo.src = '/logo.png?' + new Date().getTime() // Cache busting
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
    link.download = `d8-ligi-${match.team1}-vs-${match.team2}.png`
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
          <h3 className="text-xl font-bold text-gray-800">📤 Sonucu Paylaş</h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Maç Bilgisi */}
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <div className="text-lg font-semibold text-gray-800">
              {match.team1} {match.score1}-{match.score2} {match.team2}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              📅 {match.date} | {match.group}
            </div>
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