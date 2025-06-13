// Simple test to verify API is working
import fetch from 'node-fetch';

async function testAPI() {
    try {
        console.log('🧪 Testing API with Tesla article...');
        
        const response = await fetch('http://localhost:3000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                articleText: 'Tesla announces breakthrough battery technology that will revolutionize electric vehicles. The company expects significant growth and plans to expand manufacturing.'
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            console.error('❌ API Error:', result.error);
            console.error('📄 Details:', result.details);
            if (result.rawResponse) {
                console.error('🔍 Raw response:', result.rawResponse);
            }
        } else {
            console.log('✅ API Success!');
            console.log('📊 Found', result.analysis.length, 'companies:');
            result.analysis.forEach(company => {
                console.log(`  • ${company.stock_symbol}: ${company.company_name} (${company.recommendation})`);
            });
        }
        
    } catch (error) {
        console.error('💥 Test failed:', error.message);
    }
}

testAPI(); 