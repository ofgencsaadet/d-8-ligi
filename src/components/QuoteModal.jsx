import { useState, useEffect } from 'react'
import { getRandomQuote } from '../utils/quotes'

function QuoteModal({ isVisible, onClose }) {
  const [quote, setQuote] = useState(null)
  const [showCloseButton, setShowCloseButton] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Rastgele bir söz seç
      setQuote(getRandomQuote())
      
      // 1 saniye sonra çarpı butonunu göster
      const timer = setTimeout(() => {
        setShowCloseButton(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible || !quote) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 relative transform transition-all duration-300 scale-100">
        {/* Çarpı Butonu - 1 saniye sonra görünür */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10"
            aria-label="Kapat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Modal İçeriği */}
        <div className="p-8 text-center">
          {/* Futbol İkonu */}
          <div className="text-6xl mb-6 animate-bounce">
            ⚽
          </div>

          {/* Söz */}
          <blockquote className="text-lg md:text-xl text-gray-800 dark:text-gray-200 font-medium mb-4 leading-relaxed">
            "{quote.text}"
          </blockquote>

          {/* Yazar */}
          <cite className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-semibold">
            — {quote.author}
          </cite>

          {/* Alt Çizgi */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              D-8 Şampiyonlar Ligine Hoş Geldiniz! 🏆
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteModal 