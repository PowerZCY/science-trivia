import { SiteIcon } from '@/lib/site-config';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <SiteIcon className="h-10 w-10" />
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
        Page not found
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
        The page you are looking for is unavailable or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Back home
      </Link>
    </main>
  );
}
