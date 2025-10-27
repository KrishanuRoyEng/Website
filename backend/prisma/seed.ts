import { PrismaClient, Permission } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding user and member data...");

  // Super-Admin Data from Environment Variables
  const superadminGithubId = process.env.SUPERADMIN_GITHUB_ID;
  const superadminUsername = process.env.SUPERADMIN_USERNAME;
  const superadminEmail = process.env.SUPERADMIN_EMAIL;
  const superadminAvatarUrl = process.env.SUPERADMIN_AVATAR_URL;
  const superadminGithubUrl = process.env.SUPERADMIN_GITHUB_URL;

  // Check if all required superadmin environment variables are set
  const hasSuperadminConfig = 
    superadminGithubId && 
    superadminUsername && 
    superadminEmail;

  if (hasSuperadminConfig) {
    // Super-Admin User Data
    const userData = {
      githubId: superadminGithubId,
      username: superadminUsername,
      email: superadminEmail,
      avatarUrl: superadminAvatarUrl,
      githubUrl: superadminGithubUrl,
      role: "ADMIN" as const,
      isActive: true,
      isLead: true,
    };

    // Super-Admin Profile Data
    const memberData = {
      fullName: "Admin",
      bio: "Full-stack developer passionate about building amazing web applications and leading tech communities.",
      roleTitle: "Full-stack Developer",
      devStack: "React, Next.js, Node.js, TypeScript, PostgreSQL, Prisma"
    };

    try {
      // Create or update user
      const user = await prisma.user.upsert({
        where: { githubId: userData.githubId },
        update: userData,
        create: userData,
      });

      console.log(`✅ Superadmin user ${user.username} seeded successfully`);

      // Create or update member profile
      const member = await prisma.member.upsert({
        where: { userId: user.id },
        update: { ...memberData, userId: user.id },
        create: { ...memberData, userId: user.id },
      });

      console.log(`✅ Superadmin member profile for ${member.fullName} seeded successfully`);
      console.log(`📊 User ID: ${user.id}, Member ID: ${member.id}`);
    } catch (error) {
      console.error("❌ Error seeding superadmin data:", error);
    }
  } else {
    console.log("⚠️ Superadmin environment variables not fully set, skipping superadmin seeding");
    console.log("Set these environment variables in Railway:");
    console.log("SUPERADMIN_GITHUB_ID, SUPERADMIN_USERNAME, SUPERADMIN_EMAIL, SUPERADMIN_FULL_NAME");
  }

  // --- PREDEFINED CUSTOM ROLES ---
  console.log("🎭 Seeding predefined custom roles...");

  const predefinedRoles = [
    {
      name: "Moderator",
      description: "Can manage members, projects, and events. Ideal for community moderators.",
      color: "#3B82F6", // Blue
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_MEMBERS,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_EVENTS,
      ]
    },
    {
      name: "Content Manager",
      description: "Can manage projects, events, skills, and tags. Perfect for content curation.",
      color: "#10B981", // Green
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_EVENTS,
        Permission.MANAGE_SKILLS,
        Permission.MANAGE_TAGS,
      ]
    },
    {
      name: "Project Reviewer",
      description: "Specialized role for reviewing and approving projects.",
      color: "#F59E0B", // Amber
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_PROJECTS,
      ]
    },
    {
      name: "Event Coordinator",
      description: "Focused on managing events and community activities.",
      color: "#8B5CF6", // Violet
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_EVENTS,
      ]
    },
    {
      name: "Tech Lead",
      description: "Technical leadership role with broad content management permissions.",
      color: "#EC4899", // Pink
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_PROJECTS,
        Permission.MANAGE_SKILLS,
        Permission.MANAGE_TAGS,
      ]
    },
    {
      name: "Community Manager",
      description: "Focuses on member management and community engagement.",
      color: "#06B6D4", // Cyan
      permissions: [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_MEMBERS,
        Permission.MANAGE_EVENTS,
      ]
    }
  ];

  let rolesAdded = 0;
  for (const roleData of predefinedRoles) {
    try {
      await prisma.customRole.upsert({
        where: { name: roleData.name },
        update: {
          description: roleData.description,
          color: roleData.color,
          permissions: roleData.permissions,
        },
        create: {
          name: roleData.name,
          description: roleData.description,
          color: roleData.color,
          permissions: roleData.permissions,
          createdBy: hasSuperadminConfig ? 
            (await prisma.user.findFirst({ where: { role: "ADMIN" } }))?.id : 
            undefined,
        },
      });
      rolesAdded++;
      console.log(`✅ Role "${roleData.name}" seeded successfully`);
    } catch (error) {
      console.error(`❌ Error seeding role "${roleData.name}":`, error);
    }
  }

  console.log(`✅ Seeded ${rolesAdded} predefined custom roles.`);

  // --- TAGS ---
  console.log("🏷️ Seeding tags...");
  const tags = [
    // General project types
    "Web Development",
    "Mobile App",
    "Desktop App",
    "Game Development",
    "Machine Learning",
    "Artificial Intelligence",
    "Deep Learning",
    "Data Science",
    "Open Source",
    "Portfolio",
    "Hackathon Project",
    "Research Project",
    "Final Year Project",
    "Automation",
    "API Development",
    "UI/UX Design",
    "Fullstack",
    "Frontend",
    "Backend",
    "Cloud",
    "DevOps",
    "Cybersecurity",
    "Competitive Programming",
    "Embedded Systems",
    "Blockchain",
    "IoT",
    "AR/VR",
    "Software Tool",
    "Productivity",
    "Utility",
    "Plugin / Extension",
    "CLI Tool",
    "Educational Project",
    "Club Project",
    "Collaboration",
  ];

  // Add only new tags that don't exist
  let tagsAdded = 0;
  for (const tagName of tags) {
    try {
      await prisma.tag.upsert({
        where: { name: tagName },
        update: {}, // Don't update if exists
        create: { name: tagName },
      });
      tagsAdded++;
    } catch (error) {
      // Silent skip for existing tags
    }
  }

  // --- SKILLS ---
  console.log("🛠️ Seeding skills...");
  const skills = [
    // Languages
    { name: "C", category: "Language" },
    { name: "C++", category: "Language" },
    { name: "Java", category: "Language" },
    { name: "Python", category: "Language" },
    { name: "JavaScript", category: "Language" },
    { name: "TypeScript", category: "Language" },
    { name: "Go", category: "Language" },
    { name: "Rust", category: "Language" },
    { name: "Kotlin", category: "Language" },
    { name: "Swift", category: "Language" },
    { name: "PHP", category: "Language" },
    { name: "SQL", category: "Language" },
    { name: "R", category: "Language" },
    { name: "Bash", category: "Language" },

    // Web / App Frameworks
    { name: "React", category: "Framework" },
    { name: "Next.js", category: "Framework" },
    { name: "Vue.js", category: "Framework" },
    { name: "Nuxt.js", category: "Framework" },
    { name: "Angular", category: "Framework" },
    { name: "Svelte", category: "Framework" },
    { name: "Node.js", category: "Backend Framework" },
    { name: "Express.js", category: "Backend Framework" },
    { name: "NestJS", category: "Backend Framework" },
    { name: "Django", category: "Backend Framework" },
    { name: "Flask", category: "Backend Framework" },
    { name: "Spring Boot", category: "Backend Framework" },
    { name: "FastAPI", category: "Backend Framework" },
    { name: "Laravel", category: "Backend Framework" },
    { name: "Ruby on Rails", category: "Backend Framework" },

    // Mobile Development
    { name: "React Native", category: "Mobile" },
    { name: "Flutter", category: "Mobile" },
    { name: "Android Studio", category: "Mobile" },
    { name: "SwiftUI", category: "Mobile" },

    // Databases
    { name: "PostgreSQL", category: "Database" },
    { name: "MySQL", category: "Database" },
    { name: "SQLite", category: "Database" },
    { name: "MongoDB", category: "Database" },
    { name: "Redis", category: "Database" },
    { name: "Firebase", category: "Database" },
    { name: "Supabase", category: "Database" },
    { name: "Prisma ORM", category: "ORM" },
    { name: "Drizzle ORM", category: "ORM" },
    { name: "Sequelize", category: "ORM" },

    // DevOps / Cloud
    { name: "Docker", category: "DevOps" },
    { name: "Kubernetes", category: "DevOps" },
    { name: "AWS", category: "Cloud" },
    { name: "Azure", category: "Cloud" },
    { name: "Google Cloud", category: "Cloud" },
    { name: "Vercel", category: "Cloud" },
    { name: "Netlify", category: "Cloud" },
    { name: "CI/CD", category: "DevOps" },
    { name: "GitHub Actions", category: "DevOps" },

    // AI / Data
    { name: "TensorFlow", category: "AI/ML" },
    { name: "PyTorch", category: "AI/ML" },
    { name: "Keras", category: "AI/ML" },
    { name: "Scikit-learn", category: "AI/ML" },
    { name: "Pandas", category: "Data" },
    { name: "NumPy", category: "Data" },
    { name: "Matplotlib", category: "Data" },
    { name: "OpenCV", category: "AI/ML" },
    { name: "NLTK", category: "AI/ML" },
    { name: "LangChain", category: "AI/ML" },
    { name: "OpenAI API", category: "AI/ML" },

    // Design / UI
    { name: "Figma", category: "Design" },
    { name: "Adobe XD", category: "Design" },
    { name: "Canva", category: "Design" },
    { name: "Tailwind CSS", category: "UI" },
    { name: "Bootstrap", category: "UI" },
    { name: "Framer Motion", category: "UI" },
    { name: "ShadCN/UI", category: "UI" },

    // Tools & Collaboration
    { name: "Git", category: "Tool" },
    { name: "GitHub", category: "Tool" },
    { name: "VS Code", category: "Tool" },
    { name: "Jira", category: "Tool" },
    { name: "Notion", category: "Tool" },
    { name: "Postman", category: "Tool" },
    { name: "Linux", category: "Tool" },

    // Security / Misc
    { name: "Penetration Testing", category: "Cybersecurity" },
    { name: "Ethical Hacking", category: "Cybersecurity" },
    { name: "Blockchain", category: "Emerging Tech" },
    { name: "Solidity", category: "Emerging Tech" },
    { name: "Raspberry Pi", category: "IoT" },
    { name: "Arduino", category: "IoT" },
    { name: "Unity", category: "Game Dev" },
    { name: "Unreal Engine", category: "Game Dev" },
  ];

  // Add only new skills that don't exist
  let skillsAdded = 0;
  for (const skill of skills) {
    try {
      await prisma.skill.upsert({
        where: { name: skill.name },
        update: {}, // Don't update if exists
        create: skill,
      });
      skillsAdded++;
    } catch (error) {
      // Silent skip for existing skills
    }
  }

  console.log(`✅ Seeding completed!`);
  console.log(`📊 Summary:`);
  console.log(`   - ${rolesAdded} predefined custom roles`);
  console.log(`   - ${tagsAdded} new tags (Total: ${await prisma.tag.count()})`);
  console.log(`   - ${skillsAdded} new skills (Total: ${await prisma.skill.count()})`);
  console.log(`   - Custom roles available: Moderator, Content Manager, Project Reviewer, Event Coordinator, Tech Lead, Community Manager`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });