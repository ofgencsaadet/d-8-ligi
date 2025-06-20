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
  }
]

// Rastgele bir söz seç
export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
} 