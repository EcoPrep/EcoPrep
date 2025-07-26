document.addEventListener('DOMContentLoaded', function() {
    // Configurar validación de inputs
    setupInputValidation();
    
    // Investment Calculator
    const investmentForm = document.getElementById('investment-form');
    if (investmentForm) {
        investmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateInvestment();
        });
    }
    
    // Loan Calculator
    const loanForm = document.getElementById('loan-form');
    if (loanForm) {
        loanForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateLoan();
        });
    }
    
    // Set default date to today
    const startDateInput = document.getElementById('start-date');
    if (startDateInput) {
        const today = new Date().toISOString().split('T')[0];
        startDateInput.value = today;
    }
});

function setupInputValidation() {
    // Seleccionar todos los inputs numéricos
    const numericInputs = document.querySelectorAll('input[type="number"]');
    
    numericInputs.forEach(input => {
        // Permitir punto decimal
        input.addEventListener('keydown', function(e) {
            // Permitir: backspace, delete, tab, escape, enter, punto decimal
            if ([46, 8, 9, 27, 13, 110, 190].includes(e.keyCode) ||
                // Permitir: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Permitir: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            
            // Asegurar que es un número y no se presiona más de un punto decimal
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                if (e.keyCode !== 190 || input.value.includes('.')) {
                    e.preventDefault();
                }
            }
        });
        
        // Validar el valor al perder el foco
        input.addEventListener('blur', function() {
            const value = parseFloat(input.value);
            const maxValue = 1000000000000; // 1 billón
            
            if (isNaN(value) || value < 0) {
                input.value = '';
                alert('Por favor ingrese un valor numérico positivo');
            } else if (value > maxValue) {
                input.value = maxValue.toFixed(2);
                alert(`El valor máximo permitido es ${formatCurrency(maxValue)}`);
            } else if (input.value.includes('.')) {
                // Redondear a 2 decimales si es necesario
                const decimalCount = input.value.split('.')[1]?.length || 0;
                if (decimalCount > 2) {
                    input.value = parseFloat(input.value).toFixed(2);
                }
            }
        });
    });
}

function calculateInvestment() {
    // Validar inputs antes de calcular
    const initialAmount = validateInput('initial-amount', 0, 1000000000000);
    const monthlyContribution = validateInput('monthly-contribution', 0, 1000000000000);
    const annualRate = validateInput('annual-rate', 0, 100);
    const years = validateInput('years', 1, 100);
    const compoundFrequency = validateInput('compound-frequency', 1, 365);
    const taxRate = validateInput('tax-rate', 0, 100);
    const inflationRate = validateInput('inflation-rate', 0, 100);
    
    if (initialAmount === null || monthlyContribution === null || annualRate === null || 
        years === null || compoundFrequency === null || taxRate === null || inflationRate === null) {
        return; // No calcular si hay errores de validación
    }
    
    // Calculate periodic rate
    const periodicRate = annualRate / 100 / compoundFrequency;
    const periods = years * compoundFrequency;
    
    // Calculate future value
    let futureValue = initialAmount * Math.pow(1 + periodicRate, periods);
    
    // Add monthly contributions
    if (monthlyContribution > 0) {
        const monthlyRate = annualRate / 100 / 12;
        const monthlyPeriods = years * 12;
        futureValue += monthlyContribution * ((Math.pow(1 + monthlyRate, monthlyPeriods) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    
    // Calculate total contributed
    const totalContributed = initialAmount + (monthlyContribution * years * 12);
    
    // Calculate earnings (before taxes)
    const earnings = futureValue - totalContributed;
    
    // Apply taxes if any
    const taxes = earnings * (taxRate / 100);
    const afterTaxValue = futureValue - taxes;
    
    // Calculate inflation adjusted value
    const inflationAdjustedValue = afterTaxValue / Math.pow(1 + (inflationRate / 100), years);
    
    // Display results
    document.getElementById('final-amount').textContent = formatCurrency(afterTaxValue);
    document.getElementById('earnings').textContent = formatCurrency(earnings);
    document.getElementById('total-contributed').textContent = formatCurrency(totalContributed);
    document.getElementById('inflation-adjusted').textContent = formatCurrency(inflationAdjustedValue);
    
    // Generate yearly projection
    generateYearlyProjection(initialAmount, monthlyContribution, annualRate, years, taxRate);
    
    // Generate chart
    generateInvestmentChart(initialAmount, monthlyContribution, annualRate, years);
}

function validateInput(id, min, max) {
    const input = document.getElementById(id);
    const value = parseFloat(input.value);
    
    if (isNaN(value) || value < min) {
        alert(`Por favor ingrese un valor válido para ${input.placeholder || id}. Mínimo: ${min}`);
        input.focus();
        return null;
    }
    
    if (value > max) {
        alert(`El valor máximo permitido para ${input.placeholder || id} es ${max}`);
        input.value = max;
        return max;
    }
    
    return value;
}

function generateYearlyProjection(initial, monthly, rate, years, taxRate) {
    const tableBody = document.getElementById('yearly-results');
    tableBody.innerHTML = '';
    
    let balance = initial;
    const monthlyRate = rate / 100 / 12;
    const annualRate = rate / 100;
    
    for (let year = 1; year <= years; year++) {
        let yearlyContributions = 0;
        let yearlyInterest = 0;
        
        // Calculate monthly for the year
        for (let month = 1; month <= 12; month++) {
            if (monthly > 0) {
                balance += monthly;
                yearlyContributions += monthly;
            }
            
            const monthlyInterest = balance * monthlyRate;
            balance += monthlyInterest;
            yearlyInterest += monthlyInterest;
        }
        
        // Apply taxes at the end of each year if specified
        if (taxRate > 0) {
            const taxableEarnings = balance - initial - (yearlyContributions * year);
            const taxes = taxableEarnings * (taxRate / 100);
            balance -= taxes;
            yearlyInterest -= taxes;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>${formatCurrency(balance - yearlyContributions - yearlyInterest)}</td>
            <td>${formatCurrency(yearlyContributions)}</td>
            <td>${formatCurrency(yearlyInterest)}</td>
            <td>${formatCurrency(balance)}</td>
        `;
        tableBody.appendChild(row);
    }
}

function generateInvestmentChart(initial, monthly, rate, years) {
    const ctx = document.getElementById('investment-chart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.investmentChart) {
        window.investmentChart.destroy();
    }
    
    // Prepare data
    const labels = [];
    const balanceData = [];
    const contributionData = [];
    
    let balance = initial;
    const monthlyRate = rate / 100 / 12;
    
    for (let year = 0; year <= years; year++) {
        labels.push(`Año ${year}`);
        balanceData.push(balance);
        contributionData.push(initial + (monthly * 12 * year));
        
        if (year < years) {
            for (let month = 1; month <= 12; month++) {
                if (monthly > 0) {
                    balance += monthly;
                }
                balance += balance * monthlyRate;
            }
        }
    }
    
    window.investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Saldo Total',
                    data: balanceData,
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'Total Aportado',
                    data: contributionData,
                    borderColor: '#4299e1',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    fill: true,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Proyección de Inversión'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function calculateLoan() {
    // Validar inputs antes de calcular
    const loanAmount = validateInput('loan-amount', 1, 1000000000000);
    const interestRate = validateInput('interest-rate', 0, 100);
    let loanTerm = validateInput('loan-term', 1, 100);
    const termType = document.getElementById('term-type').value;
    const paymentFrequency = validateInput('payment-frequency', 1, 365);
    
    if (loanAmount === null || interestRate === null || loanTerm === null || paymentFrequency === null) {
        return; // No calcular si hay errores de validación
    }
    
    // Convert term to months if in years
    if (termType === '1') {
        loanTerm *= 12;
    }
    
    // Adjust term based on payment frequency
    const totalPayments = Math.ceil(loanTerm * (12 / paymentFrequency));
    
    // Calculate periodic interest rate
    const periodicRate = (interestRate / 100) / paymentFrequency;
    
    // Calculate payment amount
    let paymentAmount;
    if (periodicRate === 0) {
        paymentAmount = loanAmount / totalPayments;
    } else {
        paymentAmount = loanAmount * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / (Math.pow(1 + periodicRate, totalPayments) - 1);
    }
    
    // Calculate total payment and total interest
    const totalPayment = paymentAmount * totalPayments;
    const totalInterest = totalPayment - loanAmount;
    
    // Calculate end date
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(startDate);
    const monthsToAdd = Math.ceil(totalPayments / (12 / paymentFrequency));
    endDate.setMonth(endDate.getMonth() + monthsToAdd);
    
    // Display results
    document.getElementById('periodic-payment').textContent = formatCurrency(paymentAmount);
    document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
    document.getElementById('total-payment').textContent = formatCurrency(totalPayment);
    document.getElementById('end-date').textContent = formatDate(endDate);
    
    // Generate amortization table
    generateAmortizationTable(loanAmount, paymentAmount, periodicRate, totalPayments, startDate, paymentFrequency);
    
    // Generate chart
    generateLoanChart(loanAmount, totalInterest);
}

function generateAmortizationTable(loanAmount, paymentAmount, periodicRate, totalPayments, startDate, paymentFrequency) {
    const tableBody = document.getElementById('amortization-table');
    tableBody.innerHTML = '';
    
    let balance = loanAmount;
    let paymentDate = new Date(startDate);
    
    // Calculate months between payments
    const monthsBetweenPayments = 12 / paymentFrequency;
    
    for (let paymentNum = 1; paymentNum <= totalPayments; paymentNum++) {
        // Calculate interest and principal for this payment
        const interest = balance * periodicRate;
        const principal = paymentAmount - interest;
        
        // Update balance
        balance -= principal;
        if (balance < 0.01) balance = 0; // Handle rounding errors
        
        // Format payment date
        paymentDate.setMonth(paymentDate.getMonth() + monthsBetweenPayments);
        const formattedDate = formatDate(paymentDate);
        
        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${paymentNum}</td>
            <td>${formattedDate}</td>
            <td>${formatCurrency(paymentAmount)}</td>
            <td>${formatCurrency(principal)}</td>
            <td>${formatCurrency(interest)}</td>
            <td>${formatCurrency(balance)}</td>
        `;
        tableBody.appendChild(row);
    }
}

function generateLoanChart(principal, totalInterest) {
    const ctx = document.getElementById('loan-chart').getContext('2d');
    
    // Destroy previous chart if exists
    if (window.loanChart) {
        window.loanChart.destroy();
    }
    
    window.loanChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal', 'Interés'],
            datasets: [{
                data: [principal, totalInterest],
                backgroundColor: [
                    '#4299e1',
                    '#48bb78'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Composición del Préstamo'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return '--/--/----';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}