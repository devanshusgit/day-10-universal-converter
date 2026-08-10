import { Logo } from "@/components/logo";
import { PrivacyBadge } from "@/components/privacy-badge";
import { ConversionWorkspace } from "@/components/conversion-workspace";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <PrivacyBadge className="hidden sm:inline-flex" />
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pt-12 pb-8 text-center sm:px-6 sm:pt-16">
          <PrivacyBadge className="mb-5 inline-flex sm:hidden" />
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Convert the format.
            <br />
            Keep the data.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-secondary">
            Transform CSV, JSON, TXT and Markdown files directly in your browser.
          </p>
          <p className="mt-2 text-sm font-medium text-success">Your files never leave this device.</p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <ConversionWorkspace />
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-secondary sm:px-6">
          Universal Converter — local, browser-only file conversion.
        </div>
      </footer>
    </div>
  );
}
