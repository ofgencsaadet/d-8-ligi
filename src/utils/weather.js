// Trabzon/Of hava durumu API'si - WeatherAPI.com
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '398a8f427c82486a945202807252006'
const BASE_URL = 'https://api.weatherapi.com/v1'

// Trabzon/Of koordinatları (gerçek koordinatlar)
const OF_TRABZON_COORDS = {
  lat: 40.944864,
  lon: 40.265203
}



// WeatherAPI.com hava durumu kodları ve ikonları
const weatherIcons = {
  1000: '☀️', // Sunny/Clear
  1003: '⛅', // Partly cloudy
  1006: '☁️', // Cloudy
  1009: '☁️', // Overcast
  1030: '🌫️', // Mist
  1063: '🌦️', // Patchy rain possible
  1066: '🌨️', // Patchy snow possible
  1069: '🌨️', // Patchy sleet possible
  1072: '🌨️', // Patchy freezing drizzle possible
  1087: '⛈️', // Thundery outbreaks possible
  1114: '❄️', // Blowing snow
  1117: '❄️', // Blizzard
  1135: '🌫️', // Fog
  1147: '🌫️', // Freezing fog
  1150: '🌦️', // Patchy light drizzle
  1153: '🌦️', // Light drizzle
  1168: '🌨️', // Freezing drizzle
  1171: '🌨️', // Heavy freezing drizzle
  1180: '🌦️', // Patchy light rain
  1183: '🌧️', // Light rain
  1186: '🌦️', // Moderate rain at times
  1189: '🌧️', // Moderate rain
  1192: '🌧️', // Heavy rain at times
  1195: '🌧️', // Heavy rain
  1198: '🌨️', // Light freezing rain
  1201: '🌨️', // Moderate or heavy freezing rain
  1204: '🌨️', // Light sleet
  1207: '🌨️', // Moderate or heavy sleet
  1210: '❄️', // Patchy light snow
  1213: '❄️', // Light snow
  1216: '❄️', // Patchy moderate snow
  1219: '❄️', // Moderate snow
  1222: '❄️', // Patchy heavy snow
  1225: '❄️', // Heavy snow
  1237: '❄️', // Ice pellets
  1240: '🌦️', // Light rain shower
  1243: '🌧️', // Moderate or heavy rain shower
  1246: '🌧️', // Torrential rain shower
  1249: '🌨️', // Light sleet showers
  1252: '🌨️', // Moderate or heavy sleet showers
  1255: '❄️', // Light snow showers
  1258: '❄️', // Moderate or heavy snow showers
  1261: '❄️', // Light showers of ice pellets
  1264: '❄️', // Moderate or heavy showers of ice pellets
  1273: '⛈️', // Patchy light rain with thunder
  1276: '⛈️', // Moderate or heavy rain with thunder
  1279: '⛈️', // Patchy light snow with thunder
  1282: '⛈️'  // Moderate or heavy snow with thunder
}

// Özel Türkçe açıklamalar (daha kısa ve anlaşılır)
const weatherDescriptions = {
  1000: 'güneşli',
  1003: 'parçalı bulutlu',
  1006: 'bulutlu',
  1009: 'kapalı',
  1030: 'sisli',
  1063: 'hafif yağmurlu',
  1066: 'hafif kar yağışlı',
  1069: 'karla karışık yağmurlu',
  1072: 'dondurucu çisenti',
  1087: 'fırtınalı',
  1114: 'kar fırtınası',
  1117: 'tipi',
  1135: 'yoğun sisli',
  1147: 'dondurucu sisli',
  1150: 'hafif çisenli',
  1153: 'çisenli',
  1168: 'dondurucu çisenli',
  1171: 'yoğun dondurucu çisenli',
  1180: 'yer yer yağmurlu',
  1183: 'hafif yağmurlu',
  1186: 'orta şiddette yağmurlu',
  1189: 'yağmurlu',
  1192: 'şiddetli yağmurlu',
  1195: 'çok şiddetli yağmurlu',
  1198: 'hafif dondurucu yağmurlu',
  1201: 'dondurucu yağmurlu',
  1204: 'hafif karla karışık yağmurlu',
  1207: 'karla karışık yağmurlu',
  1210: 'yer yer kar yağışlı',
  1213: 'hafif kar yağışlı',
  1216: 'orta şiddette kar yağışlı',
  1219: 'karlı',
  1222: 'şiddetli kar yağışlı',
  1225: 'çok şiddetli kar yağışlı',
  1237: 'dolu',
  1240: 'sağanak yağmur',
  1243: 'şiddetli sağanak',
  1246: 'çok şiddetli sağanak',
  1249: 'karla karışık sağanak',
  1252: 'şiddetli karla karışık sağanak',
  1255: 'kar sağanağı',
  1258: 'şiddetli kar sağanağı',
  1261: 'hafif dolu',
  1264: 'şiddetli dolu',
  1273: 'gök gürültülü yağmur',
  1276: 'şiddetli gök gürültülü yağmur',
  1279: 'gök gürültülü kar',
  1282: 'şiddetli gök gürültülü kar'
}

// Maçın 7 gün içinde olup olmadığını kontrol et
export function isWithinWeek(matchDate) {
  if (!matchDate) return false
  
  // Sadece tarihleri karşılaştırmak için saatleri sıfırla
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Bugün saat 00:00:00
  
  const oneWeekLater = new Date(today)
  oneWeekLater.setDate(today.getDate() + 7) // 7 gün sonra saat 00:00:00
  
  const [day, month, year] = matchDate.split('.')
  const matchDateObj = new Date(year, month - 1, day)
  matchDateObj.setHours(0, 0, 0, 0) // Maç günü saat 00:00:00
  
  // Debug için console log ekle
  if (import.meta.env.DEV) {
    console.log('Tarih kontrolü:', {
      matchDate,
      today: today.toISOString().split('T')[0],
      matchDay: matchDateObj.toISOString().split('T')[0],
      oneWeekLater: oneWeekLater.toISOString().split('T')[0],
      isWithinWeek: matchDateObj >= today && matchDateObj <= oneWeekLater
    })
  }
  
  return matchDateObj >= today && matchDateObj <= oneWeekLater
}

// 7 günlük hava durumu tahminini getir
export async function getWeatherForecast() {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${OF_TRABZON_COORDS.lat},${OF_TRABZON_COORDS.lon}&days=7&aqi=no&alerts=no&lang=tr`
    )
    
    if (!response.ok) {
      throw new Error('Hava durumu verisi alınamadı')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Hava durumu API hatası:', error)
    return null
  }
}

// Belirli bir tarih ve saatte hava durumu (WeatherAPI formatı)
export function getWeatherForDateTime(forecastData, matchDate, matchTime) {
  if (import.meta.env.DEV) {
    console.log('getWeatherForDateTime çağrıldı:', { matchDate, matchTime, hasForecastData: !!forecastData })
  }
  
  if (!forecastData || !matchDate || !forecastData.forecast) {
    if (import.meta.env.DEV) {
      console.log('Eksik veri:', { 
        hasForecastData: !!forecastData, 
        hasMatchDate: !!matchDate, 
        hasForecast: !!forecastData?.forecast 
      })
    }
    return null
  }
  
  const [day, month, year] = matchDate.split('.')
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  
  if (import.meta.env.DEV) {
    console.log('Tarih formatı:', { matchDate, formattedDate })
  }
  
  // İlgili günün verisini bul
  const dayForecast = forecastData.forecast.forecastday.find(day => day.date === formattedDate)
  
  if (import.meta.env.DEV) {
    console.log('Gün tahmini bulundu mu:', { 
      formattedDate, 
      foundDay: !!dayForecast,
      availableDates: forecastData.forecast.forecastday.map(d => d.date)
    })
  }
  
  if (!dayForecast) return null
  
  const [hours, minutes] = matchTime ? matchTime.split(':') : ['18', '00']
  const matchHour = parseInt(hours)
  
  // En yakın saatlik tahmin verisini bul
  let closestHourly = null
  let minTimeDiff = Infinity
  
  if (dayForecast.hour) {
    dayForecast.hour.forEach(hourData => {
      const hourTime = new Date(hourData.time).getHours()
      const timeDiff = Math.abs(matchHour - hourTime)
      
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff
        closestHourly = hourData
      }
    })
  }
  
  // Eğer saatlik veri yoksa günlük veriyi kullan
  const weatherData = closestHourly || dayForecast.day
  
  if (import.meta.env.DEV) {
    console.log('Hava durumu verisi:', {
      matchHour,
      hasHourlyData: !!closestHourly,
      weatherData: weatherData ? {
        temp: weatherData.temp_c || weatherData.avgtemp_c,
        condition: weatherData.condition.text,
        code: weatherData.condition.code
      } : null
    })
  }
  
  if (!weatherData) return null
  
  return {
    temperature: Math.round(weatherData.temp_c || weatherData.avgtemp_c),
    description: weatherDescriptions[weatherData.condition.code] || weatherData.condition.text || 'Bilinmeyen',
    originalDescription: weatherData.condition.text, // API'den gelen orijinal açıklama
    icon: weatherIcons[weatherData.condition.code] || '🌤️'
  }
}

// Mock veri (API key olmadığında fallback)
export function getMockWeatherData() {
  const mockWeathers = [
    { temperature: 22, description: 'parçalı bulutlu', icon: '⛅' },
    { temperature: 18, description: 'hafif yağmurlu', icon: '🌦️' },
    { temperature: 25, description: 'güneşli', icon: '☀️' },
    { temperature: 20, description: 'bulutlu', icon: '☁️' },
    { temperature: 16, description: 'yağmurlu', icon: '🌧️' }
  ]
  
  return mockWeathers[Math.floor(Math.random() * mockWeathers.length)]
}