// POPRAWIONA FUNKCJA create-order.js
// Naprawia: brak sumy w zamówieniu i nieodejmowanie stanów magazynowych

const Airtable = require('airtable');

exports.handler = async (event, context) => {
    
    // Tylko POST jest dozwolone
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Tylko metoda POST dozwolona' }) 
        };
    }

    try {
        // Pobieramy dane zamówienia
        const orderData = JSON.parse(event.body);
        
        // Sprawdzamy wymagane dane
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

        // POPRAWKA 1: Właściwa kalkulacja sumy
        const suma = orderData.produkty.reduce((total, produkt) => {
            // Używamy właściwej nazwy pola quantity zamiast ilosc
            const cena = parseFloat(produkt.cena) || 89.99;
            const ilosc = parseInt(produkt.quantity) || 1; // <-- POPRAWKA: quantity zamiast ilosc
            return total + (cena * ilosc);
        }, 0);

        console.log('Obliczona suma zamówienia:', suma);

        // Tworzymy nowy rekord w tabeli Zamowienia
        const record = await base('Zamowienia').create([
            {
                fields: {
                    'Imie_Nazwisko': orderData.imie,
                    'Email': orderData.email,
                    'Telefon': orderData.telefon || '',
                    'Adres': orderData.adres || '',
                    'Produkty': JSON.stringify(orderData.produkty),
                    'Suma': suma, // <-- Teraz poprawnie obliczona
                    'Status': 'Nowe',
                    'Uwagi': orderData.uwagi || ''
                }
            }
        ]);

        console.log('Zamówienie utworzone, ID:', record[0].id);
        // POPRAWKA 2: Ulepszona aktualizacja stanów magazynowych
        try {
            for (const produkt of orderData.produkty) {
                if (!produkt.size && !produkt.rozmiar) {
                    console.error('Brak rozmiaru dla produktu:', produkt.id);
                    continue;
                }

                try {
                    // Pobieramy aktualny rekord produktu
                    const productRecord = await base('Produkty').find(produkt.id);
                    
                    // Pobieramy aktualny stan rozmiarów
                    let rozmiary_stan = {};
                    const stan_text = productRecord.get('Rozmiary_Stan');
                    
                    console.log(`Stan rozmiarów przed aktualizacją dla ${produkt.nazwa}:`, stan_text);
                    
                    if (stan_text) {
                        try {
                            rozmiary_stan = JSON.parse(stan_text);
                        } catch (parseError) {
                            console.error('Błąd parsowania JSON stanów:', parseError);
                            rozmiary_stan = {};
                        }
                    }
                    
                    // Używamy size lub rozmiar
                    const rozmiar = produkt.size || produkt.rozmiar;
                    const quantity = produkt.quantity || produkt.ilosc || 1;                    
                    // Aktualizujemy stan konkretnego rozmiaru
                    const currentStock = parseInt(rozmiary_stan[rozmiar]) || 0;
                    const newStock = Math.max(0, currentStock - quantity);
                    
                    rozmiary_stan[rozmiar] = newStock;
                    
                    console.log(`Aktualizacja: ${produkt.nazwa} rozmiar ${rozmiar}: ${currentStock} -> ${newStock}`);
                    
                    // Zapisujemy zaktualizowany JSON
                    const updateResult = await base('Produkty').update(produkt.id, {
                        'Rozmiary_Stan': JSON.stringify(rozmiary_stan)
                    });
                    
                    console.log(`Zaktualizowano produkt ${produkt.id}:`, updateResult.get('Rozmiary_Stan'));
                    
                } catch (stockError) {
                    console.error(`Błąd aktualizacji stanu produktu ${produkt.id}:`, stockError);
                    // Nie przerywamy procesu, kontynuujemy z innymi produktami
                }
            }
        } catch (stockUpdateError) {
            console.error('Błąd ogólny aktualizacji stanów:', stockUpdateError);
            // Zamówienie zostaje mimo błędu stanów
        }
        // Zwracamy sukces
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                orderNumber: record[0].get('Numer_Zamowienia') || record[0].id,
                orderId: record[0].id,
                message: 'Zamówienie zostało przyjęte!',
                suma: suma // Dodajemy sumę do odpowiedzi dla debugowania
            })
        };

    } catch (error) {
        console.error('Błąd tworzenia zamówienia:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Nie udało się utworzyć zamówienia',
                details: error.message 
            })
        };
    }
};