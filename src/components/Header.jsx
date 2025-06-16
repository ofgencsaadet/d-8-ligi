function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="relative">
          {/* Logo - Sol tarafta */}
          <div className="absolute left-0 top-0 hidden md:block">
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="D-8 Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          
          {/* Başlık - Ortada */}
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">
              ⚽ D-8 Futbol Turnuvası
            </h1>
            <p className="text-lg md:text-2xl text-blue-100">
              3 Grup • 12 Takım • Büyük Rekabet
            </p>
          </div>
          
          {/* Mobilde logo - Ortada */}
          <div className="flex justify-center mb-4 md:hidden">
            <div className="bg-white rounded-lg p-2 shadow-lg">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`}
                alt="D-8 Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
          
          {/* Alt Bilgi */}
          <div className="mt-4 pt-4 border-t border-blue-500/30 text-center">
            <p className="text-blue-200 text-sm md:text-base">
              🏆 Saadet Partisi Of İlçe Gençlik Kolları
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 