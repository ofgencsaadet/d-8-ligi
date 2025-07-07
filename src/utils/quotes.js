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
  },
  {
    text: "Bizler, gelecek seçimler için değil; gelecek nesiller için çalışıyoruz.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Bütün uyuyanları uyandırmaya bir tek uyanık yeter.",
    author: "Malcom X"
  },
  {
    text: "Bir çiçekle bahar olmaz; ama her bahar bir çiçekle başlar.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Haksız bir davada zirve olmaktansa, hak davada zerre olmayı tercih ederiz.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Gençler, Ümmetin ve ülkenin en büyük sermayesidir.",
    author: "Necmettin Erbakan"
  },
  {
    text: "Zulme rıza göstermek, zulmün ortağı olmaktır.",
    author: "Abdulaziz Kıranşal"
  }
]

// Rastgele bir söz seç
export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
} 