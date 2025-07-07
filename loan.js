document.addEventListener("DOMContentLoaded", function () {
	console.log("Loan calculator loaded");

	const calculateBtn = document.getElementById("calculateLoanBtn");
	const earlyRepaymentBtn = document.getElementById(
		"calculateEarlyRepaymentBtn"
	);
	const resultDiv = document.getElementById("loanResult");
	const earlyRepaymentSection = document.getElementById(
		"earlyRepaymentSection"
	);
	const earlyRepaymentResult = document.getElementById(
		"earlyRepaymentResult"
	);
	const priceInput = document.getElementById("loanPrice");
	const downPaymentInput = document.getElementById("downPayment");
	const interestRateInput = document.getElementById("interestRate");
	const loanPeriodInput = document.getElementById("loanPeriod");
	const currentLoanBalanceInput =
		document.getElementById("currentLoanBalance");
	const extraPaymentInput = document.getElementById("extraPayment");
	const lumpSumPaymentInput = document.getElementById("lumpSumPayment");
	const monthsPaidInput = document.getElementById("monthsPaid");

	// Add number formatting for price and early repayment inputs
	priceInput.addEventListener("input", function (e) {
		formatPriceInput(e.target);
	});

	currentLoanBalanceInput.addEventListener("input", function (e) {
		formatPriceInput(e.target);
		// Clear auto-calculated styling when user manually edits
		e.target.style.backgroundColor = "";
		e.target.title = "";
	});

	extraPaymentInput.addEventListener("input", function (e) {
		formatPriceInput(e.target);
	});

	lumpSumPaymentInput.addEventListener("input", function (e) {
		formatPriceInput(e.target);
	});

	// Add blur events
	priceInput.addEventListener("blur", function (e) {
		formatPriceInput(e.target);
	});

	currentLoanBalanceInput.addEventListener("blur", function (e) {
		formatPriceInput(e.target);
	});

	extraPaymentInput.addEventListener("blur", function (e) {
		formatPriceInput(e.target);
	});

	lumpSumPaymentInput.addEventListener("blur", function (e) {
		formatPriceInput(e.target);
	});

	// Add input validation
	downPaymentInput.addEventListener("input", function (e) {
		validatePercentageInput(e.target, 0, 100);
	});

	interestRateInput.addEventListener("input", function (e) {
		validatePercentageInput(e.target, 0, 1000);
	});

	loanPeriodInput.addEventListener("input", function (e) {
		validateIntegerInput(e.target, 1, 100);
	});

	monthsPaidInput.addEventListener("input", function (e) {
		validateIntegerInput(e.target, 0, 1200);
	});

	// Auto-calculate loan balance when months paid changes
	monthsPaidInput.addEventListener("input", function (e) {
		autoCalculateLoanBalance();
	});

	monthsPaidInput.addEventListener("blur", function (e) {
		autoCalculateLoanBalance();
	});

	// Add hover effects
	calculateBtn.addEventListener("mouseenter", function () {
		this.style.background = "#e84419";
	});

	calculateBtn.addEventListener("mouseleave", function () {
		this.style.background = "#f9532d";
	});

	earlyRepaymentBtn.addEventListener("mouseenter", function () {
		this.style.background = "#218838";
	});

	earlyRepaymentBtn.addEventListener("mouseleave", function () {
		this.style.background = "#28a745";
	});

	// Add event listeners
	calculateBtn.addEventListener("click", function () {
		// Reset Early Repayment Calculator first
		resetEarlyRepaymentCalculator();

		// Then calculate the new loan
		calculateLoan();

		// Show early repayment section after main calculation
		earlyRepaymentSection.style.display = "block";
	});

	earlyRepaymentBtn.addEventListener("click", calculateEarlyRepayment);

	// Allow Enter key to trigger calculation
	document.addEventListener("keypress", function (e) {
		if (e.key === "Enter") {
			if (document.activeElement.closest("#earlyRepaymentSection")) {
				calculateEarlyRepayment();
			} else {
				// Reset Early Repayment Calculator first
				resetEarlyRepaymentCalculator();

				// Then calculate the new loan
				calculateLoan();

				// Show early repayment section after main calculation
				earlyRepaymentSection.style.display = "block";
			}
		}
	});
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

// Add input validation for months paid
const monthsPaidInput = document.getElementById("monthsPaid");
monthsPaidInput.addEventListener("input", function (e) {
	validateIntegerInput(e.target, 0, 1200); // Up to 100 years
});

// Add hover effects
calculateBtn.addEventListener("mouseenter", function () {
	this.style.background = "#e84419";
});

calculateBtn.addEventListener("mouseleave", function () {
	this.style.background = "#f9532d";
});

earlyRepaymentBtn.addEventListener("mouseenter", function () {
	this.style.background = "#218838";
});

earlyRepaymentBtn.addEventListener("mouseleave", function () {
	this.style.background = "#28a745";
});

// Add event listeners
calculateBtn.addEventListener("click", calculateLoan);
earlyRepaymentBtn.addEventListener("click", calculateEarlyRepayment);

// Allow Enter key to trigger calculation
document.addEventListener("keypress", function (e) {
	if (e.key === "Enter") {
		if (document.activeElement.closest("#earlyRepaymentSection")) {
			calculateEarlyRepayment();
		} else {
			calculateLoan();
			earlyRepaymentSection.style.display = "block";
		}
	}
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
	const investment = calculateInvestmentAnalysis(loan);

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
		
		<div style="border-top: 1px solid #ddd; padding-top: 20px; margin-bottom: 25px;">
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

		<!-- Investment Analysis Section -->
		<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
			<h3 style="color: #333; margin-bottom: 15px; font-size: 1.2em;">
				<i class="bx bx-trending-up"></i> Investment Analysis
			</h3>
			
			<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
				<div style="text-align: center;">
					<h4 style="color: #333; margin-bottom: 8px; font-size: 0.95em;">Total Cash Invested</h4>
					<p style="font-weight: bold; color: #28a745; margin: 0; font-size: 1.1em;">
						$${formatNumber(investment.totalCashInvested)}
					</p>
					<p style="font-size: 0.8em; color: #666; margin: 0;">
						Down payment + loan payments
					</p>
				</div>
				
				<div style="text-align: center;">
					<h4 style="color: #333; margin-bottom: 8px; font-size: 0.95em;">Investment Efficiency</h4>
					<p style="font-weight: bold; color: #28a745; margin: 0; font-size: 1.1em;">
						${investment.investmentEfficiencyRatio.toFixed(2)}x
					</p>
					<p style="font-size: 0.8em; color: #666; margin: 0;">
						Property value per $1 invested
					</p>
				</div>
				
				<div style="text-align: center;">
					<h4 style="color: #333; margin-bottom: 8px; font-size: 0.95em;">Leverage Ratio</h4>
					<p style="font-weight: bold; color: #28a745; margin: 0; font-size: 1.1em;">
						${investment.leverageRatio.toFixed(1)}:1
					</p>
					<p style="font-size: 0.8em; color: #666; margin: 0;">
						Loan to down payment
					</p>
				</div>
			</div>
			
			<div style="background: rgba(255,255,255,0.3); padding: 15px; border-radius: 6px;">
				<h4 style="color: #333; margin-bottom: 10px; font-size: 1em;">Cash Flow Timeline (Major Milestones)</h4>
				<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
					${investment.cashFlowMilestones.slice(0, 6).map(milestone => `
						<div style="text-align: center; background: rgba(255,255,255,0.5); padding: 8px; border-radius: 4px;">
							<p style="margin: 0; font-size: 0.8em; color: #666; font-weight: 600;">${milestone.period}</p>
							<p style="margin: 0; font-size: 0.9em; font-weight: bold; color: #28a745;">
								$${formatNumber(milestone.cumulativeCash)}
							</p>
							<p style="margin: 0; font-size: 0.7em; color: #666;">${milestone.description}</p>
						</div>
					`).join('')}
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

// Investment analysis calculations
function calculateInvestmentAnalysis(loan) {
	const totalCashInvested = loan.downPaymentAmount + loan.totalPaid;
	const totalCashOutlay = loan.downPaymentAmount + loan.totalPaid;
	const effectiveInvestmentCost = totalCashInvested;
	const monthlyInvestmentCost = loan.downPaymentAmount / loan.totalPayments + loan.monthlyPayment;
	
	// Calculate cash flow timeline (showing major milestones)
	const cashFlowMilestones = [];
	
	// Initial cash (downpayment)
	cashFlowMilestones.push({
		period: "Initial",
		cashOut: loan.downPaymentAmount,
		cumulativeCash: loan.downPaymentAmount,
		description: "Down Payment"
	});
	
	// Year markers
	for (let year = 1; year <= Math.min(loan.loanPeriodYears, 10); year++) {
		const monthsElapsed = year * 12;
		const cumulativePayments = monthsElapsed * loan.monthlyPayment;
		const totalCashAtYear = loan.downPaymentAmount + cumulativePayments;
		
		cashFlowMilestones.push({
			period: `Year ${year}`,
			cashOut: cumulativePayments,
			cumulativeCash: totalCashAtYear,
			description: `After ${year} year${year > 1 ? 's' : ''}`
		});
	}
	
	// Final payment
	if (loan.loanPeriodYears > 10) {
		cashFlowMilestones.push({
			period: `Year ${loan.loanPeriodYears}`,
			cashOut: loan.totalPaid,
			cumulativeCash: totalCashInvested,
			description: "Loan Paid Off"
		});
	}
	
	return {
		totalCashInvested,
		totalCashOutlay,
		effectiveInvestmentCost,
		monthlyInvestmentCost,
		cashFlowMilestones,
		investmentEfficiencyRatio: loan.price / totalCashInvested,
		downPaymentRatio: loan.downPaymentAmount / loan.price,
		leverageRatio: loan.loanAmount / loan.downPaymentAmount
	};
}

// Calculate comprehensive cash flow for early repayment scenarios
function calculateCashFlowAnalysis(data) {
	const downPayment = data.originalLoanAmount * (data.downPaymentPercent || 0) / 100;
	
	// Current scenario cash flow
	const currentCashFlow = {
		downPayment: downPayment,
		paymentsToDate: data.totalPaymentsMade,
		remainingPayments: data.currentScenario.totalPayments,
		totalCashInvested: downPayment + data.totalPaymentsMade + data.currentScenario.totalPayments,
		totalInterestLifetime: data.interestPaidSoFar + data.currentScenario.totalInterest
	};
	
	// Early repayment scenarios
	const scenarios = {
		current: currentCashFlow
	};
	
	if (data.extraPaymentScenario) {
		scenarios.extraPayment = {
			downPayment: downPayment,
			paymentsToDate: data.totalPaymentsMade,
			extraPaymentTotal: data.extraPayment * data.extraPaymentScenario.monthsToPayoff,
			remainingPayments: data.extraPaymentScenario.totalPayments,
			totalCashInvested: downPayment + data.totalPaymentsMade + data.extraPaymentScenario.totalPayments,
			totalInterestLifetime: data.interestPaidSoFar + data.extraPaymentScenario.totalInterest,
			totalSavings: currentCashFlow.totalCashInvested - (downPayment + data.totalPaymentsMade + data.extraPaymentScenario.totalPayments)
		};
	}
	
	if (data.lumpSumScenario) {
		scenarios.lumpSum = {
			downPayment: downPayment,
			paymentsToDate: data.totalPaymentsMade,
			lumpSumPayment: data.lumpSumPayment,
			remainingPayments: data.lumpSumScenario.totalPayments,
			totalCashInvested: downPayment + data.totalPaymentsMade + data.lumpSumPayment + data.lumpSumScenario.totalPayments,
			totalInterestLifetime: data.interestPaidSoFar + data.lumpSumScenario.totalInterest,
			totalSavings: currentCashFlow.totalCashInvested - (downPayment + data.totalPaymentsMade + data.lumpSumPayment + data.lumpSumScenario.totalPayments)
		};
	}
	
	if (data.bothScenario) {
		scenarios.both = {
			downPayment: downPayment,
			paymentsToDate: data.totalPaymentsMade,
			lumpSumPayment: data.lumpSumPayment,
			extraPaymentTotal: data.extraPayment * data.bothScenario.monthsToPayoff,
			remainingPayments: data.bothScenario.totalPayments,
			totalCashInvested: downPayment + data.totalPaymentsMade + data.lumpSumPayment + data.bothScenario.totalPayments,
			totalInterestLifetime: data.interestPaidSoFar + data.bothScenario.totalInterest,
			totalSavings: currentCashFlow.totalCashInvested - (downPayment + data.totalPaymentsMade + data.lumpSumPayment + data.bothScenario.totalPayments)
		};
	}
	
	return scenarios;
}

// Early repayment calculator functionality
function calculateEarlyRepayment() {
	console.log("Calculating early repayment...");

	// Get early repayment inputs
	const currentBalance = parsePriceInput(
		document.getElementById("currentLoanBalance")
	);
	const monthsPaid =
		parseInt(document.getElementById("monthsPaid").value) || 0;
	const extraPayment =
		parsePriceInput(document.getElementById("extraPayment")) || 0;
	const lumpSumPayment =
		parsePriceInput(document.getElementById("lumpSumPayment")) || 0;
	const earlyRepaymentResult = document.getElementById(
		"earlyRepaymentResult"
	);

	// Get original loan details from main calculator
	const originalLoanAmount =
		parsePriceInput(document.getElementById("loanPrice")) -
		parsePriceInput(document.getElementById("loanPrice")) *
			(parseFloat(document.getElementById("downPayment").value) / 100);
	const annualInterestRate = parseFloat(
		document.getElementById("interestRate").value
	);
	const originalLoanPeriodYears = parseInt(
		document.getElementById("loanPeriod").value
	);

	// Validate inputs
	if (
		!validateEarlyRepaymentInputs(
			currentBalance,
			monthsPaid,
			annualInterestRate,
			originalLoanPeriodYears
		)
	) {
		showEarlyRepaymentError(
			"Please ensure you have calculated the main loan first and entered a valid current balance and months paid."
		);
		return;
	}

	try {
		// Calculate original loan details first
		const originalMonthlyPayment = calculateMonthlyPayment(
			originalLoanAmount,
			annualInterestRate,
			originalLoanPeriodYears
		);

		// Calculate payment breakdown (principal and interest paid so far)
		const paymentBreakdown = calculatePaymentBreakdown(
			originalLoanAmount,
			originalMonthlyPayment,
			annualInterestRate,
			monthsPaid
		);

		// Calculate remaining loan details
		const monthlyInterestRate = annualInterestRate / 100 / 12;
		const remainingMonths = originalLoanPeriodYears * 12 - monthsPaid;

		// Calculate scenarios
		const currentScenario = calculateRemainingPayments(
			currentBalance,
			originalMonthlyPayment,
			monthlyInterestRate
		);
		const extraPaymentScenario =
			extraPayment > 0
				? calculateRemainingPayments(
						currentBalance,
						originalMonthlyPayment + extraPayment,
						monthlyInterestRate
				  )
				: null;
		const lumpSumScenario =
			lumpSumPayment > 0
				? calculateRemainingPayments(
						Math.max(0, currentBalance - lumpSumPayment),
						originalMonthlyPayment,
						monthlyInterestRate
				  )
				: null;
		const bothScenario =
			extraPayment > 0 && lumpSumPayment > 0
				? calculateRemainingPayments(
						Math.max(0, currentBalance - lumpSumPayment),
						originalMonthlyPayment + extraPayment,
						monthlyInterestRate
				  )
				: null;

		// Calculate effective interest rate
		const effectiveInterestRate = calculateEffectiveInterestRate(
			originalLoanAmount,
			paymentBreakdown.totalPaymentsMade,
			paymentBreakdown.interestPaid,
			monthsPaid
		);

		// Display results
		displayEarlyRepaymentResults({
			originalLoanAmount,
			originalMonthlyPayment,
			monthsPaid,
			interestPaidSoFar: paymentBreakdown.interestPaid,
			principalPaidSoFar: paymentBreakdown.principalPaid,
			totalPaymentsMade: paymentBreakdown.totalPaymentsMade,
			effectiveInterestRate: effectiveInterestRate,
			currentBalance,
			extraPayment,
			lumpSumPayment,
			currentScenario,
			extraPaymentScenario,
			lumpSumScenario,
			bothScenario,
			downPaymentPercent: parseFloat(document.getElementById("downPayment").value) || 0,
		});
	} catch (error) {
		console.error("Early repayment calculation error:", error);
		showEarlyRepaymentError(
			"An error occurred during calculation. Please check your inputs."
		);
	}
}

function validateEarlyRepaymentInputs(
	currentBalance,
	monthsPaid,
	interestRate,
	loanPeriod
) {
	if (isNaN(currentBalance) || currentBalance <= 0) {
		return false;
	}
	if (isNaN(monthsPaid) || monthsPaid < 0) {
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

function calculateMonthlyPayment(
	loanAmount,
	annualInterestRate,
	loanPeriodYears
) {
	const monthlyInterestRate = annualInterestRate / 100 / 12;
	const totalPayments = loanPeriodYears * 12;

	if (monthlyInterestRate > 0) {
		return (
			(loanAmount *
				(monthlyInterestRate *
					Math.pow(1 + monthlyInterestRate, totalPayments))) /
			(Math.pow(1 + monthlyInterestRate, totalPayments) - 1)
		);
	} else {
		return loanAmount / totalPayments;
	}
}

function calculateInterestPaidSoFar(
	loanAmount,
	monthlyPayment,
	annualInterestRate,
	monthsPaid
) {
	const monthlyInterestRate = annualInterestRate / 100 / 12;
	let remainingBalance = loanAmount;
	let totalInterestPaid = 0;

	for (let month = 1; month <= monthsPaid; month++) {
		const interestPayment = remainingBalance * monthlyInterestRate;
		const principalPayment = monthlyPayment - interestPayment;

		totalInterestPaid += interestPayment;
		remainingBalance -= principalPayment;

		if (remainingBalance <= 0) break;
	}

	return totalInterestPaid;
}

// Calculate both principal and interest paid so far
function calculatePaymentBreakdown(
	loanAmount,
	monthlyPayment,
	annualInterestRate,
	monthsPaid
) {
	const monthlyInterestRate = annualInterestRate / 100 / 12;
	let remainingBalance = loanAmount;
	let totalInterestPaid = 0;
	let totalPrincipalPaid = 0;

	for (let month = 1; month <= monthsPaid; month++) {
		const interestPayment = remainingBalance * monthlyInterestRate;
		const principalPayment = monthlyPayment - interestPayment;

		totalInterestPaid += interestPayment;
		totalPrincipalPaid += principalPayment;
		remainingBalance -= principalPayment;

		if (remainingBalance <= 0) break;
	}

	return {
		principalPaid: totalPrincipalPaid,
		interestPaid: totalInterestPaid,
		totalPaymentsMade: totalPrincipalPaid + totalInterestPaid,
		remainingBalance: Math.max(0, remainingBalance),
	};
}

function calculateRemainingPayments(
	balance,
	monthlyPayment,
	monthlyInterestRate
) {
	if (balance <= 0) {
		return {
			monthsToPayoff: 0,
			totalInterest: 0,
			totalPayments: 0,
		};
	}

	let remainingBalance = balance;
	let months = 0;
	let totalInterest = 0;
	const maxMonths = 600; // 50 years maximum

	while (remainingBalance > 0.01 && months < maxMonths) {
		const interestPayment = remainingBalance * monthlyInterestRate;
		const principalPayment = Math.min(
			monthlyPayment - interestPayment,
			remainingBalance
		);

		if (principalPayment <= 0) {
			// Payment doesn't cover interest
			return {
				monthsToPayoff: Infinity,
				totalInterest: Infinity,
				totalPayments: Infinity,
			};
		}

		totalInterest += interestPayment;
		remainingBalance -= principalPayment;
		months++;
	}

	return {
		monthsToPayoff: months,
		totalInterest: totalInterest,
		totalPayments: months * monthlyPayment,
	};
}

// Calculate effective interest rate for early repayment scenarios
function calculateEffectiveInterestRate(
	originalLoanAmount,
	totalPaymentsMade,
	totalInterestPaid,
	monthsPaid
) {
	if (monthsPaid <= 0 || totalPaymentsMade <= 0) {
		return 0;
	}

	// Calculate the effective annual rate using the formula: (interest/principal) * 100 / months * 12
	const principalPaid = totalPaymentsMade - totalInterestPaid;

	if (principalPaid <= 0) {
		return 0;
	}

	// Effective annual rate = (interest / principal) * 100 / months * 12
	const effectiveRate =
		(((totalInterestPaid / principalPaid) * 100) / monthsPaid) * 12;

	return Math.max(0, effectiveRate);
}

function displayEarlyRepaymentResults(data) {
	const resultDiv = document.getElementById("earlyRepaymentResult");
	const cashFlowAnalysis = calculateCashFlowAnalysis(data);

	const html = `
		<h2 style="color: #28a745; margin-bottom: 25px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
			<i class="bx bx-money"></i> Early Repayment Analysis
		</h2>
		
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
			<div class="summary-item">
				<h3 style="color: #333; margin-bottom: 8px; font-size: 1.1em;">Total Payments Made</h3>
				<p style="font-size: 1.3em; font-weight: bold; color: #007bff; margin: 0;">
					$${formatNumber(data.totalPaymentsMade)}
				</p>
				<p style="font-size: 0.9em; color: #666; margin: 0;">
					(${data.monthsPaid} payments made)
				</p>
			</div>
			
			<div class="summary-item">
				<h3 style="color: #333; margin-bottom: 8px; font-size: 1.1em;">Effective Interest Rate</h3>
				<p style="font-size: 1.3em; font-weight: bold; color: #6f42c1; margin: 0;">
					${data.effectiveInterestRate.toFixed(2)}%
				</p>
				<p style="font-size: 0.9em; color: #666; margin: 0;">
					(actual rate paid so far)
				</p>
			</div>
		</div>

		<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px;">
			<div class="summary-item">
				<h3 style="color: #333; margin-bottom: 8px; font-size: 1.1em;">Interest Paid So Far</h3>
				<p style="font-size: 1.3em; font-weight: bold; color: #dc3545; margin: 0;">
					$${formatNumber(data.interestPaidSoFar)}
				</p>
				<p style="font-size: 0.9em; color: #666; margin: 0;">
					(part of total payments)
				</p>
			</div>
			
			<div class="summary-item">
				<h3 style="color: #333; margin-bottom: 8px; font-size: 1.1em;">Principal Paid So Far</h3>
				<p style="font-size: 1.3em; font-weight: bold; color: #28a745; margin: 0;">
					$${formatNumber(data.principalPaidSoFar)}
				</p>
				<p style="font-size: 0.9em; color: #666; margin: 0;">
					(towards loan balance)
				</p>
			</div>
			
			<div class="summary-item">
				<h3 style="color: #333; margin-bottom: 8px; font-size: 1.1em;">Current Balance</h3>
				<p style="font-size: 1.3em; font-weight: bold; color: #f9532d; margin: 0;">
					$${formatNumber(data.currentBalance)}
				</p>
			</div>
		</div>

		<!-- Total Cash Flow Analysis Section -->
		<div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #007bff;">
			<h3 style="color: #333; margin-bottom: 15px; font-size: 1.2em;">
				<i class="bx bx-bar-chart-alt-2"></i> Total Cash Flow Analysis
			</h3>
			
			<div style="background: rgba(255,255,255,0.6); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
				<h4 style="color: #333; margin-bottom: 10px; font-size: 1em;">Current Investment Overview</h4>
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666; font-weight: 600;">Down Payment</p>
						<p style="margin: 0; font-size: 1.1em; font-weight: bold; color: #007bff;">
							$${formatNumber(cashFlowAnalysis.current.downPayment)}
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666; font-weight: 600;">Loan Payments to Date</p>
						<p style="margin: 0; font-size: 1.1em; font-weight: bold; color: #007bff;">
							$${formatNumber(cashFlowAnalysis.current.paymentsToDate)}
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666; font-weight: 600;">Total Cash Invested</p>
						<p style="margin: 0; font-size: 1.2em; font-weight: bold; color: #007bff;">
							$${formatNumber(cashFlowAnalysis.current.downPayment + cashFlowAnalysis.current.paymentsToDate)}
						</p>
					</div>
				</div>
			</div>
		</div>

		<div style="margin-bottom: 30px;">
			<h3 style="color: #333; margin-bottom: 15px;">Payment Scenarios with Total Cash Overlay</h3>
			
			<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
				<h4 style="color: #333; margin-bottom: 10px;">
					<i class="bx bx-time"></i> Continue Current Payments ($${formatNumber(
						data.originalMonthlyPayment
					)}/month)
				</h4>
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px;">
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Months Remaining</p>
						<p style="margin: 0; font-weight: bold; color: #333;">${
							data.currentScenario.monthsToPayoff
						}</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Remaining Interest</p>
						<p style="margin: 0; font-weight: bold; color: #dc3545;">$${formatNumber(
							data.currentScenario.totalInterest
						)}</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Total Interest (Lifetime)</p>
						<p style="margin: 0; font-weight: bold; color: #dc3545;">$${formatNumber(
							data.interestPaidSoFar +
								data.currentScenario.totalInterest
						)}</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666; font-weight: 600;">Total Cash Investment</p>
						<p style="margin: 0; font-weight: bold; color: #f9532d; font-size: 1.1em;">$${formatNumber(
							cashFlowAnalysis.current.totalCashInvested
						)}</p>
					</div>
				</div>
			</div>

			${
				data.extraPaymentScenario
					? `
			<div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #28a745;">
				<h4 style="color: #333; margin-bottom: 10px;">
					<i class="bx bx-plus-circle"></i> With Extra Payment (+$${formatNumber(
						data.extraPayment
					)}/month)
				</h4>
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px;">
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Months Remaining</p>
						<p style="margin: 0; font-weight: bold; color: #28a745;">${
							data.extraPaymentScenario.monthsToPayoff
						}</p>
						<p style="margin: 0; font-size: 0.8em; color: #28a745;">
							(${
								data.currentScenario.monthsToPayoff -
								data.extraPaymentScenario.monthsToPayoff
							} months saved)
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Remaining Interest</p>
						<p style="margin: 0; font-weight: bold; color: #28a745;">$${formatNumber(
							data.extraPaymentScenario.totalInterest
						)}</p>
						<p style="margin: 0; font-size: 0.8em; color: #28a745;">
							($${formatNumber(
								data.currentScenario.totalInterest -
									data.extraPaymentScenario.totalInterest
							)} saved)
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Total Interest (Lifetime)</p>
						<p style="margin: 0; font-weight: bold; color: #28a745;">$${formatNumber(
							data.interestPaidSoFar +
								data.extraPaymentScenario.totalInterest
						)}</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666; font-weight: 600;">Total Cash Investment</p>
						<p style="margin: 0; font-weight: bold; color: #28a745; font-size: 1.1em;">$${formatNumber(
							cashFlowAnalysis.extraPayment ? cashFlowAnalysis.extraPayment.totalCashInvested : 0
						)}</p>
						<p style="margin: 0; font-size: 0.8em; color: #28a745;">
							($${formatNumber(
								cashFlowAnalysis.extraPayment ? cashFlowAnalysis.extraPayment.totalSavings : 0
							)} saved)
						</p>
					</div>
				</div>
			</div>
			`
					: ""
			}

			${
				data.lumpSumScenario
					? `
			<div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #007bff;">
				<h4 style="color: #333; margin-bottom: 10px;">
					<i class="bx bx-dollar-circle"></i> With Lump Sum Payment ($${formatNumber(
						data.lumpSumPayment
					)})
				</h4>
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px;">
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Months Remaining</p>
						<p style="margin: 0; font-weight: bold; color: #007bff;">${
							data.lumpSumScenario.monthsToPayoff
						}</p>
						<p style="margin: 0; font-size: 0.8em; color: #007bff;">
							(${
								data.currentScenario.monthsToPayoff -
								data.lumpSumScenario.monthsToPayoff
							} months saved)
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Remaining Interest</p>
						<p style="margin: 0; font-weight: bold; color: #007bff;">$${formatNumber(
							data.lumpSumScenario.totalInterest
						)}</p>
						<p style="margin: 0; font-size: 0.8em; color: #007bff;">
							($${formatNumber(
								data.currentScenario.totalInterest -
									data.lumpSumScenario.totalInterest
							)} saved)
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Total Interest (Lifetime)</p>
						<p style="margin: 0; font-weight: bold; color: #007bff;">$${formatNumber(
							data.interestPaidSoFar +
								data.lumpSumScenario.totalInterest
						)}</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666; font-weight: 600;">Total Cash Investment</p>
						<p style="margin: 0; font-weight: bold; color: #007bff; font-size: 1.1em;">$${formatNumber(
							cashFlowAnalysis.lumpSum ? cashFlowAnalysis.lumpSum.totalCashInvested : 0
						)}</p>
						<p style="margin: 0; font-size: 0.8em; color: #007bff;">
							($${formatNumber(
								cashFlowAnalysis.lumpSum ? cashFlowAnalysis.lumpSum.totalSavings : 0
							)} saved)
						</p>
					</div>
				</div>
			</div>
			`
					: ""
			}

			${
				data.bothScenario
					? `
			<div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
				<h4 style="color: #333; margin-bottom: 10px;">
					<i class="bx bx-star"></i> Combined: Lump Sum + Extra Payment
				</h4>
				<div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px;">
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Months Remaining</p>
						<p style="margin: 0; font-weight: bold; color: #856404;">${
							data.bothScenario.monthsToPayoff
						}</p>
						<p style="margin: 0; font-size: 0.8em; color: #856404;">
							(${
								data.currentScenario.monthsToPayoff -
								data.bothScenario.monthsToPayoff
							} months saved)
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Remaining Interest</p>
						<p style="margin: 0; font-weight: bold; color: #856404;">$${formatNumber(
							data.bothScenario.totalInterest
						)}</p>
						<p style="margin: 0; font-size: 0.8em; color: #856404;">
							($${formatNumber(
								data.currentScenario.totalInterest -
									data.bothScenario.totalInterest
							)} saved)
						</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666;">Total Interest (Lifetime)</p>
						<p style="margin: 0; font-weight: bold; color: #856404;">$${formatNumber(
							data.interestPaidSoFar +
								data.bothScenario.totalInterest
						)}</p>
					</div>
					<div style="text-align: center;">
						<p style="margin: 0; font-size: 0.9em; color: #666; font-weight: 600;">Total Cash Investment</p>
						<p style="margin: 0; font-weight: bold; color: #856404; font-size: 1.1em;">$${formatNumber(
							cashFlowAnalysis.both ? cashFlowAnalysis.both.totalCashInvested : 0
						)}</p>
						<p style="margin: 0; font-size: 0.8em; color: #856404;">
							($${formatNumber(
								cashFlowAnalysis.both ? cashFlowAnalysis.both.totalSavings : 0
							)} saved)
						</p>
					</div>
				</div>
			</div>
			`
					: ""
			}
		</div>
		
		<div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
			<p style="margin: 0; font-size: 0.9em; color: #856404;">
				<i class="bx bx-info-circle"></i> 
				<strong>Cash Flow Note:</strong> Total Cash Investment includes down payment plus all loan payments. This represents your complete financial commitment to the property.
			</p>
		</div>
	`;

	resultDiv.innerHTML = html;
	resultDiv.style.display = "block";

	// Smooth scroll to results
	resultDiv.scrollIntoView({behavior: "smooth", block: "nearest"});
}

function showEarlyRepaymentError(message) {
	const resultDiv = document.getElementById("earlyRepaymentResult");

	resultDiv.innerHTML = `
		<div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545;">
			<i class="bx bx-error"></i> 
			<strong>Error:</strong> ${message}
		</div>
	`;

	resultDiv.style.display = "block";
}

// Initialize on window load as well
window.initLoanPage = function () {
	console.log("Loan page initialized");
};

// Auto-calculate loan balance when months paid changes
function autoCalculateLoanBalance() {
	// Check if we have enough data to calculate
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
	const monthsPaid = parseInt(document.getElementById("monthsPaid").value);

	// Only calculate if we have all required data and months paid is valid
	if (
		price > 0 &&
		!isNaN(downPaymentPercent) &&
		downPaymentPercent >= 0 &&
		!isNaN(annualInterestRate) &&
		annualInterestRate >= 0 &&
		!isNaN(loanPeriodYears) &&
		loanPeriodYears > 0 &&
		!isNaN(monthsPaid) &&
		monthsPaid >= 0
	) {
		try {
			// Calculate original loan details
			const loanDetails = calculateLoanDetails(
				price,
				downPaymentPercent,
				annualInterestRate,
				loanPeriodYears
			);

			// Calculate remaining balance and payment breakdown after months paid
			const paymentBreakdown = calculatePaymentBreakdown(
				loanDetails.loanAmount,
				loanDetails.monthlyPayment,
				annualInterestRate,
				monthsPaid
			);

			// Auto-fill the current loan balance field
			const currentLoanBalanceInput =
				document.getElementById("currentLoanBalance");
			currentLoanBalanceInput.value = paymentBreakdown.remainingBalance
				.toFixed(0)
				.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

			// Add visual indicator that this was auto-calculated
			currentLoanBalanceInput.style.backgroundColor = "#e8f5e8";
			currentLoanBalanceInput.title =
				"Auto-calculated based on months paid";

			// Remove the highlight after a few seconds
			setTimeout(() => {
				currentLoanBalanceInput.style.backgroundColor = "";
			}, 2000);
		} catch (error) {
			console.error("Auto-calculation error:", error);
		}
	}
}

// Clear auto-calculated fields when user changes base loan parameters
function clearAutoCalculatedFields() {
	const currentLoanBalanceInput =
		document.getElementById("currentLoanBalance");

	currentLoanBalanceInput.value = "";
	currentLoanBalanceInput.style.backgroundColor = "";
	currentLoanBalanceInput.title = "";
}

// Clear auto-calculated fields when base loan parameters change
priceInput.addEventListener("input", clearAutoCalculatedFields);
downPaymentInput.addEventListener("input", clearAutoCalculatedFields);
interestRateInput.addEventListener("input", clearAutoCalculatedFields);
loanPeriodInput.addEventListener("input", clearAutoCalculatedFields);

// Function to reset Early Repayment Calculator
function resetEarlyRepaymentCalculator() {
	// Clear all input fields
	document.getElementById("currentLoanBalance").value = "";
	document.getElementById("monthsPaid").value = "";
	document.getElementById("extraPayment").value = "";
	document.getElementById("lumpSumPayment").value = "";

	// Clear any auto-calculated styling
	const currentLoanBalanceInput =
		document.getElementById("currentLoanBalance");
	currentLoanBalanceInput.style.backgroundColor = "";
	currentLoanBalanceInput.title = "";

	// Hide the early repayment section and results
	earlyRepaymentSection.style.display = "none";
	earlyRepaymentResult.style.display = "none";

	// Clear results content
	earlyRepaymentResult.innerHTML = "";
}

// Add event listeners
calculateBtn.addEventListener("click", function () {
	calculateLoan();
	// Show early repayment section after main calculation
	earlyRepaymentSection.style.display = "block";
});

earlyRepaymentBtn.addEventListener("click", calculateEarlyRepayment);

// Allow Enter key to trigger calculation
document.addEventListener("keypress", function (e) {
	if (e.key === "Enter") {
		if (document.activeElement.closest("#earlyRepaymentSection")) {
			calculateEarlyRepayment();
		} else {
			calculateLoan();
			earlyRepaymentSection.style.display = "block";
		}
	}
});
