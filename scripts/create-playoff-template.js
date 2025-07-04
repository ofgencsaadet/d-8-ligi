import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createPlayoffTemplate() {
  // Template verileri
  const templateData = [
    ['Maç Türü', 'Takım 1', 'Takım 2', 'Skor 1', 'Skor 2', 'Tarih', 'Saat'],
    ['Çeyrek Final 1', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Çeyrek Final 2', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Çeyrek Final 3', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Çeyrek Final 4', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Yarı Final 1', '', '', '', '', '', ''],
    ['QF1 Galibi', 'QF2 Galibi', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Yarı Final 2', '', '', '', '', '', ''],
    ['QF3 Galibi', 'QF4 Galibi', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Final', '', '', '', '', '', ''],
    ['YF1 Galibi', 'YF2 Galibi', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['3. lük Maçı', '', '', '', '', '', ''],
    ['YF1 Mağlubu', 'YF2 Mağlubu', '', '', '', '', '']
  ]

  // Yeni workbook oluştur
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(templateData)

  // Sütun genişlikleri ayarla
  worksheet['!cols'] = [
    { wch: 15 }, // Maç Türü
    { wch: 20 }, // Takım 1
    { wch: 20 }, // Takım 2
    { wch: 8 },  // Skor 1
    { wch: 8 },  // Skor 2
    { wch: 12 }, // Tarih
    { wch: 8 }   // Saat
  ]

  // Worksheet'i workbook'a ekle
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Playoff')

  // Dosyayı kaydet
  const outputDir = path.join(__dirname, '..', 'data')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const outputPath = path.join(outputDir, 'playoff-template.xlsx')
  XLSX.writeFile(workbook, outputPath)

  console.log('✅ Playoff template oluşturuldu:', outputPath)
  return outputPath
}

// Script'i çalıştır
createPlayoffTemplate() 