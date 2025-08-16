# ✅ AKTUALIZACJA WYKONANA - BUCIACZEK-SKLEP

## CO ZOSTAŁO ZROBIONE:

### 1. BACKUP
Utworzono kopię zapasową w: `/Users/krzyk/Desktop/wiedza/buciaczek-sklep/backup-2025-08-16/`

### 2. ZAKTUALIZOWANE PLIKI:

#### `/netlify/functions/create-order.js`
✅ Poprawiono kalkulację sumy (używa `quantity` zamiast `ilosc`)
✅ Dodano pełną obsługę aktualizacji stanów magazynowych per rozmiar
✅ Dodano szczegółowe logowanie dla debugowania

#### `/netlify/functions/check-stock.js`
✅ Dodano sprawdzanie stanu konkretnego rozmiaru
✅ Wymaga teraz parametru `size` w zapytaniu

#### `index.html`
✅ Funkcja `checkStock()` przekazuje teraz rozmiar
✅ Wyłączono podwójne wywołanie `updateStock()` 
✅ Dodano console.log dla debugowania
✅ Dodano 2-sekundowe opóźnienie przed odświeżeniem produktów

## JAK WDROŻYĆ NA PRODUKCJĘ:

### OPCJA A: Przez Git (jeśli masz skonfigurowane)
```bash
cd /Users/krzyk/Desktop/wiedza/buciaczek-sklep
git add .
git commit -m "Fix: poprawka sumy zamówień i odejmowania stanów magazynowych"
git push
```

### OPCJA B: Przez Netlify CLI
```bash
cd /Users/krzyk/Desktop/wiedza/buciaczek-sklep
netlify deploy --prod
```

### OPCJA C: Ręcznie przez panel Netlify
1. Zaloguj się na https://app.netlify.com
2. Wybierz projekt buciaczek
3. Przeciągnij folder projektu na stronę

## TESTOWANIE NA PRODUKCJI:

1. Otwórz https://buciaczek.eu/
2. Otwórz konsolę przeglądarki (F12)
3. Wklej ten kod testowy:

```javascript
// TEST AUTOMATYCZNY
async function testujPoprawki() {
    console.log('=== TEST POPRAWEK ===');
    
    // 1. Sprawdź stan przed
    const response1 = await fetch('/.netlify/functions/get-products');
    const products1 = await response1.json();
    const gepard1 = products1.find(p => p.nazwa.includes('Gepard'));
    console.log('Stan Geparda PRZED:', gepard1.stanyRozmiarow);
    
    // 2. Złóż testowe zamówienie
    const testOrder = {
        imie: "Test Poprawek",
        email: "test@buciaczek.eu",
        telefon: "123456789",
        adres: "Testowa 123",
        produkty: [{
            id: gepard1.id,
            nazwa: gepard1.nazwa,
            cena: gepard1.cena,
            size: "27",
            quantity: 1
        }]
    };
    
    const response2 = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
    });
    
    const result = await response2.json();
    console.log('Wynik zamówienia:', result);
    console.log('SUMA W ZAMÓWIENIU:', result.suma);
    
    // 3. Poczekaj i sprawdź stan po
    await new Promise(r => setTimeout(r, 3000));
    
    const response3 = await fetch('/.netlify/functions/get-products');
    const products3 = await response3.json();
    const gepard3 = products3.find(p => p.nazwa.includes('Gepard'));
    console.log('Stan Geparda PO:', gepard3.stanyRozmiarow);
    
    // Podsumowanie
    console.log('\n=== WYNIKI ===');
    if (result.suma === 89.99) {
        console.log('✅ SUMA POPRAWNA!');
    } else {
        console.log('❌ BŁĄD SUMY');
    }
    
    if (gepard1.stanyRozmiarow['27'] > gepard3.stanyRozmiarow['27']) {
        console.log('✅ STANY SĄ ODEJMOWANE!');
    } else {
        console.log('❌ STANY NIE SĄ ODEJMOWANE');
    }
}

testujPoprawki();
```

## OCZEKIWANE REZULTATY:
- ✅ Suma zamówienia powinna wynosić 89.99 zł (nie $50 ani puste)
- ✅ Stan rozmiaru 27 powinien zmniejszyć się o 1
- ✅ W Airtable pole Suma powinno być wypełnione
- ✅ W Airtable pole Rozmiary_Stan powinno być zaktualizowane

## W RAZIE PROBLEMÓW:
1. Sprawdź logi w Netlify: Functions → Wybierz funkcję → Real-time logs
2. Sprawdź czy zmienne środowiskowe są ustawione w Netlify
3. Przywróć backup jeśli coś nie działa