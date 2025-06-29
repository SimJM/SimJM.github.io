//document.addEventListener("DOMContentLoaded", function () {
console.log("Loan calculator loaded");

const calculateBtn = document.getElementById("calculateLoanBtn");
const resultDiv = document.getElementById("loanResult");
const priceInput = document.getElementById("loanPrice");
const downPaymentInput = document.getElementById("downPayment");
const interestRateInput = document.getElementById("interestRate");
const loanPeriodInput = document.getElementById("loanPeriod");

// Add number formatting for price input
priceInput.addEventListener("input", function (e) {
	formatPriceInput(e.target);
});

// Add blur event to ensure proper formatting when user leaves the field
priceInput.addEventListener("blur", function (e) {
	formatPriceInput(e.target);
});

// Add input validation for down payment (0-100%)
downPaymentInput.addEventListener("input", function (e) {
	validatePercentageInput(e.target, 0, 100);
});

// Add input validation for interest rate (0-1000%)
interestRateInput.addEventListener("input", function (e) {
	validatePercentageInput(e.target, 0, 1000);
});

// Add input validation for loan period (1-100 years)
loanPeriodInput.addEventListener("input", function (e) {
	validateIntegerInput(e.target, 1, 100);
});

// ...existing code...lculator functionality

document.addEventListener("DOMContentLoaded", function () {
	console.log("Loan calculator loaded");

	const calculateBtn = document.getElementById("calculateLoanBtn");
	const resultDiv = document.getElementById("loanResult");
	const priceInput = document.getElementById("loanPrice");

	// Add number formatting for price input
	priceInput.addEventListener("input", function (e) {
		formatPriceInput(e.target);
	});

	// Add blur event to ensure proper formatting when user leaves the field
	priceInput.addEventListener("blur", function (e) {
		formatPriceInput(e.target);
	});

	// Add hover effect to button
	calculateBtn.addEventListener("mouseenter", function () {
		this.style.background = "#e84419";
	});

	calculateBtn.addEventListener("mouseleave", function () {
		this.style.background = "#f9532d";
	});

	// Add input validation and calculation
	calculateBtn.addEventListener("click", calculateLoan);

	// Allow Enter key to trigger calculation
	document.addEventListener("keypress", function (e) {
		if (e.key === "Enter") {
			calculateLoan();
		}
	});
});

// Format price input with comma separators
function formatPriceInput(input) {
	// Get the current cursor position
	const cursorPosition = input.selectionStart;

	// Remove all non-digit characters except decimal point
	let value = input.value.replace(/[^\d.]/g, "");

	// Limit to 12 digits (before decimal point)
	const decimalIndex = value.indexOf(".");
	if (decimalIndex !== -1) {
		const integerPart = value.substring(0, decimalIndex);
		const decimalPart = value.substring(decimalIndex + 1);

		// Limit integer part to 12 digits
		if (integerPart.length > 12) {
			value = integerPart.substring(0, 12) + "." + decimalPart;
		}

		// Prevent multiple decimal points
		value = integerPart + "." + decimalPart.replace(/\./g, "");
	} else {
		// Limit to 12 digits total if no decimal
		if (value.length > 12) {
			value = value.substring(0, 12);
		}
	}

	// Split into integer and decimal parts
	const parts = value.split(".");
	const integerPart = parts[0];
	const decimalPart = parts[1];

	// Add commas to integer part
	const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	// Reconstruct the value
	const formattedValue =
		decimalPart !== undefined
			? formattedInteger + "." + decimalPart
			: formattedInteger;

	// Update the input value
	input.value = formattedValue;

	// Calculate new cursor position accounting for added commas
	const originalLength = value.length;
	const newLength = formattedValue.length;
	const newCursorPosition = cursorPosition + (newLength - originalLength);

	// Restore cursor position
	if (document.activeElement === input) {
		input.setSelectionRange(newCursorPosition, newCursorPosition);
	}
}

// Validate percentage inputs with min/max limits
function validatePercentageInput(input, min, max) {
	let value = parseFloat(input.value);

	// If empty or not a number, allow it (will be validated later)
	if (input.value === "" || isNaN(value)) {
		return;
	}

	// Enforce min/max limits
	if (value < min) {
		input.value = min;
	} else if (value > max) {
		input.value = max;
	}

	// Limit decimal places to 2
	if (input.value.includes(".")) {
		const parts = input.value.split(".");
		if (parts[1].length > 2) {
			input.value = parseFloat(input.value).toFixed(2);
		}
	}
}

// Validate integer inputs with min/max limits
function validateIntegerInput(input, min, max) {
	let value = parseInt(input.value);

	// If empty or not a number, allow it (will be validated later)
	if (input.value === "" || isNaN(value)) {
		return;
	}

	// Enforce min/max limits
	if (value < min) {
		input.value = min;
	} else if (value > max) {
		input.value = max;
	}

	// Ensure it's an integer
	input.value = parseInt(input.value);
}

// Helper function to parse formatted price input
function parsePriceInput(input) {
	return parseFloat(input.value.replace(/,/g, "")) || 0;
}

function calculateLoan() {
	console.log("Calculating loan...");

	// Get input values
	const price = parsePriceInput(document.getElementById("loanPrice"));
	const downPaymentPercent = parseFloat(
		document.getElementById("downPayment").value
	);
	const annualInterestRate = parseFloat(
		document.getElementById("interestRate").value
	);
	const loanPeriodYears = parseInt(
		document.getElementById("loanPeriod").value
	);
	const resultDiv = document.getElementById("loanResult");

	// Validate inputs
	if (
		!validateInputs(
			price,
			downPaymentPercent,
			annualInterestRate,
			loanPeriodYears
		)
	) {
		showError("Please fill in all fields with valid values.");
		return;
	}

	try {
		// Calculate loan details
		const loanDetails = calculateLoanDetails(
			price,
			downPaymentPercent,
			annualInterestRate,
			loanPeriodYears
		);

		// Display results
		displayResults(loanDetails);
	} catch (error) {
		console.error("Calculation error:", error);
		showError(
			"An error occurred during calculation. Please check your inputs."
		);
	}
}

function validateInputs(price, downPayment, interestRate, loanPeriod) {
	if (isNaN(price) || price <= 0) {
		return false;
	}
	if (isNaN(downPayment) || downPayment < 0 || downPayment > 100) {
		return false;
	}
	if (isNaN(interestRate) || interestRate < 0) {
		return false;
	}
	if (isNaN(loanPeriod) || loanPeriod <= 0) {
		return false;
	}
	return true;
}

function calculateLoanDetails(
	price,
	downPaymentPercent,
	annualInterestRate,
	loanPeriodYears
) {
	// Calculate basic values
	const downPaymentAmount = price * (downPaymentPercent / 100);
	const loanAmount = price - downPaymentAmount;
	const monthlyInterestRate = annualInterestRate / 100 / 12;
	const totalPayments = loanPeriodYears * 12;

	// Calculate monthly payment using loan formula
	let monthlyPayment = 0;
	if (monthlyInterestRate > 0) {
		monthlyPayment =
			(loanAmount *
				(monthlyInterestRate *
					Math.pow(1 + monthlyInterestRate, totalPayments))) /
			(Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
	} else {
		// If no interest, just divide loan amount by number of payments
		monthlyPayment = loanAmount / totalPayments;
	}

	// Calculate totals
	const totalPaid = monthlyPayment * totalPayments;
	const totalInterest = totalPaid - loanAmount;

	return {
		price: price,
		downPaymentPercent: downPaymentPercent,
		downPaymentAmount: downPaymentAmount,
		loanAmount: loanAmount,
		monthlyPayment: monthlyPayment,
		totalPayments: totalPayments,
		totalPaid: totalPaid,
		totalInterest: totalInterest,
		annualInterestRate: annualInterestRate,
		loanPeriodYears: loanPeriodYears,
	};
}

function displayResults(loan) {
	const resultDiv = document.getElementById("loanResult");

	const html = `
		<h2 style="color: #f9532d; margin-bottom: 25px; border-bottom: 2px solid #f9532d; padding-bottom: 10px;">
			<i class="bx bx-chart"></i> Loan Summary
		</h2>
		
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
			<div class="summary-item">
				<h3 style="color: #333; margin-bottom: 8px; font-size: 1.1em;">Price</h3>
				<p style="font-size: 1.3em; font-weight: bold; color: #f9532d; margin: 0;">
					$${formatNumber(loan.price)}
				</p>
			</div>
			
			<div class="summary-item">
				<h3 style="color: #333; margin-bottom: 8px; font-size: 1.1em;">Down Payment</h3>
				<p style="font-size: 1.3em; font-weight: bold; color: #f9532d; margin: 0;">
					$${formatNumber(loan.downPaymentAmount)}
				</p>
				<p style="font-size: 0.9em; color: #666; margin: 0;">
					(${loan.downPaymentPercent}%)
				</p>
			</div>
		</div>
		
		<div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f9532d;">
			<h3 style="color: #333; margin-bottom: 15px; font-size: 1.2em;">
				<i class="bx bx-wallet"></i> Monthly Payment
			</h3>
			<p style="font-size: 2em; font-weight: bold; color: #f9532d; margin: 0; text-align: center;">
				$${formatNumber(loan.monthlyPayment)}
			</p>
		</div>
		
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
			<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
				<h4 style="color: #333; margin-bottom: 8px;">Loan Amount</h4>
				<p style="font-weight: bold; color: #666; margin: 0;">$${formatNumber(
					loan.loanAmount
				)}</p>
			</div>
			
			<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
				<h4 style="color: #333; margin-bottom: 8px;">Interest Rate</h4>
				<p style="font-weight: bold; color: #666; margin: 0;">${
					loan.annualInterestRate
				}% APR</p>
			</div>
			
			<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
				<h4 style="color: #333; margin-bottom: 8px;">Loan Term</h4>
				<p style="font-weight: bold; color: #666; margin: 0;">${
					loan.loanPeriodYears
				} years</p>
			</div>
			
			<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
				<h4 style="color: #333; margin-bottom: 8px;">Total Payments</h4>
				<p style="font-weight: bold; color: #666; margin: 0;">${loan.totalPayments}</p>
			</div>
		</div>
		
		<div style="border-top: 1px solid #ddd; padding-top: 20px;">
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
				<div style="text-align: center;">
					<h4 style="color: #333; margin-bottom: 8px;">Total Amount Paid</h4>
					<p style="font-size: 1.2em; font-weight: bold; color: #e84419; margin: 0;">
						$${formatNumber(loan.totalPaid)}
					</p>
				</div>
				
				<div style="text-align: center;">
					<h4 style="color: #333; margin-bottom: 8px;">Total Interest</h4>
					<p style="font-size: 1.2em; font-weight: bold; color: #e84419; margin: 0;">
						$${formatNumber(loan.totalInterest)}
					</p>
				</div>
			</div>
		</div>
		
		<div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
			<p style="margin: 0; font-size: 0.9em; color: #856404;">
				<i class="bx bx-info-circle"></i> 
				<strong>Note:</strong> This calculation is an estimate. Actual payments may vary based on additional fees, insurance, taxes, and lender terms.
			</p>
		</div>
	`;

	resultDiv.innerHTML = html;
	resultDiv.style.display = "block";

	// Smooth scroll to results
	resultDiv.scrollIntoView({behavior: "smooth", block: "nearest"});
}

function showError(message) {
	const resultDiv = document.getElementById("loanResult");

	resultDiv.innerHTML = `
		<div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
			<i class="bx bx-error"></i> 
			<strong>Error:</strong> ${message}
		</div>
	`;

	resultDiv.style.display = "block";
}

function formatNumber(num) {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(num);
}

// Initialize on window load as well
window.initLoanPage = function () {
	console.log("Loan page initialized");
};
