import React, { useState, useEffect } from 'react'

function SocialMediaLinks() {
  const [isExpanded, setIsExpanded] = useState(true) // Başlangıçta açık

  const socialLinks = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/ofgencsaadett/',
      icon: 'Instagram.png',
      color: 'from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/gencsaadetof',
      icon: 'Facebook.png',
      color: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/ofgencsaadet',
      icon: 'X.png',
      color: 'from-gray-800 to-black hover:from-gray-900 hover:to-gray-900'
    }
  ]

  // Scroll event listener - sayfa hareket ettiğinde menüyü kapat
  useEffect(() => {
    const handleScroll = () => {
      if (isExpanded) {
        setIsExpanded(false)
      }
    }

    // Scroll event listener ekle
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup function - component unmount olduğunda listener'ı kaldır
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isExpanded])

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Desktop version - Her zaman görünür */}
      <div className="hidden md:flex fixed bottom-24 right-6 z-40 flex-col gap-2">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 dark:border-gray-800/20 bg-gradient-to-r ${link.color} text-white flex items-center justify-center`}
            title={`${link.name} hesabımızı takip edin`}
          >
            <img 
              src={`${import.meta.env.BASE_URL}${link.icon}`}
              alt={`${link.name} icon`}
              className="w-5 h-5 object-contain"
            />
          </a>
        ))}
      </div>

      {/* Mobile version - Expandable */}
      <div className="md:hidden fixed bottom-24 right-6 z-40 flex flex-col-reverse gap-2">
        {/* Toggle Button - Her zaman görünür, ok yönü değişir */}
        <button
          onClick={toggleExpanded}
          className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 dark:border-gray-800/20 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white flex items-center justify-center"
          title="Sosyal medya hesaplarımız"
        >
          <span className="text-lg transition-transform duration-300">
            {isExpanded ? '＞' : '＜'}
          </span>
        </button>

        {/* Expandable Social Links - Sağdan kayarak açılır */}
        <div className={`flex flex-col-reverse gap-2 transition-all duration-300 transform ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-2 border-white/20 dark:border-gray-800/20 bg-gradient-to-r ${link.color} text-white flex items-center justify-center`}
              title={`${link.name} hesabımızı takip edin`}
              style={{ 
                transitionDelay: isExpanded ? `${index * 100}ms` : '0ms'
              }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}${link.icon}`}
                alt={`${link.name} icon`}
                className="w-5 h-5 object-contain"
              />
            </a>
          ))}
        </div>
      </div>
    </>
  )
}

export default SocialMediaLinks 