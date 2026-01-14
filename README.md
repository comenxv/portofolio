# MHSF Portfolio

Portfolio pribadi dengan tema minimalis hitam elegan, terintegrasi dengan Google Sheets sebagai backend.

## 🚀 Demo

Buka [https://username.github.io/portofolio](https://username.github.io/portofolio)

## ✨ Fitur

- **Tema Minimalis Hitam** - Desain elegan dengan aksen putih/abu-abu
- **Responsif** - Tampil sempurna di desktop dan mobile
- **Dynamic Data** - Data diambil dari Google Sheets
- **Lazy Loading** - Gambar dimuat saat terlihat untuk performa optimal
- **Caching** - Data di-cache untuk load lebih cepat
- **Animasi Halus** - Fade-in dan hover effects

## 📁 Struktur File

```
portofolio/
├── index.html          # Halaman utama
├── styles.css          # Stylesheet
├── script.js           # JavaScript (fetch & render)
├── SETUP_GUIDE.md      # Panduan setup Google Sheets
├── README.md           # File ini
└── google-apps-script/
    └── Code.gs         # Google Apps Script API
```

## 🛠️ Setup

### 1. Clone Repository

```bash
git clone https://github.com/username/portofolio.git
```

### 2. Setup Google Sheets

Ikuti panduan di [SETUP_GUIDE.md](SETUP_GUIDE.md)

### 3. Deploy ke GitHub Pages

1. Push ke repository GitHub
2. Buka Settings → Pages
3. Pilih Branch: `main`, Folder: `/ (root)`
4. Klik Save

## 📊 Google Sheets Structure

### Sheet: `profile`
| key | value |
|-----|-------|
| name | Nama Anda |
| tagline | Deskripsi singkat |
| description | Bio lengkap |
| email | email@example.com |

### Sheet: `projects`
| id | title | description | image_url | link_project | tags | order |
|----|-------|-------------|-----------|--------------|------|-------|

### Sheet: `social_links`
| platform | url | icon |
|----------|-----|------|

## 🎨 Kustomisasi

### Ganti Warna
Edit variabel CSS di `styles.css`:
```css
:root {
    --bg-primary: #0a0a0a;
    --text-primary: #ffffff;
    /* ... */
}
```

### Ganti Font
Edit link Google Fonts di `index.html`

## 📝 License

MIT License - Bebas digunakan dan dimodifikasi

---

Made with ❤️ by MHSF
