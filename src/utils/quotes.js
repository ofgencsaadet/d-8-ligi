// Inspiratif sözler koleksiyonu
export const quotes = [
  {
    text: "Zulüm karşısında susan dilsiz şeytandır; biz dilimizle, kalbimizle Gazze’nin yanındayız!",
    author: "Genç Saadet OF"
  },
  {
    text: "Bir milletin asıl gücü; topu, tüfeği değil, imanlı ve inançlı gençliğidir.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Hakkın hâkimiyeti için çalışmamakla, batılın hâkimiyeti için çalışmak arasında fark yoktur.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Siyaseti önemsemeyen Müslümanları, Müslümanları önemsemeyen siyasetçiler yönetir.",
    author: "Necmettin Erbakan"
  },
  {
    text: "D-8 sadece ekonomik bir birlik değil, manevi bir kalkınma hamlesidir.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Fırtınalara yön veren kelebeklerin kanat çırpışıdır.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Milli Görüş hayra motor, şerre fren olmaktır.",
    author: "Necmettin Erbakan"
  }
]

// Rastgele bir söz seç
export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
} 