// Ta funkcja pobiera wszystkie produkty z Airtable
// Będzie wywoływana gdy strona się ładuje

// Importujemy potrzebne biblioteki
const Airtable = require('airtable');

// Funkcja która obsługuje żądania
exports.handler = async (event, context) => {
    
    // Sprawdzamy czy to żądanie GET (pobieranie danych)
    if (event.httpMethod !== 'GET') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Tylko metoda GET dozwolona' }) 
        };
    }

    try {
        // Łączymy się z Airtable używając kluczy z .env
        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);

        // Pobieramy wszystkie rekordy z tabeli "Produkty"
        const records = await base('Produkty')
            .select({
                view: 'Grid view' // Pobieramy wszystkie produkty
            })
            .all();

        // Przekształcamy dane Airtable na format dla naszej strony
        const products = records.map(record => {
            let rozmiary_stan = {};
            try {
                // Próbujemy sparsować JSON z stanami rozmiarów
                const stan_text = record.get('Rozmiary_Stan') || '{}';
                rozmiary_stan = JSON.parse(stan_text);
            } catch (error) {
                console.log('Błąd parsowania stanów rozmiarów dla produktu:', record.get('Nazwa'));
                rozmiary_stan = {};
            }

            return {
                id: record.id,
                nazwa: record.get('Nazwa') || '',
                cena: record.get('Cena') || 0,
                stan: record.get('Stan_Magazynowy') || 0, // Ogólny stan - zachowujemy dla kompatybilności
                rozmiary: record.get('Rozmiary_Dostepne') || [],
                rozmiary_stan: rozmiary_stan, // NOWE: {"32": 2, "31": 0, "30": 3, ...}
                zdjecia: record.get('Zdjecia') || [],
                opis: record.get('Opis') || '',
                sku: record.get('SKU') || '',
                kategoria: record.get('Kategoria') || '',
                kolor: record.get('Kolor_Główny') || ''
            };
        });

        // Zwracamy produkty jako JSON
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Pozwala stronie odczytać dane
            },
            body: JSON.stringify(products)
        };

    } catch (error) {
        // Jeśli coś pójdzie nie tak, zwracamy błąd
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
