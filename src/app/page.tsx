import {
  getProfile,
  getPublishedProjects,
  getEnabledServices,
  getSettings,
  serializeProfile,
  serializeProject,
  serializeService,
} from "@/lib/data";
import type { Metadata } from "next";
import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import About from "@/components/site/About";
import Services from "@/components/site/Services";
import Crafted from "@/components/site/Crafted";
import WorkSection from "@/components/site/WorkSection";
import Stats from "@/components/site/Stats";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const s = await getSettings();
    if (s?.siteTitle) {
      return {
        title: s.siteTitle,
        description: s.siteDescription || undefined,
      };
    }
  } catch {
    /* fall through to static defaults */
  }
  return {};
}

export default async function HomePage() {
  const [profileRow, projects, serviceRows] = await Promise.all([
    getProfile(),
    getPublishedProjects(),
    getEnabledServices(),
  ]);

  const profileDTO = profileRow
    ? serializeProfile(profileRow)
    : {
        id: 0,
        name: "NITESH KUAMR",
        professionalTitle: "VIDEO EDITOR · MOTION GRAPHIC DESIGNER",
        location: "Delhi, India",
        email: "niteshedits2002@gmail.com",
        phone: "+91 93158 41623",
        whatsapp: "919315841623",
        instagramHandle: "@framesbyniteshh",
        instagramUrl: "https://www.instagram.com/framesbyniteshh/",
        heroEyebrow: "VIDEO EDITOR · MOTION DESIGNER",
        heroHeading: "I TURN RAW FOOTAGE\nINTO *visual stories*\nTHAT PEOPLE REMEMBER.",
        heroDescription: "I'm Nitesh — a video editor and motion designer from Delhi.",
        heroPrimaryBtn: "View my work",
        heroSecondaryBtn: "Let's talk",
        portraitUrl: "/images/portrait.webp",
        aboutHeading: "",
        aboutText: "",
        aboutExtra: "",
        contactHeading: "HAVE A PROJECT\nIN MIND?",
        contactSubheading: "Let's make it move.",
        contactIntro: "Tell me about the story you're trying to tell.",
        footerName: "NITESH KUAMR",
        copyrightText: "© 2026 NITESH KUAMR",
        projectsCount: projects.length,
        updatedAt: new Date().toISOString(),
      };

  const projectDTOs = projects.map(serializeProject);
  const serviceDTOs = serviceRows.map(serializeService);
  const statsCount =
    profileDTO.projectsCount > 0 ? profileDTO.projectsCount : projectDTOs.length;

  return (
    <main>
      <Nav name={profileDTO.name} />
      <Hero
        eyebrow={profileDTO.heroEyebrow || profileDTO.professionalTitle}
        heading={profileDTO.heroHeading}
        description={profileDTO.heroDescription}
        primaryBtn={profileDTO.heroPrimaryBtn || "View my work"}
        secondaryBtn={profileDTO.heroSecondaryBtn || "Let's talk"}
        portraitUrl={profileDTO.portraitUrl}
        name={profileDTO.name}
        location={profileDTO.location}
      />
      <Marquee />
      <About
        heading={profileDTO.aboutHeading}
        text={profileDTO.aboutText}
        extra={profileDTO.aboutExtra}
        location={profileDTO.location}
      />
      <Crafted />
      <Services services={serviceDTOs} />
      <WorkSection projects={projectDTOs} />
      <Stats projectsCount={statsCount} />
      <Contact profile={profileDTO} />
      <Footer profile={profileDTO} />
    </main>
  );
}
