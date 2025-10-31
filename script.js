// Hardcoded daily rates per person (business rules)
const rates = {
    'budget': { total: 100, breakdown: { accom: 60, parks: 30, transport: 10 } },
    'mid-range': { total: 250, breakdown: { accom: 150, parks: 70, transport: 30 } },
    'luxury': { total: 500, breakdown: { accom: 350, parks: 100, transport: 50 } }
};

// Breakdown category labels & colors
const categories = {
    accom: { name: 'Accommodation & Meals', color: 'from-green-500 to-emerald-600' },
    parks: { name: 'Park Fees', color: 'from-blue-500 to-cyan-600' },
    transport: { name: 'Transport', color: 'from-amber-500 to-orange-600' }
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('safariForm');
    const resultsDiv = document.getElementById('results');
    const resetBtn = document.getElementById('resetBtn');
    const calcBtn = document.getElementById('calcBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const travelers = parseInt(document.getElementById('travelers').value);
        const days = parseInt(document.getElementById('days').value);
        const budgetLevel = document.getElementById('budgetLevel').value;

        if (!budgetLevel || travelers < 1 || days < 1) {
            alert('Please fill all fields correctly!');
            return;
        }

        // Show loading state
        calcBtn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>Calculating...';
        calcBtn.disabled = true;

        // Simulate quick "processing" (remove in prod if instant)
        await new Promise(resolve => setTimeout(resolve, 800));

        const selectedRates = rates[budgetLevel];
        const totalCost = selectedRates.total * days * travelers;
        const breakdown = {};
        for (let key in selectedRates.breakdown) {
            breakdown[key] = selectedRates.breakdown[key] * days * travelers;
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

        const resultsHTML = `
            <div class="text-center mb-6 animate-fade-in">
                <h2 class="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">$${totalCost.toLocaleString()}</h2>
                <p class="text-lg text-gray-600">Total Estimated Cost</p>
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
        document.getElementById('travelers').value = 2;
        document.getElementById('days').value = 5;
        resultsDiv.classList.add('hidden', 'scale-95');
        form.scrollIntoView({ behavior: 'smooth' });
    });
});