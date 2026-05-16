import { ArchiveHome } from './archive-home';

export default async function ArchiveHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return ArchiveHome({ locale });
}
