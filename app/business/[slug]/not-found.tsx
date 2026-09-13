import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-16 text-left">
      <h1 className="text-[28px] leading-[1.2] font-semibold">
        We couldn&apos;t find that business
      </h1>
      <p className="text-base leading-normal text-muted-foreground">
        It may have been removed or the link is incorrect. Browse the
        directory instead.
      </p>
      <Link
        href="/directory"
        className="min-h-11 text-base leading-normal text-brand-accent underline underline-offset-4"
      >
        Browse the directory
      </Link>
    </main>
  );
}
