// Naprawiona funkcja get-products z obsługą rozmiarów i zdjęć
const Airtable = require('airtable');

exports.handler = async (event, context) => {
    
    if (event.httpMethod !== 'GET') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Tylko metoda GET dozwolona' }) 
        };
    }

    try {
        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);

        const records = await base('Produkty')
            .select({
                view: 'Grid view'
            })
            .all();

        const products = records.map(record => {
            // 🔧 NOWE: Parsuj stany rozmiarów z JSON
            let stanyRozmiarow = {};
            const stanyJson = record.get('Rozmiary_Stan');
            
            if (stanyJson) {
                try {
                    stanyRozmiarow = JSON.parse(stanyJson);
                } catch (e) {
                    console.error('Błąd parsowania JSON stanów dla produktu:', record.get('Nazwa'));
                    // Fallback - utwórz równomierne stany dla dostępnych rozmiarów
                    const rozmiary = record.get('Rozmiary_Dostepne') || [];
                    const stanOgolny = record.get('Stan_Magazynowy') || 0;
                    const stanNaRozmiar = Math.floor(stanOgolny / rozmiary.length) || 1;
                    
                    rozmiary.forEach(rozmiar => {
                        stanyRozmiarow[rozmiar] = stanNaRozmiar;
                    });
                }
            } else {
                // Jeśli nie ma pola Rozmiary_Stan, utwórz z dostępnych rozmiarów
                const rozmiary = record.get('Rozmiary_Dostepne') || [];
                const stanOgolny = record.get('Stan_Magazynowy') || 0;
                const stanNaRozmiar = Math.floor(stanOgolny / rozmiary.length) || 1;
                
                rozmiary.forEach(rozmiar => {
                    stanyRozmiarow[rozmiar] = stanNaRozmiar;
                });
            }

            // 🔧 NOWE: Oblicz całkowity stan magazynowy z rozmiarów
            const stanCalkowity = Object.values(stanyRozmiarow).reduce((sum, count) => sum + count, 0);
            
            // 🔧 NOWE: Pobierz tylko dostępne rozmiary (stan > 0)
            const dostepneRozmiary = Object.entries(stanyRozmiarow)
                .filter(([rozmiar, stan]) => stan > 0)
                .map(([rozmiar]) => rozmiar)
                .sort((a, b) => parseInt(a) - parseInt(b)); // Sortuj numerycznie

            // 🔧 NAPRAWIONE: Właściwa obsługa zdjęć z Airtable
            let zdjeciaUrls = [];
            const zdjecia = record.get('Zdjecia');
            if (zdjecia && Array.isArray(zdjecia)) {
                zdjeciaUrls = zdjecia.map(img => img.url);
            }

            return {
                id: record.id,
                nazwa: record.get('Nazwa') || '',
                cena: record.get('Cena') || 0,
                stan: stanCalkowity, // Suma wszystkich rozmiarów
                stanyRozmiarow: stanyRozmiarow, // {"26":1,"27":2,"28":0,...}
                rozmiary: dostepneRozmiary, // ["26","27","28"] - tylko dostępne
                rozmiary_dostepne: record.get('Rozmiary_Dostepne') || [], // Wszystkie rozmiary
                zdjecia: zdjeciaUrls, // Naprawione URLs zdjęć
                opis: record.get('Opis') || '',
                sku: record.get('SKU') || '',
                kategoria: record.get('Kategoria') || '',
                kolor: record.get('Kolor_główny') || record.get('Kolor główny') || ''
            };
        });

        // Filtruj tylko produkty które mają jakikolwiek stan
        const dostepneProdukty = products.filter(p => p.stan > 0);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300' // Cache na 5 minut
            },
            body: JSON.stringify(dostepneProdukty)
        };

    } catch (error) {
        console.error('Błąd pobierania produktów:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Nie udało się pobrać produktów',
                details: error.message 
            })
        };
    }
};
