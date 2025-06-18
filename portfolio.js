// portfolio.js

document.addEventListener("DOMContentLoaded", function () {
	if (!window.portfolioContent) return;
	// Experience
	const expSection = document.getElementById("experience");
	if (expSection) {
		expSection.innerHTML =
			`<h2>Work Experience</h2>` +
			window.portfolioContent.experience
				.map(
					(exp) => `
                <div class="experience-entry">
                    <div class="experience-title">${exp.title}</div>
                    <div class="experience-company">${exp.company}</div>
                    <div class="experience-date">${exp.date}</div>
                    <ul class="bullet-list">
                        ${exp.bullets.map((b) => `<li>${b}</li>`).join("")}
                    </ul>
                    <div class="tech-stack">${exp.tech}</div>
                </div>
            `
				)
				.join("");
	}
	// Projects
	const projSection = document.getElementById("projects");
	if (projSection) {
		projSection.innerHTML =
			`<h2>Projects</h2>` +
			window.portfolioContent.projects
				.map(
					(proj) => `
                <div class="project-entry">
                    <div class="project-title">${proj.title}</div>
                    <div class="project-date">${proj.date}</div>
                    <ul class="bullet-list">
                        ${proj.bullets.map((b) => `<li>${b}</li>`).join("")}
                    </ul>
                </div>
            `
				)
				.join("");
	}
	// Certifications
	const certSection = document.getElementById("certifications");
	if (certSection) {
		certSection.innerHTML =
			`<h2>Certifications</h2>` +
			window.portfolioContent.certifications
				.map(
					(cert) => `
                <div class="cert-entry">
                    <div class="cert-title">${cert.title}</div>
                    <div class="cert-org">${cert.org}</div>
                    <div class="cert-date">${cert.date}</div>
                    <ul class="bullet-list">
                        ${cert.bullets.map((b) => `<li>${b}</li>`).join("")}
                    </ul>
                </div>
            `
				)
				.join("");
	}
	// Skills
	const skillsSection = document.getElementById("skills");
	if (skillsSection) {
		skillsSection.innerHTML =
			`<h2>Tech Skills</h2><ul class="skills-list">` +
			window.portfolioContent.skills
				.map((skill) => `<li>${skill}</li>`)
				.join("") +
			`</ul>`;
	}
	// Education
	const eduSection = document.getElementById("education");
	if (eduSection) {
		eduSection.innerHTML =
			`<h2>Education</h2>` +
			window.portfolioContent.education
				.map(
					(edu) => `
                <div class="edu-entry">
                    <div class="edu-title">${edu.title}</div>
                    <div class="edu-date">${edu.date}</div>
                    <ul class="bullet-list">
                        ${edu.bullets.map((b) => `<li>${b}</li>`).join("")}
                    </ul>
                </div>
            `
				)
				.join("");
	}
});

function scrollToSection(sectionId) {
	const section = document.getElementById(sectionId);
	if (section) {
		section.scrollIntoView({behavior: "smooth", block: "start"});
	}
}
