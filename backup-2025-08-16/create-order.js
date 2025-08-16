// Ta funkcja tworzy nowe zamówienie w Airtable
// Wywoływana gdy klient kliknie "Złóż zamówienie"

const Airtable = require('airtable');

exports.handler = async (event, context) => {
    
    // Tylko POST (wysyłanie danych) jest dozwolone
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Tylko metoda POST dozwolona' }) 
        };
    }

    try {
        // Pobieramy dane zamówienia z żądania
        const orderData = JSON.parse(event.body);
        
        // Sprawdzamy czy mamy wszystkie wymagane dane
        if (!orderData.imie || !orderData.email || !orderData.produkty) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: 'Brakuje wymaganych danych' 
                })
            };
        }

        // Łączymy się z Airtable
        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);

        // Obliczamy sumę zamówienia
        const suma = orderData.produkty.reduce((total, produkt) => {
            return total + (produkt.cena * produkt.ilosc);
        }, 0);

        // Tworzymy nowy rekord w tabeli "Zamowienia"
        const record = await base('Zamowienia').create([
            {
                fields: {
                    'Imie_Nazwisko': orderData.imie,
                    'Email': orderData.email,
                    'Telefon': orderData.telefon || '',
                    'Adres': orderData.adres || '',
                    'Produkty': JSON.stringify(orderData.produkty), // Zapisujemy jako tekst
                    'Suma': suma,
                    'Status': 'Nowe',
                    'Uwagi': orderData.uwagi || ''
                }
            }
        ]);

        // NOWE: Automatyczna aktualizacja stanów rozmiarów
        try {
            // Przygotowujemy listę aktualizacji stanów
            const stockUpdates = [];
            orderData.produkty.forEach(produkt => {
                if (produkt.rozmiar && produkt.ilosc) {
                    stockUpdates.push({
                        productId: produkt.id,
                        rozmiar: produkt.rozmiar,
                        quantity: produkt.ilosc
                    });
                }
            });

            // Aktualizujemy stany rozmiarów dla każdego produktu
            if (stockUpdates.length > 0) {
                for (const update of stockUpdates) {
                    try {
                        // Pobieramy aktualny rekord produktu
                        const productRecord = await base('Produkty').find(update.productId);
                        
                        // Pobieramy aktualny stan rozmiarów
                        let rozmiary_stan = {};
                        try {
                            const stan_text = productRecord.get('Rozmiary_Stan') || '{}';
                            rozmiary_stan = JSON.parse(stan_text);
                        } catch (parseError) {
                            console.log('Tworzę nowy obiekt stanów dla produktu:', update.productId);
                            rozmiary_stan = {};
                        }
                        
                        // Aktualizujemy stan konkretnego rozmiaru
                        const currentStock = rozmiary_stan[update.rozmiar] || 0;
                        const newStock = Math.max(0, currentStock - update.quantity);
                        rozmiary_stan[update.rozmiar] = newStock;
                        
                        // Zapisujemy zaktualizowany JSON
                        await base('Produkty').update(update.productId, {
                            'Rozmiary_Stan': JSON.stringify(rozmiary_stan)
                        });
                        
                        console.log(`Zaktualizowano stan: ${update.productId}, rozmiar ${update.rozmiar}: ${currentStock} -> ${newStock}`);
                        
                    } catch (stockError) {
                        console.error(`Błąd aktualizacji stanu produktu ${update.productId}:`, stockError);
                        // Nie przerywamy całego procesu zamówienia z powodu błędu stanu
                    }
                }
            }
        } catch (stockUpdateError) {
            console.error('Błąd aktualizacji stanów magazynowych:', stockUpdateError);
            // Zamówienie zostaje zapisane mimo błędu aktualizacji stanów
        }

        // Zwracamy sukces z numerem zamówienia
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                orderNumber: record[0].get('Numer_Zamowienia'),
                orderId: record[0].id,
                message: 'Zamówienie zostało przyjęte!'
            })
        };

    } catch (error) {
        console.error('Błąd tworzenia zamówienia:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Nie udało się utworzyć zamówienia',
                details: error.message 
            })
        };
    }
};
