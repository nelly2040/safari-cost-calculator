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

        // Generate results HTML
        const resultsHTML = `
            <h2 class="text-2xl font-bold text-center mb-4 text-green-700">Estimated Total: $${totalCost.toLocaleString()}</h2>
            <div class="space-y-3">
                <div class="flex justify-between">
                    <span>${categories.accom}:</span>
                    <span>$${accomCost.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                    <span>${categories.parks}:</span>
                    <span>$${parksCost.toLocaleString()}</span>
                </div>
                <div class="flex justify-between">
                    <span>${categories.transport}:</span>
                    <span>$${transportCost.toLocaleString()}</span>
                </div>
                <hr class="my-2 border-gray-300">
                <div class="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>$${totalCost.toLocaleString()}</span>
                </div>
            </div>
            <p class="text-sm text-gray-500 text-center mt-4 italic">This is an estimate. Actual costs may vary based on season, group size, and specifics.</p>
        `;

        // Update and show results
        resultsDiv.innerHTML = resultsHTML;
        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    });
});