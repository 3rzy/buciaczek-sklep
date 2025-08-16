// Ta funkcja aktualizuje stan magazynowy konkretnego rozmiaru
// Wywoływana po potwierdzeniu zamówienia

const Airtable = require('airtable');

exports.handler = async (event, context) => {
    
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Tylko metoda POST dozwolona' }) 
        };
    }

    try {
        // Pobieramy dane o produktach do aktualizacji
        const { updates } = JSON.parse(event.body);
        // updates = [{ productId: 'xxx', rozmiar: '32', quantity: 1 }, ...]

        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);

        // Dla każdego produktu w zamówieniu
        const updatePromises = updates.map(async (update) => {
            try {
                // Pobieramy aktualny rekord produktu
                const record = await base('Produkty').find(update.productId);
                
                // Pobieramy aktualny stan rozmiarów
                let rozmiary_stan = {};
                try {
                    const stan_text = record.get('Rozmiary_Stan') || '{}';
                    rozmiary_stan = JSON.parse(stan_text);
                } catch (error) {
                    console.log('Błąd parsowania stanów rozmiarów, tworzę nowy obiekt');
                    rozmiary_stan = {};
                }
                
                // Aktualizujemy stan konkretnego rozmiaru
                const currentStock = rozmiary_stan[update.rozmiar] || 0;
                const newStock = Math.max(0, currentStock - update.quantity);
                rozmiary_stan[update.rozmiar] = newStock;
                
                // Zapisujemy zaktualizowany JSON do Airtable
                return base('Produkty').update(update.productId, {
                    'Rozmiary_Stan': JSON.stringify(rozmiary_stan)
                });
                
            } catch (error) {
                console.error(`Błąd aktualizacji produktu ${update.productId}:`, error);
                throw error;
            }
        });

        // Czekamy aż wszystkie aktualizacje się zakończą
        await Promise.all(updatePromises);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                message: 'Stany rozmiarów zaktualizowane',
                updatedItems: updates.length
            })
        };

    } catch (error) {
        console.error('Błąd aktualizacji stanów rozmiarów:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Nie udało się zaktualizować stanów rozmiarów',
                details: error.message 
            })
        };
    }
};
