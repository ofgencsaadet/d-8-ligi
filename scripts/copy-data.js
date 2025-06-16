import fs from 'fs';
import path from 'path';

// public/data klasörünü oluştur
const publicDataDir = 'public/data';
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

// Eğer JSON dosyaları yoksa, process-excel.js'i çalıştır
const standingsFile = path.join(publicDataDir, 'standings.json');
const playedFile = path.join(publicDataDir, 'played.json');
const upcomingFile = path.join(publicDataDir, 'upcoming.json');

if (!fs.existsSync(standingsFile) || !fs.existsSync(playedFile) || !fs.existsSync(upcomingFile)) {
  console.log('JSON dosyaları bulunamadı, Excel işlemesi çalıştırılıyor...');
  
  // Excel processing script'ini çalıştır
  const { execSync } = await import('child_process');
  try {
    execSync('node scripts/process-excel.js', { stdio: 'inherit' });
    console.log('Excel verileri başarıyla işlendi!');
  } catch (error) {
    console.error('Excel işleme hatası:', error.message);
    
    // Fallback: Boş JSON dosyaları oluştur
    const emptyStandings = { "Grup A": [], "Grup B": [], "Grup C": [] };
    const emptyMatches = [];
    
    fs.writeFileSync(standingsFile, JSON.stringify(emptyStandings, null, 2));
    fs.writeFileSync(playedFile, JSON.stringify(emptyMatches, null, 2));
    fs.writeFileSync(upcomingFile, JSON.stringify(emptyMatches, null, 2));
    
    console.log('Boş JSON dosyaları oluşturuldu.');
  }
} else {
  console.log('JSON dosyaları mevcut!');
} 