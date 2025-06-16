# D-8 Futbol Turnuvası Web Sitesi

Bu proje, React ile geliştirilmiş bir futbol turnuvası web sitesidir. 3 grup ve 12 takımın mücadele ettiği turnuvanın puan tablolarını, maç sonuçlarını ve fikstürünü görüntüler.

**🌐 Site Adresi**: https://huseyinyasarr.github.io/d-8-sampiyonlar-ligi

## 📊 Excel Dosyası Güncelleme Adımları

Excel dosyasında maç sonuçlarını güncelledikten sonra aşağıdaki adımları sırasıyla takip edin:

### 1. Excel Dosyasını Düzenleyin
- `data/mac-sonuclari.xlsx` dosyasını açın
- **Skor1** ve **Skor2** sütunlarına maç sonuçlarını girin
- Dosyayı kaydedin (Ctrl+S)

### 2. Verileri İşleyin
```bash
npm run process-data
```

### 3. Değişiklikleri Git'e Ekleyin
```bash
git add .
```

### 4. Commit Yapın
```bash
git commit -m "Maç sonuçları güncellendi"
```

### 5. GitHub'a Gönderin
```bash
git push
```

### 6. Site Güncellemesi İçin Bekleyin
- GitHub Actions otomatik olarak site'yi güncelleyecek
- 2-3 dakika sonra site yeni verilerle yayında olacak

## 🏆 Takım Grupları

- **Ahmet Minguzzi Grubu**: Ajans Of, Ravager, Çirihtalar, Kural Kesiciler
- **Eren Bülbül Grubu**: Armedospor, Araklı 1961 Spor, Of 1461, Hubuş FK  
- **Narin Güran Grubu**: Fortuna United, Of FK, Ofside, 61.Alay

## ⚽ Puanlama Sistemi

- **Galibiyet**: 3 puan
- **Beraberlik**: 1 puan  
- **Mağlubiyet**: 0 puan
- **Averaj**: Atılan gol - Yenilen gol

---

**Keyifli maçlar dileriz! ⚽🏆** 