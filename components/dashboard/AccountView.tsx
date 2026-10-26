"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Crown } from "@/components/ui/Crown";
import { useTier } from "@/lib/store/tier";
import { signInWithGoogle, signOut } from "@/lib/supabase/client";
import { TIER_LABELS } from "@/lib/tiers";

const STATUS_LABELS: Record<string, string> = {
  active: "Aktif",
  on_trial: "Deneme",
  past_due: "Ödeme bekleniyor",
  unpaid: "Ödenmedi",
  paused: "Duraklatıldı",
  cancelled: "İptal edildi",
  expired: "Sona erdi",
};

const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : null;

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function AccountView() {
  const account = useTier((s) => s.account);
  const tier = useTier((s) => s.tier);
  const authError = useSearchParams().get("error") === "auth";

  if (!account) return <p className="mt-8 text-sm text-muted">Yükleniyor…</p>;

  if (!account.authEnabled) {
    return (
      <section className="mt-8 rounded-3xl bg-panel p-6">
        <p className="font-semibold">Hesaplar yakında</p>
        <p className="mt-2 text-sm text-muted">
          Şimdilik her şey bu cihazda saklanıyor. Giriş ve bulut senkronu açıldığında dump&apos;ların hesabına taşınabilecek.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 rounded-xl bg-hover p-3 text-xs text-muted">
            Geliştirici notu: .env.local&apos;e NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY eklenince Google girişi açılır
            (README → Hesaplar).
          </p>
        )}
      </section>
    );
  }

  if (!account.user) {
    return (
      <section className="mt-8 flex flex-col items-start gap-4 rounded-3xl bg-panel p-6">
        <p className="text-sm text-muted">AI asistanı kullanmak ve planını yönetmek için giriş yap. Ücretsiz.</p>
        {authError && <p className="text-sm text-[#ff6b61]">Giriş tamamlanamadı. Tekrar dener misin?</p>}
        <Button variant="primary" className="bg-white text-[#1d1d1f]" onClick={() => void signInWithGoogle("/app/account")}>
          <GoogleMark /> Google ile giriş yap
        </Button>
      </section>
    );
  }

  const { user, subscription } = account;
  const portal = subscription?.portalUrl;
  return (
    <div className="mt-8 flex flex-col gap-4">
      <section className="flex items-center gap-4 rounded-3xl bg-panel p-6">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" className="size-14 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="grid size-14 place-items-center rounded-full bg-accent text-xl font-semibold text-white">
            {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{user.name ?? "Hesabın"}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void signOut().then(() => useTier.getState().refreshAccount())}
        >
          <LogOut size={15} /> Çıkış
        </Button>
      </section>

      <section className="rounded-3xl bg-panel p-6">
        <p className="text-sm text-muted">Planın</p>
        <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">
          {TIER_LABELS[tier]} {tier !== "free" && <Crown size={18} />}
        </p>
        {subscription?.status && (
          <p className="mt-2 text-sm text-muted">
            {STATUS_LABELS[subscription.status] ?? subscription.status}
            {subscription.status === "cancelled" && subscription.endsAt
              ? ` · ${date(subscription.endsAt)} tarihine kadar açık`
              : subscription.renewsAt
                ? ` · ${date(subscription.renewsAt)} tarihinde yenilenir`
                : ""}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {portal ? (
            <a href={portal} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-hover px-4 py-2 text-sm font-medium hover:bg-active">
              Aboneliği yönet <ExternalLink size={14} />
            </a>
          ) : (
            tier === "free" && (
              <Link href="/#pricing" className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white">
                Planları gör
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
}
