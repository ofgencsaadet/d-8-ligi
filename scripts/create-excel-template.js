import XLSX from 'xlsx';
import fs from 'fs';

// matches.json dosyasından fikstür verilerini oku
const matchesData = JSON.parse(fs.readFileSync('data/matches.json', 'utf8'));

// Excel için veri formatını hazırla
const excelData = matchesData.matches.map(match => ({
  'Tarih': match.tarih,
  'Saat': match.saat,
  'Grup': match.grup,
  'Takım1': match.takim1,
  'Takım2': match.takim2,
  'Skor1': '', // Boş bırak, kullanıcı dolduracak
  'Skor2': ''  // Boş bırak, kullanıcı dolduracak
}));

// Yeni workbook oluştur
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(excelData);

// Sütun genişliklerini ayarla
const colWidths = [
  { wch: 12 }, // Tarih
  { wch: 8 },  // Saat
  { wch: 20 }, // Grup
  { wch: 18 }, // Takim1
  { wch: 18 }, // Takim2
  { wch: 8 },  // Skor1
  { wch: 8 }   // Skor2
];
ws['!cols'] = colWidths;

// Header'ları kalın yap
const headerStyle = {
  font: { bold: true },
  fill: { fgColor: { rgb: "E6E6FA" } }
};

// İlk satır (header) için stil uygula
const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1'];
headerCells.forEach(cell => {
  if (ws[cell]) {
    ws[cell].s = headerStyle;
  }
});

// Worksheet'i workbook'a ekle
XLSX.utils.book_append_sheet(wb, ws, 'Maçlar');

// Excel dosyasını yaz
XLSX.writeFile(wb, 'data/mac-sonuclari-yeni-template.xlsx');

console.log('✅ Excel template dosyası oluşturuldu: data/mac-sonuclari-yeni-template.xlsx');
console.log('');
console.log('📋 Kullanım Talimatları:');
console.log('1. data/mac-sonuclari-template.xlsx dosyasını açın');
console.log('2. Skor1 ve Skor2 sütunlarına maç sonuçlarını girin');
console.log('3. Boş bıraktığınız maçlar "oynanacak maçlar" olarak görünür');
console.log('4. Dosyayı data/mac-sonuclari.xlsx olarak kaydedin');
console.log('5. npm run process-data komutunu çalıştırın');
console.log('');
console.log('✨ Örnek:');
console.log('Ajans Of vs Ravager maçı 2-1 bittiyse:');
console.log('Skor1 = 2, Skor2 = 1 yazın'); 