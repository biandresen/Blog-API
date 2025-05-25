import prisma from "./prismaClient.js";

async function seed() {
  try {
    // Clear existing data (optional for fresh seeding)
    await prisma.comment.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    const user1 = await prisma.user.create({
      data: {
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        role: "USER",
      },
    });

    const admin = await prisma.user.create({
      data: {
        username: "adminuser",
        email: "admin@example.com",
        password: "admin123",
        role: "ADMIN",
      },
    });

    // Create Tags
    const tagTech = await prisma.tag.create({ data: { name: "Tech" } });
    const tagLife = await prisma.tag.create({ data: { name: "Lifestyle" } });

    // Create BlogPosts
    const post1 = await prisma.blogPost.create({
      data: {
        title: "First Blog Post",
        body: "This is the body of the first post.",
        published: true,
        authorId: user1.id,
        tags: {
          connect: [{ id: tagTech.id }, { id: tagLife.id }],
        },
      },
    });

    const post2 = await prisma.blogPost.create({
      data: {
        title: "Admin Post",
        body: "Insights from an admin.",
        published: true,
        authorId: admin.id,
        tags: {
          connect: [{ id: tagTech.id }],
        },
      },
    });

    // Create Comments
    await prisma.comment.create({
      data: {
        authorId: user1.id,
        postId: post2.id,
        body: "Great insights!",
      },
    });

    await prisma.comment.create({
      data: {
        authorId: admin.id,
        postId: post1.id,
        body: "Nice blog post!",
      },
    });

    console.log("✅ Seed data created successfully.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
