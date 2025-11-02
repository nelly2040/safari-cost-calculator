// International Tourist Rates (USD, breakdowns from spec)
const internationalRates = {
    'budget': { total: 140, breakdown: { accom: 70, parks: 50, transport: 20 } },
    'mid-range': { total: 300, breakdown: { accom: 180, parks: 70, transport: 50 } },
    'luxury': { total: 570, breakdown: { accom: 400, parks: 100, transport: 70 } }
};

// Local Resident Rates (USD, breakdowns from spec)
const residentRates = {
    'budget': { total: 70, breakdown: { accom: 40, parks: 15, transport: 15 } },
    'mid-range': { total: 130, breakdown: { accom: 75, parks: 20, transport: 35 } },
    'luxury': { total: 250, breakdown: { accom: 170, parks: 25, transport: 55 } }
};

// Seasonal multipliers
const seasons = {
    'high': { multiplier: 1.0, label: 'High Season (×1.0)' },
    'shoulder': { multiplier: 0.9, label: 'Shoulder Season (×0.9, 10% off)' },
    'low': { multiplier: 0.7, label: 'Low Season (×0.7, 30% off)' }
};

// Default/fallback currency rates (USD to target, as of Nov 1, 2025)
const fallbackCurrencies = {
    'USD': { rate: 1.00, symbol: '$' },
    'EUR': { rate: 0.92, symbol: '€' },
    'GBP': { rate: 0.77, symbol: '£' },
    'KES': { rate: 128.84, symbol: 'KSh' },
    'ZAR': { rate: 17.37, symbol: 'R' }
};

// Breakdown category labels & colors
const categories = {
    accom: { name: 'Accommodation & Meals', color: 'from-green-500 to-emerald-600' },
    parks: { name: 'Park Fees (KWS)', color: 'from-blue-500 to-cyan-600' },
    transport: { name: 'Transport', color: 'from-amber-500 to-orange-600' }
};

// Cache key for localStorage
const CACHE_KEY = 'safari_rates_cache';
const CACHE_DURATION = 3600000; // 1 hour in ms

// Fetch live rates from API
async function fetchExchangeRates() {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    }

    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('API unavailable');
        const data = await response.json();
        const rates = {
            'USD': { rate: 1.00, symbol: '$' },
            'EUR': { rate: data.rates.EUR, symbol: '€' },
            'GBP': { rate: data.rates.GBP, symbol: '£' },
            'KES': { rate: data.rates.KES, symbol: 'KSh' },
            'ZAR': { rate: data.rates.ZAR, symbol: 'R' }
        };
        // Cache it
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: rates, timestamp: Date.now() }));
        return rates;
    } catch (error) {
        console.warn('API fetch failed, using fallback:', error);
        alert('Using cached/fallback rates—API temporarily unavailable.');
        return fallbackCurrencies;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('safariForm');
    const resultsDiv = document.getElementById('results');
    const resetBtn = document.getElementById('resetBtn');
    const calcBtn = document.getElementById('calcBtn');

    let currentRates = fallbackCurrencies; // Default to fallback

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const visitorType = document.querySelector('input[name="visitorType"]:checked').value;
        const travelers = parseInt(document.getElementById('travelers').value);
        const days = parseInt(document.getElementById('days').value);
        const budgetLevel = document.getElementById('budgetLevel').value;
        const season = document.getElementById('season').value || 'high';
        const currency = document.getElementById('currency').value;

        if (!budgetLevel || travelers < 1 || days < 1 || !currency) {
            alert('Please fill all fields correctly!');
            return;
        }

        // Fetch live rates (async)
        calcBtn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>Fetching Rates & Calculating...';
        calcBtn.disabled = true;

        currentRates = await fetchExchangeRates();

        // Simulate quick "processing" after fetch
        await new Promise(resolve => setTimeout(resolve, 500));

        // Select rates based on visitor type
        const selectedRates = visitorType === 'resident' ? residentRates : internationalRates;
        const seasonMultiplier = seasons[season].multiplier;
        const currencyInfo = currentRates[currency];
        const visitorLabel = visitorType === 'resident' ? 'Local Resident Rates' : 'International Tourist Rates';

        // Base calculations in USD (before multipliers)
        const baseTotalUSD = selectedRates[budgetLevel].total * days * travelers;
        const baseBreakdownUSD = {};
        for (let key in selectedRates[budgetLevel].breakdown) {
            baseBreakdownUSD[key] = selectedRates[budgetLevel].breakdown[key] * days * travelers;
        }

        // Apply season multiplier
        const seasonAdjustedTotalUSD = baseTotalUSD * seasonMultiplier;
        const seasonAdjustedBreakdownUSD = {};
        for (let key in baseBreakdownUSD) {
            seasonAdjustedBreakdownUSD[key] = baseBreakdownUSD[key] * seasonMultiplier;
        }
        const adjustmentUSD = baseTotalUSD * (1 - seasonMultiplier); // Savings in USD

        // Convert to selected currency
        const totalCost = seasonAdjustedTotalUSD * currencyInfo.rate;
        const breakdown = {};
        for (let key in seasonAdjustedBreakdownUSD) {
            breakdown[key] = seasonAdjustedBreakdownUSD[key] * currencyInfo.rate;
        }
        const adjustment = adjustmentUSD * currencyInfo.rate; // Savings in selected currency

        // Generate enhanced results HTML
        let breakdownHTML = '';
        Object.keys(breakdown).forEach(key => {
            const cat = categories[key];
            const percentage = Math.round((breakdown[key] / totalCost) * 100);
            breakdownHTML += `
                <div class="flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 mb-3">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800">${cat.name}</p>
                    </div>
                    <div class="flex-1 mx-4">
                        <div class="bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div class="h-4 rounded-full bg-gradient-to-r ${cat.color} transition-all duration-700" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="w-24 text-right">
                        <p class="font-bold text-gray-900">${currencyInfo.symbol}${breakdown[key].toLocaleString()}</p>
                        <p class="text-sm text-gray-500">${percentage}%</p>
                    </div>
                </div>
            `;
        });

        const seasonLabel = seasons[season].label;
        const resultsHTML = `
            <div class="text-center mb-6 animate-fade-in">
                <h2 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">${currencyInfo.symbol}${totalCost.toLocaleString()}</h2>
                <p class="text-lg text-gray-600">Total Estimated Cost</p>
                <p class="text-sm text-gray-700 font-medium mt-1">${visitorLabel}</p>
                <p class="text-sm text-emerald-600 font-medium mt-1">${seasonLabel}</p>
                ${adjustment > 0 ? `<p class="text-sm text-green-600">Season Adjustment: -${currencyInfo.symbol}${adjustment.toLocaleString()} (Savings!)</p>` : ''}
                <p class="text-xs text-gray-400 mt-2">Live rates via ExchangeRate-API</p>
            </div>
            
            <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">Cost Breakdown</h3>
            <div class="grid gap-3">${breakdownHTML}</div>
            
            <div class="text-center mt-6 pt-4 border-t border-gray-200">
                <p class="text-sm text-gray-500 italic mb-3">This is a rough estimate. Actual costs may vary based on season, group size, and specifics.</p>
                <button type="button" id="hideResults" class="text-emerald-600 hover:text-emerald-800 underline text-sm font-medium transition-colors">Hide Breakdown</button>
            </div>
        `;

        resultsDiv.innerHTML = resultsHTML;
        resultsDiv.classList.remove('hidden');
        resultsDiv.classList.add('scale-100'); // Trigger animation
        resultsDiv.scrollIntoView({ behavior: 'smooth' });

        // Reset button state
        calcBtn.innerHTML = 'Calculate Costs';
        calcBtn.disabled = false;

        // Hide results handler
        document.getElementById('hideResults').addEventListener('click', function() {
            resultsDiv.classList.add('hidden', 'scale-95');
        });
    });

    // Reset
    resetBtn.addEventListener('click', function() {
        form.reset();
        document.querySelector('input[name="visitorType"][value="international"]').checked = true;
        document.getElementById('travelers').value = 2;
        document.getElementById('days').value = 5;
        document.getElementById('season').value = 'high';
        document.getElementById('budgetLevel').value = 'mid-range';
        document.getElementById('currency').value = 'USD';
        resultsDiv.classList.add('hidden', 'scale-95');
        // Clear cache if desired: localStorage.removeItem(CACHE_KEY);
        form.scrollIntoView({ behavior: 'smooth' });
    });
});