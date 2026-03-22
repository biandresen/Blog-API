import prisma from "./prismaClient.js";

const moderationTerms = [
  // Norwegian profanity / insults / sexual / slurs
  { term: "faen", category: "profanity" },
  { term: "fanden", category: "profanity" },
  { term: "jævla", category: "profanity" },
  { term: "jævlig", category: "profanity" },
  { term: "jævel", category: "profanity" },
  { term: "helvete", category: "profanity" },
  { term: "fitte", category: "sexual" },
  { term: "kuk", category: "sexual" },
  { term: "pikk", category: "sexual" },
  { term: "hore", category: "slur" },
  { term: "idiot", category: "insult" },
  { term: "dum", category: "insult" },
  { term: "dust", category: "insult" },
  { term: "taper", category: "insult" },
  { term: "mongo", category: "slur" },
  { term: "retard", category: "slur" },
  { term: "retardert", category: "slur" },
  { term: "neger", category: "slur" },
  { term: "pakkis", category: "slur" },
  { term: "horeunge", category: "slur" },
  { term: "knulle", category: "sexual" },
  { term: "porno", category: "sexual" },

  // English profanity / insults / sexual / slurs
  { term: "fuck", category: "profanity" },
  { term: "fucking", category: "profanity" },
  { term: "fucker", category: "profanity" },
  { term: "motherfucker", category: "profanity" },
  { term: "shit", category: "profanity" },
  { term: "bullshit", category: "profanity" },
  { term: "asshole", category: "profanity" },
  { term: "bitch", category: "slur" },
  { term: "bastard", category: "insult" },
  { term: "dick", category: "sexual" },
  { term: "cock", category: "sexual" },
  { term: "pussy", category: "sexual" },
  { term: "cunt", category: "slur" },
  { term: "moron", category: "insult" },
  { term: "stupid", category: "insult" },
  { term: "dumb", category: "insult" },
  { term: "loser", category: "insult" },
  { term: "clown", category: "insult" },
  { term: "freak", category: "insult" },
  { term: "weirdo", category: "insult" },
  { term: "sex", category: "sexual" },
  { term: "porn", category: "sexual" },
  { term: "pornography", category: "sexual" },
  { term: "dildo", category: "sexual" },
  { term: "blowjob", category: "sexual" },
  { term: "handjob", category: "sexual" },
  { term: "nigger", category: "slur" },
  { term: "nigga", category: "slur" },
  { term: "faggot", category: "slur" },
  { term: "fag", category: "slur" },
  { term: "slut", category: "slur" },
  { term: "whore", category: "slur" },
  { term: "tranny", category: "slur" },
];

async function seed() {
  try {
    for (const item of moderationTerms) {
      await prisma.moderationTerm.upsert({
        where: { term: item.term.toLowerCase().trim() },
        update: {
          category: item.category,
          isActive: true,
        },
        create: {
          term: item.term.toLowerCase().trim(),
          category: item.category,
          isActive: true,
        },
      });
    }

    console.log(`Seeded ${moderationTerms.length} moderation terms`);
  } catch (error) {
    console.error("Failed to seed moderation terms:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log("Seeding done");
  }
}

seed();