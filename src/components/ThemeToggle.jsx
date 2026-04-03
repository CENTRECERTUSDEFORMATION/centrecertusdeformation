import React, { useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button onClick={toggle} className="p-2 rounded bg-gray-300 dark:bg-gray-700">
      {dark ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
    </button>
  );
}
