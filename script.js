// International Tourist Rates (USD, breakdowns from spec)
const internationalRates = {
    'budget': { total: 140, breakdown: { accom: 70, parks: 50, transport: 20 } },
    'mid-range': { total: 300, breakdown: { accom: 180, parks: 70, transport: 50 } },
    'luxury': { total: 570, breakdown: { accom: 400, parks: 100, transport: 70 } } // Sum of breakdown
};

// Local Resident Rates (USD, breakdowns from spec)
const residentRates = {
    'budget': { total: 70, breakdown: { accom: 40, parks: 15, transport: 15 } },
    'mid-range': { total: 130, breakdown: { accom: 75, parks: 20, transport: 35 } },
    'luxury': { total: 250, breakdown: { accom: 170, parks: 25, transport: 55 } } // Sum of breakdown
};

// Seasonal multipliers
const seasons = {
    'high': { multiplier: 1.0, label: 'High Season (×1.0)' },
    'shoulder': { multiplier: 0.9, label: 'Shoulder Season (×0.9, 10% off)' },
    'low': { multiplier: 0.7, label: 'Low Season (×0.7, 30% off)' }
};

// Breakdown category labels & colors
const categories = {
    accom: { name: 'Accommodation & Meals', color: 'from-green-500 to-emerald-600' },
    parks: { name: 'Park Fees (KWS)', color: 'from-blue-500 to-cyan-600' },
    transport: { name: 'Transport', color: 'from-amber-500 to-orange-600' }
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('safariForm');
    const resultsDiv = document.getElementById('results');
    const resetBtn = document.getElementById('resetBtn');
    const calcBtn = document.getElementById('calcBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const visitorType = document.querySelector('input[name="visitorType"]:checked').value;
        const travelers = parseInt(document.getElementById('travelers').value);
        const days = parseInt(document.getElementById('days').value);
        const budgetLevel = document.getElementById('budgetLevel').value;
        const season = document.getElementById('season').value || 'high';

        if (!budgetLevel || travelers < 1 || days < 1) {
            alert('Please fill all fields correctly!');
            return;
        }

        // Show loading state
        calcBtn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>Calculating...';
        calcBtn.disabled = true;

        // Simulate quick "processing"
        await new Promise(resolve => setTimeout(resolve, 800));

        // Select rates based on visitor type
        const selectedRates = visitorType === 'resident' ? residentRates : internationalRates;
        const seasonMultiplier = seasons[season].multiplier;
        const visitorLabel = visitorType === 'resident' ? 'Local Resident Rates' : 'International Tourist Rates';

        // Base calculations (before multiplier)
        const baseTotal = selectedRates[budgetLevel].total * days * travelers;
        const baseBreakdown = {};
        for (let key in selectedRates[budgetLevel].breakdown) {
            baseBreakdown[key] = selectedRates[budgetLevel].breakdown[key] * days * travelers;
        }

        // Apply multiplier to total and breakdown
        const totalCost = baseTotal * seasonMultiplier;
        const adjustment = baseTotal * (1 - seasonMultiplier); // Savings amount
        const breakdown = {};
        for (let key in baseBreakdown) {
            breakdown[key] = baseBreakdown[key] * seasonMultiplier;
        }

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
                        <p class="font-bold text-gray-900">$${breakdown[key].toLocaleString()}</p>
                        <p class="text-sm text-gray-500">${percentage}%</p>
                    </div>
                </div>
            `;
        });

        const seasonLabel = seasons[season].label;
        const resultsHTML = `
            <div class="text-center mb-6 animate-fade-in">
                <h2 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">$${totalCost.toLocaleString()}</h2>
                <p class="text-lg text-gray-600">Total Estimated Cost</p>
                <p class="text-sm text-gray-700 font-medium mt-1">${visitorLabel}</p>
                <p class="text-sm text-emerald-600 font-medium mt-1">${seasonLabel}</p>
                ${adjustment > 0 ? `<p class="text-sm text-green-600">Season Adjustment: -$${adjustment.toLocaleString()} (Savings!)</p>` : ''}
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
        document.getElementById('season').value = 'high'; // Default season
        document.getElementById('budgetLevel').value = 'mid-range'; // Default to mid-range
        resultsDiv.classList.add('hidden', 'scale-95');
        form.scrollIntoView({ behavior: 'smooth' });
    });
});