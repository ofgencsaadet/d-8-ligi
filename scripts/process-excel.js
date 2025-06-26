import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Veri dizinini oluştur
const dataDir = 'public/data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Excel dosyasını oku
function readExcelFile() {
  const excelPath = 'data/mac-sonuclari.xlsx';
  
  // Eğer Excel dosyası yoksa, sahte veri oluştur
  if (!fs.existsSync(excelPath)) {
    console.log('Excel dosyası bulunamadı, sahte veri oluşturuluyor...');
    createSampleData();
    return;
  }

  try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('Excel dosyası okundu!');
    console.log('Toplam satır sayısı:', jsonData.length);
    
    // Sütun başlıklarını kontrol et
    if (jsonData.length > 0) {
      console.log('Mevcut sütun başlıkları:', Object.keys(jsonData[0]));
      // Link ile ilgili sütunları bul
      const linkColumns = Object.keys(jsonData[0]).filter(key => 
        key.toLowerCase().includes('link') || 
        key.toLowerCase().includes('video') || 
        key.toLowerCase().includes('youtube')
      );
      if (linkColumns.length > 0) {
        console.log('Bulunan link sütunları:', linkColumns);
      } else {
        console.log('⚠️  Link sütunu bulunamadı. Kullanıcı Excel dosyasına Link sütununu eklemiş mi kontrol edin.');
      }
    }
    
    console.log('İlk 3 satır:');
    jsonData.slice(0, 3).forEach((row, i) => {
      // Tüm olası link sütun adlarını test et
      const possibleLinks = [
        row.Link, row.link, row.LINK,
        row['Link'], row['link'], row['LINK'],
        row.Video, row.video, row.VIDEO,
        row.YouTube, row.youtube, row.YOUTUBE
      ].filter(Boolean);
      
      const team1 = row.Takım1 || row.Takim1 || 'Bilinmeyen';
      const team2 = row.Takım2 || row.Takim2 || 'Bilinmeyen';
      
      console.log(`${i+1}. ${team1} vs ${team2} - Skor1: "${row.Skor1}" (${typeof row.Skor1}) - Skor2: "${row.Skor2}" (${typeof row.Skor2}) - Link: "${possibleLinks[0] || 'YOK'}" (${typeof (possibleLinks[0] || undefined)})`);
      console.log('   Tüm sütunlar:', Object.keys(row).map(key => `${key}: "${row[key]}"`).join(', '));
      
      // Tüm sütun adlarını kontrol et
      console.log('   Sütun adları karakter karakter:', Object.keys(row).map(key => `"${key}" [${key.length} karakter]`).join(', '));
    });
    
    processData(jsonData);
  } catch (error) {
    console.error('Excel dosyası okunurken hata:', error);
    createSampleData();
  }
}

// Sahte veri oluştur
function createSampleData() {
  const sampleMatches = [
    // Ahmet Minguzzi Grubu
    { Tarih: '2024-06-16', Grup: 'Ahmet Minguzzi Grubu', Takım1: 'Ajans Of', Takım2: 'Ravager', Skor1: 3, Skor2: 1, Link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { Tarih: '2024-06-18', Grup: 'Ahmet Minguzzi Grubu', Takım1: 'Çirihtalar', Takım2: 'Kural Kesiciler', Skor1: 2, Skor2: 0, Link: '' },
    { Tarih: '2024-06-23', Grup: 'Ahmet Minguzzi Grubu', Takım1: 'Ajans Of', Takım2: 'Çirihtalar', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-25', Grup: 'Ahmet Minguzzi Grubu', Takım1: 'Ravager', Takım2: 'Kural Kesiciler', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-30', Grup: 'Ahmet Minguzzi Grubu', Takım1: 'Ajans Of', Takım2: 'Kural Kesiciler', Skor1: '', Skor2: '' },
    { Tarih: '2024-07-02', Grup: 'Ahmet Minguzzi Grubu', Takım1: 'Ravager', Takım2: 'Çirihtalar', Skor1: '', Skor2: '' },

    // Narin Güran Grubu  
    { Tarih: '2024-06-16', Grup: 'Narin Güran Grubu', Takım1: 'Fortuna United', Takım2: 'Of FK', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-19', Grup: 'Narin Güran Grubu', Takım1: 'Ofside', Takım2: '61.Alay', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-23', Grup: 'Narin Güran Grubu', Takım1: 'Fortuna United', Takım2: 'Ofside', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-26', Grup: 'Narin Güran Grubu', Takım1: 'Of FK', Takım2: '61.Alay', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-30', Grup: 'Narin Güran Grubu', Takım1: 'Fortuna United', Takım2: '61.Alay', Skor1: '', Skor2: '' },
    { Tarih: '2024-07-03', Grup: 'Narin Güran Grubu', Takım1: 'Of FK', Takım2: 'Ofside', Skor1: '', Skor2: '' },

    // Eren Bülbül Grubu
    { Tarih: '2024-06-18', Grup: 'Eren Bülbül Grubu', Takım1: 'Of 1461', Takım2: 'Hubuş FK', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-19', Grup: 'Eren Bülbül Grubu', Takım1: 'Armedospor', Takım2: 'Araklı 1961 Spor', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-25', Grup: 'Eren Bülbül Grubu', Takım1: 'Araklı 1961 Spor', Takım2: 'Hubuş FK', Skor1: '', Skor2: '' },
    { Tarih: '2024-06-26', Grup: 'Eren Bülbül Grubu', Takım1: 'Armedospor', Takım2: 'Of 1461', Skor1: '', Skor2: '' },
    { Tarih: '2024-07-02', Grup: 'Eren Bülbül Grubu', Takım1: 'Araklı 1961 Spor', Takım2: 'Of 1461', Skor1: '', Skor2: '' },
    { Tarih: '2024-07-03', Grup: 'Eren Bülbül Grubu', Takım1: 'Armedospor', Takım2: 'Hubuş FK', Skor1: '', Skor2: '' }
  ];

  processData(sampleMatches);
}

// Excel serial date'ini normal tarihe çevir
function excelDateToJSDate(serial) {
  const utc_days  = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;                                        
  const date_info = new Date(utc_value * 1000);
  
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  
  let total_seconds = Math.floor(86400 * fractional_day);
  
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

// Tarihi DD.MM.YYYY formatına çevir
function formatDate(dateValue) {
  if (typeof dateValue === 'number') {
    const jsDate = excelDateToJSDate(dateValue);
    const day = jsDate.getDate().toString().padStart(2, '0');
    const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
    const year = jsDate.getFullYear();
    return `${day}.${month}.${year}`;
  }
  return dateValue; // Eğer zaten string ise olduğu gibi döndür
}

// Saati HH:MM formatına çevir
function formatTime(timeValue) {
  if (typeof timeValue === 'number') {
    const jsDate = excelDateToJSDate(timeValue);
    const hours = jsDate.getHours().toString().padStart(2, '0');
    const minutes = jsDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return timeValue; // Eğer zaten string ise olduğu gibi döndür
}

// Verileri işle
function processData(matches) {
  const playedMatches = [];
  const upcomingMatches = [];
  const standings = {};

  // Link sütunu adını tespit et
  let linkColumn = null;
  if (matches.length > 0) {
    const possibleLinkColumns = Object.keys(matches[0]).filter(key => 
      key.toLowerCase().includes('link') || 
      key.toLowerCase().includes('video') || 
      key.toLowerCase().includes('youtube')
    );
    if (possibleLinkColumns.length > 0) {
      linkColumn = possibleLinkColumns[0];
      console.log(`✅ Link sütunu tespit edildi: "${linkColumn}"`);
    }
  }

  // Grup isimlerini al
  const groups = [...new Set(matches.map(match => match.Grup))];
  
  // Her grup için puan tablosu başlat
  groups.forEach(group => {
    standings[group] = {};
  });

  // Takım isimlerini al ve puan tablosunu başlat
  matches.forEach(match => {
    const group = match.Grup;
    const team1 = match.Takım1 || match.Takim1;
    const team2 = match.Takım2 || match.Takim2;
    
    if (!standings[group][team1]) {
      standings[group][team1] = {
        team: team1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    }
    if (!standings[group][team2]) {
      standings[group][team2] = {
        team: team2,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    }
  });

  // Maçları işle
  matches.forEach(match => {
    // Esnek sütun isimleri
    const team1 = match.Takım1 || match.Takim1;
    const team2 = match.Takım2 || match.Takim2;
    
    // Skor2 undefined ise boş string yap
    if (match.Skor2 === undefined) match.Skor2 = '';
    if (match.Skor1 === undefined) match.Skor1 = '';
    
    const hasScore = match.Skor1 !== '' && match.Skor2 !== '' && 
                     match.Skor1 !== null && match.Skor2 !== null &&
                     match.Skor1 !== undefined && match.Skor2 !== undefined &&
                     !isNaN(match.Skor1) && !isNaN(match.Skor2);

    if (hasScore) {
      // Oynanmış maç
      playedMatches.push({
        date: formatDate(match.Tarih),
        time: formatTime(match.Saat),
        group: match.Grup,
        team1: team1,
        team2: team2,
        score1: parseInt(match.Skor1),
        score2: parseInt(match.Skor2),
        videoLink: linkColumn ? (match[linkColumn] || null) : null
      });

      // Puan tablosunu güncelle
      const group = match.Grup;
      const score1 = parseInt(match.Skor1);
      const score2 = parseInt(match.Skor2);

      // Takım 1 istatistikleri
      standings[group][team1].played++;
      standings[group][team1].goalsFor += score1;
      standings[group][team1].goalsAgainst += score2;

      // Takım 2 istatistikleri
      standings[group][team2].played++;
      standings[group][team2].goalsFor += score2;
      standings[group][team2].goalsAgainst += score1;

      // Kazanan belirleme
      if (score1 > score2) {
        // Takım 1 kazandı
        standings[group][team1].won++;
        standings[group][team1].points += 3;
        standings[group][team2].lost++;
      } else if (score2 > score1) {
        // Takım 2 kazandı
        standings[group][team2].won++;
        standings[group][team2].points += 3;
        standings[group][team1].lost++;
      } else {
        // Beraberlik
        standings[group][team1].drawn++;
        standings[group][team1].points += 1;
        standings[group][team2].drawn++;
        standings[group][team2].points += 1;
      }

      // Averaj hesaplama
      standings[group][team1].goalDifference = 
        standings[group][team1].goalsFor - standings[group][team1].goalsAgainst;
      standings[group][team2].goalDifference = 
        standings[group][team2].goalsFor - standings[group][team2].goalsAgainst;

    } else {
      // Oynanacak maç
      upcomingMatches.push({
        date: formatDate(match.Tarih),
        time: formatTime(match.Saat),
        group: match.Grup,
        team1: team1,
        team2: team2
      });
    }
  });

  // Puan tablolarını sırala (puana göre, sonra averaja göre)
  const sortedStandings = {};
  Object.keys(standings).forEach(group => {
    sortedStandings[group] = Object.values(standings[group]).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goalDifference - a.goalDifference;
    });
  });

  // JSON dosyalarını yaz
  fs.writeFileSync(path.join(dataDir, 'standings.json'), JSON.stringify(sortedStandings, null, 2));
  fs.writeFileSync(path.join(dataDir, 'played.json'), JSON.stringify(playedMatches, null, 2));
  fs.writeFileSync(path.join(dataDir, 'upcoming.json'), JSON.stringify(upcomingMatches, null, 2));

  console.log('Veriler başarıyla işlendi ve JSON dosyalarına yazıldı.');
  console.log(`- ${playedMatches.length} oynanmış maç`);
  console.log(`- ${upcomingMatches.length} oynanacak maç`);
  console.log(`- ${Object.keys(sortedStandings).length} grup`);
}

// Script'i çalıştır
readExcelFile(); 