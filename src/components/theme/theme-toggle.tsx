"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;

    try {
      window.localStorage.setItem("usk-theme", next);
    } catch {
      // Preferensi tema tidak tersimpan, tetapi tema tetap berubah untuk sesi ini.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Ganti tema terang atau gelap"
      title="Ganti tema terang atau gelap"
      className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-text/30 hover:text-text"
    >
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
    </button>
  );
}
