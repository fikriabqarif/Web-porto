import type { Metadata } from "next";

/**
 * Static, hand-edited content for the public site, sourced from Fikri's CV.
 * Everything here is compile-time data — change the file, the pages follow.
 *
 * Privacy note: the CV carries a full street address. The public site only
 * shows city + country; the full address stays in the PDF.
 */

export const site = {
  name: "Fikri Abqari Fawwaz",
  shortName: "Fikri",
  identityLine: "Electronics & Instrumentation · Robotics",
  university: "Universitas Gadjah Mada — Electronics and Instrumentation (DIKE FMIPA)",
  universityShort: "Universitas Gadjah Mada",
  location: "Sleman, Yogyakarta, Indonesia",
  email: "fikriabqarifawwaz@mail.ugm.ac.id",
  emailAlt: "fikriabqarifawwaz@gmail.com",
  phone: "+62 822-8301-0847",
  github: "https://github.com/fikriabqarif",
  githubHandle: "github.com/fikriabqarif",
  linkedin: "https://www.linkedin.com/in/fikriabqarifawwaz",
  linkedinHandle: "linkedin.com/in/fikriabqarifawwaz",
  tagline:
    "I build robots end to end: mechanical design in Fusion 360, embedded control on Arduino and ESP32, and the sensor fusion that lets them move on their own.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type Paragraph = string;

export const bio: Paragraph[] = [
  "Electronics and Instrumentation student at Universitas Gadjah Mada (GPA 3.74, expected 2028). My work sits where mechanical design meets embedded control: cad models that survive FDM printing, sensor mounts that stay aligned, and firmware that turns noisy readings into a decision.",
  "Captain of the H8 GMRT UGM team for the KRI competition, leading a 20+ member multidisciplinary team across mechanical, electrical and software divisions. I also design and assemble research robots with the ERC Robotics Division, and I have spent two competition cycles in project management keeping other people's timelines honest.",
  "The thread through all of it is autonomous machines: PID control, LiDAR-assisted obstacle avoidance, path planning, and the careful calibration work that makes a demo repeatable instead of lucky.",
];

export type Stat = { value: string; label: string };

export const stats: Stat[] = [
  { value: "3.74", label: "GPA / 4.00" },
  { value: "20+", label: "Team members led" },
  { value: "7", label: "Robotics projects" },
  { value: "3", label: "Competition committees" },
];

export type EducationItem = {
  period: string;
  title: string;
  place: string;
  detail?: string;
};

export const education: EducationItem[] = [
  {
    period: "Sep 2024 — 2028",
    title: "B.Sc. Electronics and Instrumentation",
    place: "Universitas Gadjah Mada, Sleman, Yogyakarta",
    detail: "GPA 3.74 / 4.00. Department of Electrical Engineering and Information Technology, Faculty of Mathematics and Natural Sciences.",
  },
];

export type ExperienceItem = {
  period: string;
  role: string;
  org: string;
  place: string;
  bullets: string[];
};

/** Engineering & technical experience. */
export const experience: ExperienceItem[] = [
  {
    period: "2025 — 2026",
    role: "Captain",
    org: "H8 GMRT UGM",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Directed overall operations and the competitive roadmap for a 20+ member multidisciplinary team spanning mechanical, electrical and software divisions for KRI.",
      "Streamlined project timelines and resource allocation, reaching 100% on-time milestone delivery across all three technical divisions.",
    ],
  },
  {
    period: "2025 — now",
    role: "Staff, Robotics Division",
    org: "ERC — Elins Research Club",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Contribute to the design and assembly of research robots, focusing on mechanical integration and iterative prototyping of locomotion systems.",
      "Work with the electrical and software divisions to validate sensor mounting, wiring layout and overall system integration.",
    ],
  },
  {
    period: "2025 — now",
    role: "Staff, Inventory & Assets Division",
    org: "Electronics Instrumentation Student Association",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Manage inventory and asset tracking for the department's student organisation, covering procurement, distribution and maintenance of shared equipment.",
      "Implemented a digital logging system that streamlined equipment checkout and return across 5+ laboratory spaces.",
    ],
  },
  {
    period: "2024 — 2025",
    role: "Staff, Project Management Division",
    org: "ERC — Elins Research Club",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Managed research timelines and task distribution for the ERC web division, establishing weekly review cadences and documentation standards.",
      "Raised task completion from under 60% to consistently above 90% across two development cycles through structured project tracking.",
    ],
  },
  {
    period: "2024 — 2025",
    role: "Staff, PKM-KC 2025",
    org: "Student Creativity Program — Constructive Design",
    place: "Yogyakarta",
    bullets: [
      "Designed an ergonomic enclosure for a medical detection device in Autodesk Inventor, iterating through five revisions to cut device footprint by 15%.",
      "Produced manufacture-ready 3D models and 2D technical drawings, coordinating with the electronics team to validate fit and component clearance.",
    ],
  },
  {
    period: "2024 — 2025",
    role: "Staff, Mechanical",
    org: "H8 GMRT UGM",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Designed and fabricated lightweight robot chassis in Fusion 360 for the KRI competition, optimising structural strength-to-weight ratio.",
      "Manufactured load-bearing components via FDM 3D printing and CNC machining, holding dimensional accuracy within a 0.2 mm tolerance.",
    ],
  },
];

/** Organisational & leadership experience. */
export const organizations: ExperienceItem[] = [
  {
    period: "2026",
    role: "Head of Sumo Robot Division",
    org: "INSPIRE 2026 Sumo Robot Competition Committee",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Led the Sumo Robot division, coordinating match scheduling, technical inspection and arena setup for 30+ participating teams.",
      "Managed a committee of 10+ members, delegating logistics, registration and on-field operations to keep the event running on schedule.",
    ],
  },
  {
    period: "2024 — 2025",
    role: "Staff",
    org: "INSPIRE 2025 Sumo Robot Competition Committee",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Supported event logistics: arena preparation, participant registration and equipment inventory.",
      "Coordinated with technical judges during match rounds to keep play compliant with the competition regulations.",
    ],
  },
  {
    period: "2024 — 2025",
    role: "Staff",
    org: "MALPRES MIPA 2025 Event Committee",
    place: "Sleman, Yogyakarta",
    bullets: [
      "Helped organise the MIPA appreciation night, handling venue setup, decorations and guest management for 200+ attendees.",
      "Managed communication with external vendors and sponsors to keep event materials and catering on schedule.",
    ],
  },
];

export type HighlightProject = {
  slug: string;
  title: string;
  period: string;
  tags: string[];
  summary: string;
  bullets: string[];
};

/**
 * CV project list. Long-form write-ups live in the database and are edited from
 * the admin panel; this array is the short form used on the home page and CV page.
 */
export const highlightProjects: HighlightProject[] = [
  {
    slug: "autonomous-conventional-vehicle",
    title: "Conversion of Conventional Vehicles into Autonomous Vehicles",
    period: "2026 — now",
    tags: ["Sensor Fusion", "Path Planning"],
    summary:
      "Actuation control for a conventional car turned autonomous platform, with sensor fusion and path planning for structured environments.",
    bullets: [
      "Developed actuation control systems for converting conventional vehicles into autonomous platforms, integrating sensor fusion and path-planning algorithms for structured-environment navigation.",
      "Implemented PID-based motor control and LiDAR-assisted obstacle avoidance, achieving reliable low-speed navigation in controlled test environments.",
    ],
  },
  {
    slug: "underwater-rov-pipe-tracking",
    title: "Underwater ROV for Autonomous Pipe Tracking",
    period: "2026 — now",
    tags: ["ROV", "Sensor Fusion"],
    summary:
      "An underwater ROV that follows pipelines on its own, streaming inspection telemetry to the surface.",
    bullets: [
      "Built an underwater ROV with sensor fusion for autonomous pipe tracking, enabling real-time pipeline inspection with telemetry and remote control.",
      "Integrated IMU and pressure sensor data for depth stabilisation and pipeline following, demonstrating tracking accuracy in pool trials.",
    ],
  },
  {
    slug: "capstone-spider-robot",
    title: "Capstone Spider Robot",
    period: "2026 — now",
    tags: ["Fusion 360", "Arduino"],
    summary:
      "A multi-legged walking robot: linkage design in CAD, gait patterns in firmware, validated on uneven ground.",
    bullets: [
      "Designed a multi-legged spider robot as a capstone project, modelling the mechanical linkage system and programming locomotion gait patterns.",
      "Fabricated the chassis via FDM 3D printing and validated walking stability across uneven terrain through iterative testing.",
    ],
  },
  {
    slug: "robodu-educational-robot",
    title: "RoboDu Educational Robot",
    period: "2025",
    tags: ["Fusion 360", "3D Printing"],
    summary:
      "Modular mechanical assemblies for an educational robotics platform, built for rapid swap-and-repair.",
    bullets: [
      "Developed modular mechanical assemblies enabling fast swap-and-repair of drive trains and sensor mounts.",
      "Built and tested three functional prototypes over eight weeks, refining joint mechanisms and wheel alignment for stable navigation on uneven surfaces.",
    ],
  },
  {
    slug: "seed-sorting-robot",
    title: "Seed Sorting Robot",
    period: "2025",
    tags: ["Arduino", "Sensors"],
    summary:
      "Colour-sensor sorting with servo-driven gates, classifying seeds by size and colour in real time.",
    bullets: [
      "Engineered a seed-sorting robot combining colour sensors and servo-driven sorting mechanisms to classify objects by size and colour in real time.",
      "Reached 90%+ sorting accuracy in lab tests by optimising sensor calibration and gate timing for consistent throughput.",
    ],
  },
  {
    slug: "five-dof-robot-arm",
    title: "5 DoF Robot Arm",
    period: "2025",
    tags: ["Fusion 360", "Servo Control"],
    summary:
      "A five-degree-of-freedom arm modelled from scratch, with inverse kinematics for pick-and-place.",
    bullets: [
      "Designed and assembled a five-degree-of-freedom robot arm, modelling all linkages in Fusion 360 and programming inverse kinematics for precise pick-and-place tasks.",
      "Calibrated servo angles and joint limits to reach a 30 cm workspace radius with repeatable positioning accuracy.",
    ],
  },
  {
    slug: "g-connect-erc",
    title: "G-Connect ERC",
    period: "2024 — 2025",
    tags: ["Staff Mechanic", "Fusion 360"],
    summary:
      "Housings and brackets for an IoT connectivity module, tuned for cheaper, faster printing.",
    bullets: [
      "Generated 3D models of housings and brackets for the G-Connect IoT connectivity module, optimising print orientation to cut per-unit print time by about 20%.",
      "Ran tolerance fitting and assembly validation so every mechanical interface lined up with the electronics.",
    ],
  },
];

export const interests: string[] = [
  "Robotics",
  "Embedded systems",
  "Sensor fusion",
  "Autonomous navigation",
  "Mechanical design",
  "Instrumentation",
];

export type SkillGroup = { label: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    label: "CAD & Design",
    items: ["Fusion 360", "Autodesk Inventor", "Rapid prototyping", "FDM manufacturing"],
  },
  {
    label: "Programming",
    items: ["C", "Python"],
  },
  {
    label: "Hardware & Systems",
    items: ["Arduino", "ESP32", "Sensors & actuators", "Circuit design"],
  },
  {
    label: "Developer Tools",
    items: ["Git", "GitHub", "Linux", "PlatformIO"],
  },
];

/** Short labels for the skill strip on the home page. */
export const marqueeSkills: string[] = [
  "Fusion 360",
  "Autodesk Inventor",
  "FDM 3D printing",
  "CNC machining",
  "Arduino",
  "ESP32",
  "PID control",
  "Sensor fusion",
  "Path planning",
  "C",
  "Python",
  "PlatformIO",
  "Linux",
  "Git",
];

export function pageMetadata(options: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${site.siteUrl.replace(/\/$/, "")}${options.path}`;
  return {
    title: options.title,
    description: options.description,
    alternates: { canonical: url },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
    },
  };
}
