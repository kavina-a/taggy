import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isModeratorPhone } from "@/lib/moderation/is-moderator";
import { getDictionary } from "@/lib/i18n/messages";
import { getRequestLanguage } from "@/lib/i18n/get-request-language";
import { ReportQueue } from "@/components/moderation/report-queue";

export default async function ModerationPage() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  if (!isModeratorPhone(session.phone)) {
    notFound();
  }

  const lang = await getRequestLanguage();
  const t = getDictionary(lang);

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      targetType: true,
      targetId: true,
      reason: true,
      status: true,
      createdAt: true,
    },
  });

  const businessIds = reports.filter((r) => r.targetType === "business").map((r) => r.targetId);
  const reviewIds = reports.filter((r) => r.targetType === "review").map((r) => r.targetId);

  const [businesses, reviews] = await Promise.all([
    businessIds.length
      ? prisma.business.findMany({
          where: { id: { in: businessIds } },
          select: { id: true, name: true, slug: true, consumerAlert: true },
        })
      : Promise.resolve([]),
    reviewIds.length
      ? prisma.review.findMany({
          where: { id: { in: reviewIds } },
          select: { id: true, text: true, business: { select: { slug: true, name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const businessById = new Map(businesses.map((b) => [b.id, b]));
  const reviewById = new Map(reviews.map((r) => [r.id, r]));

  const items = reports.map((report) => {
    const business = report.targetType === "business" ? businessById.get(report.targetId) : undefined;
    const review = report.targetType === "review" ? reviewById.get(report.targetId) : undefined;
    return {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      businessName: business?.name ?? review?.business.name ?? null,
      businessSlug: business?.slug ?? review?.business.slug ?? null,
      consumerAlert: business?.consumerAlert ?? null,
      reviewSnippet: review?.text.slice(0, 140) ?? null,
    };
  });

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-[28px] leading-[1.2] font-semibold">{t.moderation.title}</h1>
      <p className="text-sm text-muted-foreground">
        Reporter-facing APIs still return confirmation only. Status lives here.
      </p>
      <ReportQueue items={items} copy={t.moderation} />
      <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">
        ← Home
      </Link>
    </main>
  );
}
