// Ta funkcja sprawdza czy produkt jest dostępny
// Wywoływana przed dodaniem do koszyka

const Airtable = require('airtable');

exports.handler = async (event, context) => {
    
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: 'Tylko metoda POST dozwolona' }) 
        };
    }

    try {
        // Pobieramy dane o produkcie do sprawdzenia
        const { productId, quantity } = JSON.parse(event.body);

        // Łączymy się z Airtable
        const base = new Airtable({
            apiKey: process.env.AIRTABLE_API_KEY
        }).base(process.env.AIRTABLE_BASE_ID);

        // Pobieramy konkretny produkt
        const record = await base('Produkty').find(productId);
        
        const currentStock = record.get('Stan_Magazynowy') || 0;
        const available = currentStock >= quantity;

        // Zwracamy informację czy jest dostępny
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                available: available,
                currentStock: currentStock,
                requestedQuantity: quantity,
                message: available ? 
                    'Produkt dostępny' : 
                    `Tylko ${currentStock} sztuk dostępnych`
            })
        };

    } catch (error) {
        console.error('Błąd sprawdzania stanu:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Nie udało się sprawdzić stanu magazynu' 
            })
        };
    }
};
