// components/Header.tsx
import { Moon, Pill, Sun } from "lucide-react";
import React from "react";
import { useTheme } from "next-themes";

import { Button } from "./ui/button";

const Header: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header
      className="z-10 shrink-0 border-b border-border/60 bg-background/80 pb-3 backdrop-blur-xl backdrop-saturate-150"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      {/* Same max-width lane as the body content and the footer nav so the
          three align at every viewport width. */}
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2.5 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-card">
          <Pill className="size-4" aria-hidden="true" />
        </div>
        <h1 className="flex-1 text-base font-semibold tracking-tight">MediLog</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
};

export default Header;
