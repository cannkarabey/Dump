import { LegalPage, legalMetadata } from "@/components/marketing/LegalPage";

export function generateMetadata({ params }: PageProps<"/[lang]/terms">) {
  return legalMetadata("terms", params);
}

export default function Page({ params }: PageProps<"/[lang]/terms">) {
  return <LegalPage kind="terms" params={params} />;
}
