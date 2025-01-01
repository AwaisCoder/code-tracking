const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Read the old user data (from `users_old.json`).
const usersOld = JSON.parse(fs.readFileSync('users_old.json', 'utf8'));

async function transformUserData() {
  for (const oldUser of usersOld) {
    const transformedUser = {
      email: oldUser.email,
      username: oldUser.username,
      clerkId: oldUser.clerkId,
      name: oldUser.name || null,
      bio: oldUser.bio || null,
      image: oldUser.image || null,
      location: oldUser.location || null,
      website: oldUser.website || null,
      createdAt: new Date(oldUser.createdAt), // Assuming createdAt is in the correct format
      updatedAt: new Date(oldUser.updatedAt), // Assuming updatedAt is in the correct format
    };

    const newUser = await prisma.user.create({
      data: transformedUser,
    });

    // Map related entities like posts, comments, etc. based on the old user data.
    if (oldUser.posts) {
      for (const oldPost of oldUser.posts) {
        await prisma.post.create({
          data: {
            authorId: newUser.id,
            content: oldPost.content,
            image: oldPost.image || null,
          },
        });
      }
    }

    // Similar logic for comments, likes, followers, etc.
  }

  console.log('Data transformation complete!');
}

// Start the transformation
transformUserData()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
