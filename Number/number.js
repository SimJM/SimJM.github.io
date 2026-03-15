function removeNumberZeroAndFive(n) {
	let processed = "";
	for (let i = 0; i < n.length; i++) {
		const c = n[i];
		if (c !== "0" && c !== "5") {
			processed += c;
		}
	}
	return processed;
}

function initialiseMap() {
	return {
		大吉星: new Set([
			"13",
			"31",
			"68",
			"86",
			"49",
			"94",
			"27",
			"72",
			"14",
			"41",
			"67",
			"76",
			"39",
			"93",
			"28",
			"82",
		]),
		中吉星: new Set(["19", "91", "78", "87", "34", "43", "26", "62"]),
		小吉星: new Set(["11", "22", "33", "44", "55", "66", "77", "88", "99"]),
		凶星: new Set([
			"16",
			"61",
			"47",
			"74",
			"38",
			"83",
			"29",
			"92",
			"17",
			"71",
			"89",
			"98",
			"46",
			"64",
			"23",
			"32",
		]),
		大凶星: new Set([
			"18",
			"81",
			"79",
			"97",
			"36",
			"63",
			"24",
			"42",
			"12",
			"21",
			"69",
			"96",
			"48",
			"84",
			"37",
			"73",
		]),
	};
}

function findKeysForValue(map, searchValue) {
	const matchingKeys = [];
	for (const key in map) {
		if (map[key].has(searchValue)) {
			matchingKeys.push(key);
		}
	}
	return matchingKeys[0];
}

// Web-based number processing
function processNumberForWeb(mobile) {
	const processedNumber = removeNumberZeroAndFive(mobile);
	const pairs = [];
	for (let i = 0; i < processedNumber.length - 1; i++) {
		const pair = processedNumber[i] + processedNumber[i + 1];
		pairs.push(pair);
	}

	const map = initialiseMap();
	const result = {};
	for (const pair of pairs) {
		const key = findKeysForValue(map, pair);
		if (!result[key]) result[key] = [];
		result[key].push(pair);
	}

	return {
		original: mobile,
		processed: processedNumber,
		pairs: pairs,
		result: result,
	};
}

// Store current results for re-rendering when theme changes
let currentResults = null;

function displayResults(data) {
	currentResults = data; // Store the current results
	const resultDiv = document.getElementById("numberResult");
	if (!resultDiv) return;

	// Check if dark mode is enabled
	const isDarkMode = document.body.classList.contains("dark-mode");
	const bgColor = isDarkMode ? "#2d3748" : "#f9f9f9";
	const textColor = isDarkMode ? "#f3f3f3" : "#333";
	const subTextColor = isDarkMode ? "#b0b0b0" : "#666";

	let html = `
        <div style="text-align: left; max-width: 600px; margin: 0 auto; background: ${bgColor}; color: ${textColor}; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #f9532d; margin-top: 0;">Analysis Results</h3>
            <p><strong>Original Number:</strong> ${data.original}</p>
            <p><strong>Processed Number:</strong> ${data.processed}</p>
            <p><strong>Number Pairs:</strong> ${data.pairs.join(", ")}</p>
            <br>
            <h4 style="color: ${textColor};">Star Classifications:</h4>
    `;

	const orderedKeys = ["大吉星", "中吉星", "小吉星", "凶星", "大凶星"];
	for (const key of orderedKeys) {
		if (data.result[key]) {
			html += `<p><strong>${key} (${
				data.result[key].length
			}):</strong> ${data.result[key].join(", ")}</p>`;
		}
	}

	html += "</div>";
	resultDiv.innerHTML = html;
}

// Add event listener when page loads
document.addEventListener("DOMContentLoaded", function () {
	const processBtn = document.getElementById("processNumberBtn");
	const numberInput = document.getElementById("numberInput");
	const darkModeToggle = document.getElementById("darkModeToggle");

	if (processBtn && numberInput) {
		processBtn.addEventListener("click", function () {
			const mobile = numberInput.value.trim();
			if (mobile) {
				const results = processNumberForWeb(mobile);
				displayResults(results);
			} else {
				document.getElementById("numberResult").innerHTML =
					'<p style="color: red;">Please enter a number.</p>';
			}
		});

		// Also process on Enter key
		numberInput.addEventListener("keypress", function (e) {
			if (e.key === "Enter") {
				processBtn.click();
			}
		});
	}

	// Listen for dark mode toggle changes and update results if they exist
	if (darkModeToggle) {
		darkModeToggle.addEventListener("change", function () {
			if (currentResults) {
				// Re-render results with new theme
				displayResults(currentResults);
			}
		});
	}
});
