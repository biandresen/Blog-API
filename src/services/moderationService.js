import prisma from "../config/prismaClient.js";

let moderationTermsCache = [];
let lastLoadedAt = null;

function normalizeTerm(term) {
  return term.toLowerCase().trim();
}

async function loadModerationTerms() {
  const terms = await prisma.moderationTerm.findMany({
    where: { isActive: true },
    orderBy: { term: "asc" },
    select: {
      id: true,
      term: true,
      category: true,
    },
  });

  moderationTermsCache = terms
    .map((item) => normalizeTerm(item.term))
    .filter(Boolean);

  lastLoadedAt = new Date();

  return moderationTermsCache;
}

function getModerationTermsFromCache() {
  return moderationTermsCache;
}

function getModerationCacheMeta() {
  return {
    count: moderationTermsCache.length,
    lastLoadedAt,
    termsLoaded: moderationTermsCache.length > 0,
  };
}

async function ensureModerationTermsLoaded() {
  if (moderationTermsCache.length === 0) {
    await loadModerationTerms();
  }

  return moderationTermsCache;
}

async function getAllModerationTerms() {
  return prisma.moderationTerm.findMany({
    orderBy: [{ isActive: "desc" }, { term: "asc" }],
  });
}

async function createModerationTerm(data) {
  const normalizedTerm = normalizeTerm(data.term);

  const existing = await prisma.moderationTerm.findUnique({
    where: { term: normalizedTerm },
  });

  if (existing) {
    throw new Error("Moderation term already exists");
  }

  const created = await prisma.moderationTerm.create({
    data: {
      term: normalizedTerm,
      category: data.category ?? null,
      isActive: data.isActive ?? true,
    },
  });

  await loadModerationTerms();
  return created;
}

async function updateModerationTerm(id, data) {
  const existing = await prisma.moderationTerm.findUnique({
    where: { id },
  });

  if (!existing) return null;

  const nextTerm =
    data.term !== undefined ? normalizeTerm(data.term) : undefined;

  if (nextTerm && nextTerm !== existing.term) {
    const duplicate = await prisma.moderationTerm.findUnique({
      where: { term: nextTerm },
    });

    if (duplicate) {
      throw new Error("Moderation term already exists");
    }
  }

  const updated = await prisma.moderationTerm.update({
    where: { id },
    data: {
      ...(nextTerm !== undefined ? { term: nextTerm } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });

  await loadModerationTerms();
  return updated;
}

async function deleteModerationTerm(id) {
  const existing = await prisma.moderationTerm.findUnique({
    where: { id },
  });

  if (!existing) return null;

  const deleted = await prisma.moderationTerm.delete({
    where: { id },
  });

  await loadModerationTerms();
  return deleted;
}

async function getPublicModerationTerms() {
  const terms = await ensureModerationTermsLoaded();
  return terms;
}

async function getModerationTermById(id) {
  const term = await prisma.moderationTerm.findUnique({where: {id}}
  )
  return term
}

export default {
  loadModerationTerms,
  ensureModerationTermsLoaded,
  getModerationTermById,
  getModerationTermsFromCache,
  getModerationCacheMeta,
  getAllModerationTerms,
  createModerationTerm,
  updateModerationTerm,
  deleteModerationTerm,
  getPublicModerationTerms
};