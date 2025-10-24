import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.tag.deleteMany();
  await prisma.skill.deleteMany();

  // --- TAGS ---
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

  // --- SKILLS ---
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

  await prisma.tag.createMany({
    data: tags.map((name) => ({ name })),
  });

  await prisma.skill.createMany({
    data: skills,
  });

  console.log(`✅ Seeded ${tags.length} tags and ${skills.length} skills.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
