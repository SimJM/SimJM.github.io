(() => {
  const storageKey = 'notes-tech-theme';
  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem(storageKey);
  const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
  root.setAttribute('data-theme', initialTheme);

  const labels = {
    dark: '🌙 Dark mode',
    light: '☀️ Light mode'
  };

  const updateTheme = (theme, button) => {
    root.setAttribute('data-theme', theme);
    button.textContent = labels[theme];
    button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    button.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (!header) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-toggle';

    header.appendChild(toggle);
    updateTheme(root.getAttribute('data-theme') || 'dark', toggle);

    toggle.addEventListener('click', () => {
      const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(storageKey, nextTheme);
      updateTheme(nextTheme, toggle);
    });
  });
})();
