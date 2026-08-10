import { Logo } from "@/components/logo";
import { PrivacyBadge } from "@/components/privacy-badge";
import { ConversionWorkspace } from "@/components/conversion-workspace";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3.5 sm:px-8">
          <Logo />
          <PrivacyBadge />
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-5 pt-10 pb-8 sm:px-8 sm:pt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Universal Converter
          </p>
          <h1 className="mt-3 max-w-3xl text-[42px] leading-[0.98] font-semibold tracking-tight text-foreground sm:text-[56px] lg:text-[72px]">
            Convert the format.
            <br />
            <span className="text-accent">Keep the data.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-secondary">
            Transform CSV, JSON, TXT and Markdown files directly in your browser.
          </p>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-8">
          <ConversionWorkspace />
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-5 py-4 text-xs text-secondary sm:px-8">
          <span>Built by Devanshu</span>
          <span className="text-border">·</span>
          <a
            href="https://github.com/devanshusgit/day-10-universal-converter"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex items-center gap-1 rounded hover:text-foreground"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98.01 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.42.36.78 1.07.78 2.15 0 1.56-.01 2.81-.01 3.19 0 .31.2.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
            </svg>
            GitHub ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
