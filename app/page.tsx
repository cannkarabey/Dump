import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Temporary home until the marketing landing is built in Sprint 2 (S2.1–S2.3).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-5xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-6xl">
        Ayın fotoğrafları,
        <br />
        <span className="text-accent">tek tıkla dump.</span>
      </h1>
      <p className="max-w-md text-lg text-muted">
        Instagram carousel, TikTok slideshow ve story&apos;ler için tarayıcıda photo dump oluştur.
      </p>
      <Link href="/app/editor/new">
        <Button size="lg">Dump&apos;lamaya başla</Button>
      </Link>
    </main>
  );
}
