// Get all DOM elements
const photoContainer = document.getElementById("photoContainer");
const loaderContainer = document.getElementById("loaderContainer");
const giftContainer = document.getElementById("giftContainer");
const cardContainer = document.getElementById("cardContainer");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const hintText = document.getElementById("hintText");
const giftBox = document.getElementById("giftBox");
const replayBtn = document.getElementById("replayBtn");
const scatteredAnimals = document.getElementById("scatteredAnimals");

// State variables
let noClickCount = 0;
let yesBtnSize = 1.5; // in rem
const animals = ["�", "🌺", "💖", "🐾", "🌸", "🌺", "🦄", "🐱", "🐶", "🐻"];
const encouragingMessages = [
	"Come on, don't be shy! 🎁",
	"The present is waiting for you! 🎉",
	"You know you want to open it... 💕",
	"The animals are cheering for you! 🌺",
	"Just one click away from something special! ✨",
	"Your surprise is getting lonely! 🎂",
	"Even the puppies want you to open it! 🐶",
	"Don't make the flowers sad! 🌺💖",
];

// Function to scatter animals across the screen
function scatterAnimals() {
	const numAnimals = 5 + noClickCount * 2; // More animals each time

	for (let i = 0; i < numAnimals; i++) {
		const animal = document.createElement("span");
		animal.className = "scattered-animal";
		animal.textContent =
			animals[Math.floor(Math.random() * animals.length)];

		// Random starting position near the button
		const startX = window.innerWidth / 2;
		const startY = window.innerHeight / 2 + 100;

		// Random end position
		const endX = (Math.random() - 0.5) * window.innerWidth * 1.5;
		const endY = (Math.random() - 0.5) * window.innerHeight * 1.5;
		const rotation = (Math.random() - 0.5) * 720; // Random rotation -360 to 360

		animal.style.left = startX + "px";
		animal.style.top = startY + "px";
		animal.style.setProperty("--tx", endX + "px");
		animal.style.setProperty("--ty", endY + "px");
		animal.style.setProperty("--rotation", rotation + "deg");

		scatteredAnimals.appendChild(animal);

		// Remove after animation
		setTimeout(() => {
			animal.remove();
		}, 2000);
	}
}

// Function to move "Maybe Later" button to random position
function moveNoButton() {
	const container = photoContainer;
	const containerRect = container.getBoundingClientRect();
	const btnRect = noBtn.getBoundingClientRect();

	// Calculate available space
	const maxX = containerRect.width - btnRect.width - 40;
	const maxY = containerRect.height - btnRect.height - 40;

	// Generate random position
	const newX = Math.random() * maxX;
	const newY = Math.random() * maxY;

	// Apply position
	noBtn.style.position = "absolute";
	noBtn.style.left = newX + "px";
	noBtn.style.top = newY + "px";
	noBtn.style.transform = "none";
}

// Function to grow and wobble "Yes" button
function growYesButton() {
	noClickCount++;
	yesBtnSize *= 1.3; // Grow by 30% each time

	yesBtn.style.fontSize = yesBtnSize + "rem";
	yesBtn.style.animation = "none";

	// Trigger wobble animation
	setTimeout(() => {
		yesBtn.style.animation = "wobble 0.5s ease-in-out";
	}, 10);

	// Update hint text
	if (noClickCount < encouragingMessages.length) {
		hintText.textContent = encouragingMessages[noClickCount];
	} else {
		hintText.textContent =
			"The animals are taking over! Just open it already! 🌺🐶💖";
	}
}

// Add wobble animation to CSS dynamically
const style = document.createElement("style");
style.textContent = `
    @keyframes wobble {
        0%, 100% { transform: rotate(0deg) scale(1); }
        25% { transform: rotate(-10deg) scale(1.1); }
        50% { transform: rotate(10deg) scale(1.15); }
        75% { transform: rotate(-5deg) scale(1.1); }
    }
`;
document.head.appendChild(style);

// Event listener for "Maybe Later" button hover
noBtn.addEventListener("mouseover", () => {
	if (noClickCount < 3) {
		moveNoButton();
	}
});

// Event listener for "Maybe Later" button click
noBtn.addEventListener("click", () => {
	scatterAnimals();
	growYesButton();
	moveNoButton();

	// After many clicks, make it even more chaotic
	if (noClickCount >= 5) {
		noBtn.textContent = "Okay okay! 😅";
		noBtn.style.fontSize = "1.2rem";
	}
});

// Event listener for "Yes" button click
yesBtn.addEventListener("click", () => {
	// Hide photo container
	photoContainer.style.display = "none";

	// Show loader
	loaderContainer.style.display = "inherit";

	// After 3 seconds, show gift
	setTimeout(() => {
		loaderContainer.style.display = "none";
		giftContainer.style.display = "inherit";
	}, 3000);
});

// Event listener for gift box click
giftBox.addEventListener("click", () => {
	// Add opening class for animation
	giftBox.classList.add("opening");

	// After animation, show card
	setTimeout(() => {
		giftContainer.style.display = "none";
		cardContainer.style.display = "inherit";
	}, 800);
});

// Event listener for replay button
replayBtn.addEventListener("click", () => {
	// Reset all states
	noClickCount = 0;
	yesBtnSize = 1.5;

	// Reset button styles
	yesBtn.style.fontSize = "1.5rem";
	yesBtn.style.animation = "none";
	noBtn.style.position = "relative";
	noBtn.style.left = "auto";
	noBtn.style.top = "auto";
	noBtn.style.transform = "none";
	noBtn.textContent = "Maybe Later...";
	noBtn.style.fontSize = "1.5rem";

	// Clear hint text
	hintText.textContent = "";

	// Clear scattered animals
	scatteredAnimals.innerHTML = "";

	// Remove opening class from gift
	giftBox.classList.remove("opening");

	// Hide all containers except photo
	cardContainer.style.display = "none";
	loaderContainer.style.display = "none";
	giftContainer.style.display = "none";

	// Show photo container with fade-in
	photoContainer.style.display = "inherit";
	photoContainer.style.animation = "fadeIn 0.5s ease-in";
});

// Add some extra flair - make floating animals react to mouse movement
const floatingAnimals = document.querySelectorAll(".floating-animals .animal");
document.addEventListener("mousemove", (e) => {
	const mouseX = e.clientX;
	const mouseY = e.clientY;

	floatingAnimals.forEach((animal, index) => {
		const rect = animal.getBoundingClientRect();
		const animalX = rect.left + rect.width / 2;
		const animalY = rect.top + rect.height / 2;

		const deltaX = mouseX - animalX;
		const deltaY = mouseY - animalY;
		const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

		// If mouse is close, move animal away slightly
		if (distance < 200) {
			const angle = Math.atan2(deltaY, deltaX);
			const offsetX = -Math.cos(angle) * 20;
			const offsetY = -Math.sin(angle) * 20;

			animal.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
		} else {
			animal.style.transform = "translate(0, 0)";
		}
	});
});

// Add confetti effect when card is revealed
function createConfetti() {
	const confettiColors = [
		"#ff54a4",
		"#ffa4d1",
		"#ffc4e1",
		"#ffe0f0",
		"#fff0f6",
	];
	const confettiCount = 50;

	for (let i = 0; i < confettiCount; i++) {
		const confetti = document.createElement("div");
		confetti.style.position = "fixed";
		confetti.style.width = "10px";
		confetti.style.height = "10px";
		confetti.style.backgroundColor =
			confettiColors[Math.floor(Math.random() * confettiColors.length)];
		confetti.style.left = Math.random() * window.innerWidth + "px";
		confetti.style.top = "-10px";
		confetti.style.borderRadius = "50%";
		confetti.style.pointerEvents = "none";
		confetti.style.zIndex = "1000";
		confetti.style.opacity = "0.8";

		document.body.appendChild(confetti);

		// Animate falling
		const duration = 2000 + Math.random() * 2000;
		const endY = window.innerHeight + 10;
		const drift = (Math.random() - 0.5) * 200;

		confetti.animate(
			[
				{
					transform: "translateY(0) translateX(0) rotate(0deg)",
					opacity: 0.8,
				},
				{
					transform: `translateY(${endY}px) translateX(${drift}px) rotate(${Math.random() * 720}deg)`,
					opacity: 0,
				},
			],
			{
				duration: duration,
				easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
			},
		);

		// Remove after animation
		setTimeout(() => {
			confetti.remove();
		}, duration);
	}
}

// Trigger confetti when card appears
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (
			mutation.target === cardContainer &&
			cardContainer.style.display === "inherit"
		) {
			createConfetti();
		}
	});
});

observer.observe(cardContainer, {
	attributes: true,
	attributeFilter: ["style"],
});

console.log("🎂 Happy Birthday Website Loaded! 🎉");
