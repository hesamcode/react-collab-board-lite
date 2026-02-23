import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import BoardPage from "../features/board/BoardPage";

const THEME_STORAGE_KEY = "collab-board-lite:theme";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function AppShell() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col bg-bg-light text-text-light dark:bg-bg-dark dark:text-text-dark">
      <header className="border-b border-slate-300 bg-surface-light/90 px-3 py-3 backdrop-blur md:px-5 dark:border-slate-700 dark:bg-surface-dark/90">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold md:text-2xl">Collab Board Lite</h1>
            <p className="text-xs text-slate-600 md:text-sm dark:text-slate-300">
              Miro-lite interactions: pan, zoom, drag, resize, and collaboration flow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="subtle" onClick={() => setAboutOpen(true)} aria-label="Open about modal">
              About
            </Button>
            <Button
              variant="subtle"
              onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 min-h-0 flex-col">
        <BoardPage />
      </main>

      <footer className="mx-auto mt-10 w-full max-w-[1400px] px-4 pb-8 text-base leading-relaxed text-slate-700 dark:text-slate-200">
        Built by{" "}
        <a
          href="https://hesamcode.github.io"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit HesamCode portfolio website"
          className="font-semibold text-primary-500 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          HesamCode
        </a>
      </footer>

      <Modal open={aboutOpen} title="About" onClose={() => setAboutOpen(false)}>
        <p>
          Built by{" "}
          <a
            href="https://hesamcode.github.io"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit HesamCode portfolio website"
            className="font-semibold text-primary-500 underline underline-offset-4"
          >
            HesamCode
          </a>
        </p>
      </Modal>
    </div>
  );
}
