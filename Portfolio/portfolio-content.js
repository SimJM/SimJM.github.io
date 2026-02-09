// portfolio-content.js

// Utility function to calculate duration between two dates
function calculateDuration(startDate, endDate = null) {
	const start = new Date(startDate);
	const end = endDate ? new Date(endDate) : new Date(); // Use current date if no end date

	let years = end.getFullYear() - start.getFullYear();
	let months = end.getMonth() - start.getMonth();

	// Adjust for negative months
	if (months < 0) {
		years--;
		months += 12;
	}

	// Round up all months by 1 month
	months += 1;

	// Adjust if months overflow to next year
	if (months >= 12) {
		years += Math.floor(months / 12);
		months = months % 12;
	}

	// Format duration string
	if (years > 0 && months > 0) {
		return `(${years} year${years > 1 ? "s" : ""}, ${months} month${
			months > 1 ? "s" : ""
		})`;
	} else if (years > 0) {
		return `(${years} year${years > 1 ? "s" : ""})`;
	} else if (months > 0) {
		return `(${months} month${months > 1 ? "s" : ""})`;
	} else {
		return `(1 month)`;
	}
}

// Function to parse date ranges and add duration
function addDurationToEntry(entry) {
	const dateRange = entry.date;

	// Parse different date formats
	if (dateRange.includes("Present")) {
		// Current position - calculate from start to now
		const startMatch = dateRange.match(/(\w{3} \d{4})/);
		if (startMatch) {
			const startDate = startMatch[1] + " 01"; // Add day for parsing
			const duration = calculateDuration(startDate);
			entry.dateWithDuration = `${dateRange} ${duration}`;
		} else {
			entry.dateWithDuration = dateRange;
		}
	} else {
		// Past position - calculate between start and end dates
		const dateMatches = dateRange.match(/(\w{3} \d{4})/g);
		if (dateMatches && dateMatches.length === 2) {
			const startDate = dateMatches[0] + " 01";
			const endDate = dateMatches[1] + " 01";
			const duration = calculateDuration(startDate, endDate);
			entry.dateWithDuration = `${dateRange} ${duration}`;
		} else {
			entry.dateWithDuration = dateRange;
		}
	}

	return entry;
}

window.portfolioContent = {
	experience: [
		{
			title: "Software Engineer",
			company: "PayPal, Singapore",
			date: "Nov 2024 – Present",
			bullets: [
				"Led the full stack development of a feature using Next.js and Spring Boot, enhancing user experience and performance.",
				"Migrated multiple services from JDK 8 to JDK 17, ensuring compatibility and improved performance.",
				"Implemented end-to-end testing using Playwright, significantly improving test coverage and reliability.",
			],
			tech: "Next.js, Spring Boot, Playwright, JDK 17, Agile methodologies, full stack development",
		},
		{
			title: "Software Engineer (Data Quality Assurance)",
			company: "Byteplus (ByteDance), Singapore",
			date: "Jul 2024 – Nov 2024",
			bullets: [
				"Designed and implemented a chatbot using the MVC model to integrate a project management platform with Lark, streamlining bug tracking and reporting processes for stakeholders.",
				"Developed an automated API testing framework using Postman to monitor API availability and performance, ensuring reliability and efficiency in the integration process.",
			],
			tech: "NodeJS, MySQL, Postman, API automation testing, data quality testing, software design",
		},
		{
			title: "Software Engineer (Internship)",
			company: "ZUJU GAMEPLAY, Singapore",
			date: "Jan 2024 – Mar 2024",
			bullets: [
				"Developed One-Time-Password SMS feature for global mobile phone verification using REST API endpoint with AWS SNS.",
				"Applied TDD methodologies to develop 10 backend feature API endpoints, demonstrating proficiency in AWS Lambda architecture, and adhering to the MVC model.",
			],
			tech: "TypeScript, Node, MySQL, AWS, SNS, S3, Lambda, Cognito, Swagger, TDD, Docker",
		},
		{
			title: "Software Engineer (Internship)",
			company: "GOVTECH, Singapore",
			date: "Jan 2023 – Dec 2023",
			bullets: [
				"Spearheaded the full stack development of several features for Singpass API application within a dynamic team, enhancing both security and functionality of the application.",
				"Implemented infrastructure-as-code principles using Terraform to establish, configure, and maintain AWS resources, enhancing operational efficiency and scalability.",
				"Implemented robust secure coding practices, including input validation and output encoding to mitigate common security vulnerabilities.",
			],
			tech: "Angular, TypeScript, Node, Jest, DynamoDB, Lambda, AWS, Terraform, Git",
		},
		{
			title: "Software Engineer (Internship)",
			company: "Aztech Technologies, Singapore",
			date: "Jun 2022 – Aug 2022",
			bullets: [
				"Developed and tested the notification feature for an IoT Microservices web application using Java Spring Boot.",
				"Collaborated closely with R&D team to learn the fundamentals of software development, including evaluation, testing, troubleshooting, and maintaining documentation for an IoT project.",
			],
			tech: "Java Spring Boot, MySQL, ReactJS, Docker, Postman",
		},
	].map(addDurationToEntry),
	projects: [
		{
			title: "Wordle Game",
			date: "Jun 2025 – Jun 2025",
			bullets: [
				"Developed an interactive Wordle word-guessing game with custom word generation and hint system.",
				"Implemented prompt engineering techniques to create dynamic word clues and difficulty scaling based on user performance.",
				"Designed responsive UI with real-time feedback and color-coded letter validation for enhanced user experience.",
				'<a href="https://simjm.github.io/wordle.html?word=wrd_=QURSlES" target="_blank">Play the Game</a>',
			],
		},
		{
			title: "Database Management System (DMS)",
			date: "Sep 2023 – Oct 2023",
			bullets: [
				"Led a team of four in developing C++ DMS, encompassing both storage and indexing components.",
				"Engineered a B+ tree for the indexing component, significantly enhancing the efficiency of CRUD operations.",
				"Optimized the storage component to store blocks of records in an unspanned and non-sequential order.",
			],
		},
		{
			title: "Static Program Analyser (SPA)",
			date: "Aug 2022 – Nov 2022",
			bullets: [
				"Built a C++ SPA, with a team of six members, that analyses a source program and extract relevant program design entities, abstractions, AST and CFG.",
				"Implemented the logic of a Program Knowledge Based that handles the storing of input programs into its data structures.",
				"Explored two modern programming paradigms, object-oriented programming, and functional programming.",
			],
		},
		{
			title: "PeerPrep",
			date: "Aug 2022 – Nov 2022",
			bullets: [
				"Spearheaded the development of a Microservice architecture application with a team of four members, using MERN stack, that allows users to practice LeetCode style questions with others.",
				"Lead the team in Agile product management using Jira for efficient collaboration and timely delivery of project milestones.",
			],
		},
	],
	certifications: [
		{
			title: "AWS Certified Solutions Architect – Associate",
			org: "Amazon Web Services",
			date: "Dec 2023 – Dec 2026",
			bullets: [
				"Demonstrated proficiency in AWS Well-Architected Framework and design of cost and performance optimized solutions.",
			],
		},
	],
	education: [
		{
			title: "National University of Singapore, Bachelor of Computing in Computer Science",
			date: "Aug 2020 – May 2024",
			bullets: [
				"Specialization in Software Engineering & Database Systems",
				"Language: English (Native), Chinese (Native)",
				'<a href="https://drive.google.com/drive/folders/1XLQJ7s0bgPP2vMtspEZ-pWZbs-GY98LI?usp=sharing" target="_blank">Testimonials</a>',
			],
		},
	],

	skills: [
		"Java",
		"C++",
		"Python",
		"HTML",
		"CSS",
		"JavaScript",
		"TypeScript",
		"Terraform",
		"MySQL",
		"PostgreSQL",
		"DynamoDB",
		"MEAN Stack",
		"MERN Stack",
		"Java Spring Boot",
		"React",
		"Angular",
		"Jest",
		"JUnit",
		"AWS Cloud Services",
		"Lambda",
		"Swagger",
		"Figma",
		"Postman",
		"Docker",
		"Basic Penetration Testing",
		"Project Management",
		"Playwright",
		"Agile Methodologies",
		"Test-Driven Development (TDD)",
	],
};
