import { Prisma } from "@prisma/client";
import prisma from "../config/prismaClient.js";
import { FEATURED_POST } from "../constants.js";
import badgeService from "./badgeService.js";
import { startOfUtcMonth, addUtcMonths } from "../utils/date.js";

export async function computeTopCreatorThisMonth() {
  const monthStartUtc = startOfUtcMonth(new Date());
  const monthEndUtc = addUtcMonths(monthStartUtc, 1);

  // 1) Already computed this month?
  const existing = await prisma.featuredPost.findUnique({
    where: { type_date: { type: FEATURED_POST.TOP_CREATOR_MONTH, date: monthStartUtc } },
    select: { postId: true },
  });
  if (existing?.postId) return existing.postId;

  // 2) Find top author by number of published posts this month
  const rows = await prisma.blogPost.groupBy({
    by: ["authorId"],
    where: {
      published: true,
      createdAt: { gte: monthStartUtc, lt: monthEndUtc },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 1,
  });

  const winnerAuthorId = rows[0]?.authorId ?? null;
  const postCount = rows[0]?._count?.id ?? 0;

  if (!winnerAuthorId || postCount === 0) return null;

  // 3) Representative post for context (latest published this month)
  const latest = await prisma.blogPost.findFirst({
    where: {
      authorId: winnerAuthorId,
      published: true,
      createdAt: { gte: monthStartUtc, lt: monthEndUtc },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!latest?.id) return null;

  // 4) Persist + award badge (concurrency safe)
  try {
    await prisma.featuredPost.create({
      data: {
        type: FEATURED_POST.TOP_CREATOR_MONTH,
        date: monthStartUtc,
        postId: latest.id,
      },
    });

    await badgeService.awardTopCreatorMonthToUser({
      userId: winnerAuthorId,
      monthStartUtc,
      monthEndUtc,
      postCount,
      context: { postId: latest.id },
    });
  } catch (e) {
    // Someone else computed first
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }

  return latest.id;
}
export default {
  computeTopCreatorThisMonth
}