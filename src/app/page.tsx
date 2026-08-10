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
    </div>
  );
}
