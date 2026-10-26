import { LegalPage, legalMetadata } from "@/components/marketing/LegalPage";

export function generateMetadata({ params }: PageProps<"/[lang]/privacy">) {
  return legalMetadata("privacy", params);
}

export default function Page({ params }: PageProps<"/[lang]/privacy">) {
  return <LegalPage kind="privacy" params={params} />;
}
