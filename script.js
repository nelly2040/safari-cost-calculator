// Hardcoded daily rates per person (business rules)
const rates = {
    'budget': { total: 100, breakdown: { accom: 60, parks: 30, transport: 10 } },
    'mid-range': { total: 250, breakdown: { accom: 150, parks: 70, transport: 30 } },
    'luxury': { total: 500, breakdown: { accom: 350, parks: 100, transport: 50 } }
};

// Breakdown category labels
const categories = {
    accom: 'Accommodation & Meals',
    parks: 'Park Fees',
    transport: 'Transport'
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('safariForm');
    const resultsDiv = document.getElementById('results');

    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent page reload

        // Get input values
        const travelers = parseInt(document.getElementById('travelers').value);
        const days = parseInt(document.getElementById('days').value);
        const budgetLevel = document.getElementById('budgetLevel').value;

        if (!budgetLevel) {
            alert('Please select a budget level!');
            return;
        }

        // Get rates for selected level
        const selectedRates = rates[budgetLevel];

        // Calculations
        const totalCost = selectedRates.total * days * travelers;
        const accomCost = selectedRates.breakdown.accom * days * travelers;
        const parksCost = selectedRates.breakdown.parks * days * travelers;
        const transportCost = selectedRates.breakdown.transport * days * travelers;

        // Generate results HTML with bar chart
        const resultsHTML = `
            <h2 class="text-3xl font-bold text-center mb-6 text-green-700">$${totalCost.toLocaleString()}</h2>
            <p class="text-center text-gray-600 mb-6">Total Estimated Cost</p>
            
            <h3 class="text-lg font-semibold mb-4 text-gray-800">Cost Breakdown</h3>
            <div class="space-y-4 mb-6">
                <div class="flex items-center justify-between">
                    <span class="w-1/2">${categories.accom}</span>
                    <div class="w-1/2 bg-gray-200 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: ${(accomCost / totalCost) * 100}%"></div>
                    </div>
                    <span class="w-1/4 text-right">$${accomCost.toLocaleString()}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="w-1/2">${categories.parks}</span>
                    <div class="w-1/2 bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${(parksCost / totalCost) * 100}%"></div>
                    </div>
                    <span class="w-1/4 text-right">$${parksCost.toLocaleString()}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="w-1/2">${categories.transport}</span>
                    <div class="w-1/2 bg-gray-200 rounded-full h-2">
                        <div class="bg-yellow-500 h-2 rounded-full" style="width: ${(transportCost / totalCost) * 100}%"></div>
                    </div>
                    <span class="w-1/4 text-right">$${transportCost.toLocaleString()}</span>
                </div>
            </div>
            <hr class="my-4 border-gray-300">
            <div class="flex justify-between font-bold text-xl text-gray-800">
                <span>Grand Total</span>
                <span>$${totalCost.toLocaleString()}</span>
            </div>
            <p class="text-sm text-gray-500 text-center mt-6 italic">This is a rough estimate. Actual costs may vary based on season, group size, and specifics.</p>
        `;

        // Update and show results
        resultsDiv.innerHTML = resultsHTML;
        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    });
});