# 📁 STRUKTURA PROJEKTU BUCIACZEK-SKLEP

**Lokalizacja**: `/Users/krzyk/Desktop/buciaczek-sklep`

## Pliki główne
```
buciaczek-sklep/
├── 📄 index.html              # Główna strona sklepu (1213 linii)
├── 📦 package.json            # Konfiguracja Node.js + scripts
├── ⚙️ netlify.toml            # Konfiguracja Netlify hosting
├── 🔐 .env                    # Zmienne środowiskowe (klucze API)
├── 📋 .gitignore              # Pliki ignorowane przez Git
├── 📊 package-lock.json       # Lock file dependencies
└── 📁 .DS_Store               # System macOS file
```

## Katalog netlify/functions/ (6 plików API)
```
netlify/functions/
├── 🔌 get-products.js         # Pobiera produkty z Airtable (110 linii)
├── 💾 get-products-backup.js  # Backup funkcji get-products
├── 📊 check-stock.js          # Sprawdza stany magazynowe
├── 📝 update-stock.js         # Aktualizuje stan ogólny
├── 🔢 update-size-stock.js    # Aktualizuje stany per rozmiar
└── 🛍️ create-order.js         # Tworzenie zamówień (Stripe ready)
```

## Katalog .netlify/ (automatyczny)
```
.netlify/
├── 📊 state.json              # Stan projektu Netlify
├── 📁 functions/              # Skompilowane funkcje
├── 📁 functions-serve/        # Cache funkcji dev
├── 📁 functions-internal/     # Wewnętrzne funkcje
├── 📁 blobs-serve/           # Cache blobs
├── 📁 v1/                    # Cache Netlify v1
└── ⚙️ netlify.toml           # Dodatkowa konfiguracja
```

## Katalog node_modules/ (automatyczny)
```
node_modules/                  # Zależności Node.js
├── airtable/                 # Biblioteka Airtable API
├── dotenv/                   # Zmienne środowiskowe
├── stripe/                   # Płatności (nieaktywne)
└── ...                       # Inne dependencje
```

---

## 🔗 POWIĄZANIA PLIKÓW

### index.html → API Functions
```javascript
// Główna strona wywołuje:
fetch('/.netlify/functions/get-products')     // Lista produktów
fetch('/.netlify/functions/check-stock')      // Sprawdzanie stanów  
fetch('/.netlify/functions/update-stock')     // Aktualizacja stanów
```

### API Functions → Airtable
```javascript
// Wszystkie funkcje używają:
const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY      // z .env
}).base(process.env.AIRTABLE_BASE_ID);        // z .env
```

### netlify.toml → Functions
```toml
[build]
  functions = "netlify/functions"             # Wskazuje lokalizację API

[functions]  
  node_bundler = "esbuild"                   # Kompilator funkcji
```

---

## 📊 STATYSTYKI PROJEKTU

- **Łączne pliki**: ~20 (bez node_modules)
- **Kod główny**: 1213 linii HTML/CSS/JS
- **API Functions**: 6 plików Node.js
- **Rozmiar**: ~2MB (z node_modules ~50MB)
- **Responsywność**: Mobile + Desktop
- **Performance**: A+ ready

---

## 🔄 WORKFLOW ZMIAN

1. **Edytuj pliki** w `/Users/krzyk/Desktop/buciaczek-sklep/`
2. **Test lokalny**: `npm run dev` (port 8888)
3. **Deploy**: `npm run deploy` → https://buciaczek.eu
4. **Monitoring**: Panel Netlify + logi funkcji

---

**Status**: ✅ Działający w produkcji na https://buciaczek.eu
