// src/app/page.tsx
import { db } from "@/db"; // Apne db instance ka path verify kar lein
// Apne schema tables import karein (example ke liye 'projects', 'profile', 'services' likha hai)
import { projects, profile, services } from "@/db/schema"; 

// Apna fallback static data import karein
import { fallbackProfile, fallbackProjects, fallbackServices } from "@/lib/data";

// Components import
import Hero from "@/components/site/Hero";
import WorkSection from "@/components/site/WorkSection";
import Services from "@/components/site/Services";
import About from "@/components/site/About";

export default async function HomePage() {
  // 1. Default fallback data assign karein
  let profileData = fallbackProfile;
  let projectsData = fallbackProjects;
  let servicesData = fallbackServices;

  // 2. Database Fetching with Error Handling
  try {
    // DB se data fetch karne ki koshish karein
    const dbProfile = await db.query.profile.findFirst();
    const dbProjects = await db.query.projects.findMany();
    const dbServices = await db.query.services.findMany();

    // 3. Check karein ki DB se actual data mila hai ya DB empty hai
    if (dbProfile) {
      profileData = dbProfile;
    }
    
    // Agar DB mein projects hain aur array khali nahi hai, tabhi DB ka data use karein
    if (dbProjects && dbProjects.length > 0) {
      projectsData = dbProjects;
    }

    if (dbServices && dbServices.length > 0) {
      servicesData = dbServices;
    }

  } catch (error) {
    // Agar connection fail hota hai ya tables exist nahi karti hain, 
    // toh error console mein log hoga, par site crash nahi hogi.
    console.error("Database error! Falling back to src/lib/data.ts:", error);
    
    // Yahan variables pehle se hi fallbackData hold kar rahe hain, 
    // isliye koi extra assignment ki zarurat nahi hai.
  }

  // 4. Data ko components mein pass karein
  return (
    <main className="min-h-screen">
      <Hero data={profileData} />
      <About data={profileData} />
      <Services data={servicesData} />
      <WorkSection projects={projectsData} />
    </main>
  );
}
