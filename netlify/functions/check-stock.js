// POPRAWIONA FUNKCJA check-stock.js
// Sprawdza dostępność konkretnego rozmiaru produktu

const Airtable = require('airtable');

exports.handler = async (event, context) => {
    
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Tylko metoda POST dozwolona' }) 
        };
    }

    try {
        // Pobieramy dane do sprawdzenia
        const { productId, quantity, size } = JSON.parse(event.body);

        if (!productId || !size) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: 'Brakuje productId lub size' 
                })
            };
        }

        // Łączymy się z Airtable
        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);
        // Pobieramy produkt
        const record = await base('Produkty').find(productId);
        
        // Pobieramy stany rozmiarów
        let rozmiary_stan = {};
        const stan_text = record.get('Rozmiary_Stan');
        
        if (stan_text) {
            try {
                rozmiary_stan = JSON.parse(stan_text);
            } catch (e) {
                console.error('Błąd parsowania stanów:', e);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ 
                        error: 'Błąd odczytu stanów magazynowych' 
                    })
                };
            }
        }
        
        // Sprawdzamy dostępność konkretnego rozmiaru
        const currentStock = parseInt(rozmiary_stan[size]) || 0;
        const requestedQty = parseInt(quantity) || 1;
        const available = currentStock >= requestedQty;

        // Zwracamy informację
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },            body: JSON.stringify({
                available: available,
                currentStock: currentStock,
                requestedQuantity: requestedQty,
                size: size,
                message: available ? 
                    'Rozmiar dostępny' : 
                    `Tylko ${currentStock} sztuk rozmiaru ${size} dostępnych`
            })
        };

    } catch (error) {
        console.error('Błąd sprawdzania stanu:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Nie udało się sprawdzić stanu magazynu',
                details: error.message
            })
        };
    }
};