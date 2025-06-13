const yahooFinance = require('yahoo-finance2').default;

async function getStockData() {
    try {
        // Get historical data for BBCA.JK for the past month
        const data = await yahooFinance.historical('BBCA.JK', {
            period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            period2: new Date(), // today
            interval: '1d'
        });
        
        // Get the last 5 entries and display Open, Close, Volume
        const lastFiveEntries = data.slice(-5);
        console.log('Name\t\tDate\t\tOpen\t\tClose\t\tVolume');
        console.log('='.repeat(60));
        lastFiveEntries.forEach(entry => {
            const date = entry.date.toISOString().split('T')[0];
            console.log(`BBCA.JK\t${date}\t${entry.open.toFixed(2)}\t\t${entry.close.toFixed(2)}\t\t${entry.volume}`);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

getStockData();