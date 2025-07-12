import { useState, useEffect, useRef } from 'react'

function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // Ses dosyasını yükle
    const basePath = import.meta.env.PROD ? '/d-8-ligi' : ''
    const audio = new Audio(`${basePath}/UEFA-music.mp3`)
    
    // Ses dosyası ayarları
    audio.loop = false // Tekrar etmesin - yankı önlemi
    audio.volume = 1.0 // Ses seviyesi %100
    audioRef.current = audio

    // Ses olaylarını dinle
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('ended', () => setIsPlaying(false))
    
    // Sayfa yüklendiğinde müziği hemen başlat
    const startMusic = async () => {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch (error) {
        console.log('Müzik otomatik çalamadı - kullanıcı etkileşimi gerekli:', error)
        // Kullanıcı etkileşimi sonrası müziği başlat
        startMusicOnUserInteraction()
      }
    }

    // Kullanıcı etkileşimi sonrası müzik başlat
    const startMusicOnUserInteraction = () => {
      const startOnClick = async () => {
        try {
          await audio.play()
          setIsPlaying(true)
          // Event listener'ı kaldır
          document.removeEventListener('click', startOnClick)
          document.removeEventListener('keydown', startOnClick)
          document.removeEventListener('touchstart', startOnClick)
        } catch (error) {
          console.log('Kullanıcı etkileşimi ile de müzik çalamadı:', error)
        }
      }

      // Herhangi bir kullanıcı etkileşimini dinle
      document.addEventListener('click', startOnClick, { once: true })
      document.addEventListener('keydown', startOnClick, { once: true })
      document.addEventListener('touchstart', startOnClick, { once: true })
    }

    // Hiç beklemeden müziği başlat
    startMusic()

    return () => {
      audio.pause()
      audio.removeEventListener('play', () => setIsPlaying(true))
      audio.removeEventListener('pause', () => setIsPlaying(false))
      audio.removeEventListener('ended', () => setIsPlaying(false))
      // Event listener'ları temizle
      document.removeEventListener('click', () => {})
      document.removeEventListener('keydown', () => {})
      document.removeEventListener('touchstart', () => {})
    }
  }, [])

  // Müziği çal/durdur
  const toggleMusic = async () => {
    if (!audioRef.current) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.currentTime = 0 // Baştan başlat
        await audioRef.current.play()
      }
    } catch (error) {
      console.error('Müzik çalma/durdurma hatası:', error)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={toggleMusic}
        className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 dark:border-gray-800/20 ${
          isPlaying
            ? 'bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-800 dark:to-gray-900 hover:from-blue-700 hover:to-blue-900'
            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
        } text-white flex items-center justify-center`}
        title={isPlaying ? 'Müziği Durdur' : 'Müziği Çal'}
      >
            <span className="text-xl">
        {isPlaying ? '⏸️' : '▶️'}
      </span>
      </button>
      

    </div>
  )
}

export default MusicToggle 