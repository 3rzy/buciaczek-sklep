// Ta funkcja aktualizuje stan magazynowy po zamówieniu
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
        // updates = [{ productId: 'xxx', quantity: 2 }, ...]

        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);

        // Dla każdego produktu w zamówieniu
        const updatePromises = updates.map(async (update) => {
            // Pobieramy aktualny stan
            const record = await base('Produkty').find(update.productId);
            const currentStock = record.get('Stan_Magazynowy') || 0;
            
            // Obliczamy nowy stan
            const newStock = Math.max(0, currentStock - update.quantity);
            
            // Aktualizujemy w Airtable
            return base('Produkty').update(update.productId, {
                'Stan_Magazynowy': newStock
            });
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
                message: 'Stan magazynowy zaktualizowany'
            })
        };

    } catch (error) {
        console.error('Błąd aktualizacji stanu:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Nie udało się zaktualizować stanu magazynu' 
            })
        };
    }
};
