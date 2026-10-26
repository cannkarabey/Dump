import { LegalPage, legalMetadata } from "@/components/marketing/LegalPage";

export function generateMetadata({ params }: PageProps<"/[lang]/refund">) {
  return legalMetadata("refund", params);
}

export default function Page({ params }: PageProps<"/[lang]/refund">) {
  return <LegalPage kind="refund" params={params} />;
}
