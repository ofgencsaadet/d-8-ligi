import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createPlayoffTemplate() {
  // Template verileri - Penaltı sütunları eklendi, Link sütunu K'ya taşındı
  const templateData = [
    ['Maç Türü', 'Takım 1', 'Takım 2', 'Skor 1', 'Skor 2', 'Tarih', 'Saat', '', 'Penaltı 1', 'Penaltı 2', 'Link'],
    ['Çeyrek Final 1', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['Çeyrek Final 2', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['Çeyrek Final 3', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['Çeyrek Final 4', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['Yarı Final 1', '', '', '', '', '', '', '', '', '', ''],
    ['QF1 Galibi', 'QF2 Galibi', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['Yarı Final 2', '', '', '', '', '', '', '', '', '', ''],
    ['QF3 Galibi', 'QF4 Galibi', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['Final', '', '', '', '', '', '', '', '', '', ''],
    ['YF1 Galibi', 'YF2 Galibi', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['3. lük Maçı', '', '', '', '', '', '', '', '', '', ''],
    ['YF1 Mağlubu', 'YF2 Mağlubu', '', '', '', '', '', '', '', '', '']
  ]

  // Yeni workbook oluştur
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(templateData)

  // Sütun genişlikleri ayarla
  worksheet['!cols'] = [
    { wch: 15 }, // Maç Türü (A)
    { wch: 20 }, // Takım 1 (B)
    { wch: 20 }, // Takım 2 (C)
    { wch: 8 },  // Skor 1 (D)
    { wch: 8 },  // Skor 2 (E)
    { wch: 12 }, // Tarih (F)
    { wch: 8 },  // Saat (G)
    { wch: 3 },  // Boş (H) - ayırıcı
    { wch: 10 }, // Penaltı 1 (I)
    { wch: 10 }, // Penaltı 2 (J)
    { wch: 40 }  // Link (K)
  ]

  // Header stillerini ayarla
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "E6E6FA" } },
    alignment: { horizontal: "center" }
  }

  // Penaltı header'ları için özel stil
  const penaltyHeaderStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "FFE4B5" } }, // Açık turuncu
    alignment: { horizontal: "center" }
  }

  // Header stillerini uygula
  const headers = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'I1', 'J1', 'K1']
  headers.forEach((cell, index) => {
    if (worksheet[cell]) {
      // Penaltı sütunları için özel stil
      if (cell === 'I1' || cell === 'J1') {
        worksheet[cell].s = penaltyHeaderStyle
      } else {
        worksheet[cell].s = headerStyle
      }
    }
  })

  // Worksheet'i workbook'a ekle
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Playoff')

  // Dosyayı kaydet
  const outputDir = path.join(__dirname, '..', 'data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, 'playoff-template.xlsx')
  XLSX.writeFile(workbook, outputPath)

  console.log('✅ Kupa Yolu template oluşturuldu:', outputPath)
  console.log('📋 Yeni sütun düzeni:')
  console.log('   A: Maç Türü, B: Takım 1, C: Takım 2')
  console.log('   D: Skor 1, E: Skor 2, F: Tarih, G: Saat')
  console.log('   I: Penaltı 1, J: Penaltı 2, K: Link')
  console.log('')
  console.log('⚽ Penaltı kullanımı:')
  console.log('   - Normal skor berabere biterse penaltı skorlarını I ve J sütunlarına yazın')
  console.log('   - Örnek: Normal skor 1-1, Penaltı 4-3 ise I1=4, J1=3 yazın')
  console.log('   - Sistem galibi penaltı sonucuna göre belirleyecek')
  
  return outputPath
}

// Script'i çalıştır
createPlayoffTemplate() 