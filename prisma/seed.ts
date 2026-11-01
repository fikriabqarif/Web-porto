import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

// `tsx` does not read .env the way the Prisma CLI does, so load it here.
function loadEnv(): void {
  if (process.env.DATABASE_URL) return;
  const file = path.resolve(process.cwd(), ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const key = match[1] as string;
    const value = (match[2] ?? "").replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv();

const prisma = new PrismaClient();

/**
 * Placeholder content shipped with the template. Removed on seed, but only when
 * it still carries the original banner — anything rewritten in the admin panel
 * is left alone.
 */
const TEMPLATE_PROJECT_SLUGS = ["iot-weather-station", "digital-data-logger", "line-following-robot"];
const TEMPLATE_POST_SLUGS = ["clean-adc-readings-noisy-breadboard", "how-i-set-up-my-kicad-workspace"];

/**
 * Projects are listed newest first (by createdAt), so they are inserted in
 * chronological order here. Content follows the CV; nothing is invented.
 */
const projects = [
  {
    slug: "g-connect-erc",
    title: "G-Connect ERC",
    summary:
      "Housings and brackets for the ERC G-Connect IoT connectivity module, modelled for cheaper, faster printing.",
    role: "Staff mechanic — CAD",
    tags: ["Fusion 360", "3D Printing", "IoT"],
    featured: false,
    githubUrl: null as string | null,
    demoUrl: null as string | null,
    description: `## What it is

Mechanical work for G-Connect, the ERC IoT connectivity module: enclosures and mounting brackets designed around the electronics rather than walled off from them.

## What I did

- Generated 3D models of housings and brackets in Fusion 360, optimising print orientation to cut per-unit print time by roughly 20%.
- Ran tolerance fitting and assembly validation so every mechanical interface lined up with the actual electronic components.
`,
  },
  {
    slug: "five-dof-robot-arm",
    title: "5 DoF Robot Arm",
    summary:
      "A five-degree-of-freedom arm modelled from scratch, with inverse kinematics for pick-and-place tasks.",
    role: "Personal project",
    tags: ["Fusion 360", "Servo Control", "Kinematics"],
    featured: false,
    githubUrl: null,
    demoUrl: null,
    description: `## What it is

A five-degree-of-freedom arm built from the linkage up: every part modelled in Fusion 360, every joint driven by a hobby servo and planned through inverse kinematics.

## What I did

- Designed and assembled the arm from scratch, modelling all linkages in CAD before cutting or printing anything.
- Programmed inverse kinematics for pick-and-place, then calibrated servo angles and joint limits against the real hardware.

## Result

A reachable workspace of 30 cm radius with repeatable positioning accuracy.
`,
  },
  {
    slug: "seed-sorting-robot",
    title: "Seed Sorting Robot",
    summary:
      "Colour sensors, servo-driven gates and a mechanical sorting path that classifies seeds by size and colour in real time.",
    role: "Design and firmware",
    tags: ["Arduino", "Sensors", "Automation"],
    featured: false,
    githubUrl: null,
    demoUrl: null,
    description: `## What it is

A lab-scale sorting machine: seed goes in, colour sensor reads it, a servo-driven gate sends it to the matching bin.

## What I did

- Engineered the sorter around colour sensors and servo-driven gates to classify objects by size and colour in real time.
- Optimised sensor calibration and the mechanical gate timing so throughput stayed consistent instead of stalling on borderline readings.

## Result

90%+ sorting accuracy in lab tests.
`,
  },
  {
    slug: "robodu-educational-robot",
    title: "RoboDu Educational Robot",
    summary:
      "Modular mechanical assemblies for an educational robotics platform, built so drive trains and sensor mounts swap without a rebuild.",
    role: "Mechanical design",
    tags: ["Fusion 360", "3D Printing", "Modular Design"],
    featured: false,
    githubUrl: null,
    demoUrl: null,
    description: `## What it is

RoboDu is an educational robotics platform. My part was the mechanical side: assemblies a teacher can repair quickly, with parts that swap instead of break the build.

## What I did

- Developed modular assemblies enabling rapid swap-and-repair of drive trains and sensor mounts.
- Built and tested three functional prototypes over eight weeks, refining joint mechanisms and wheel alignment.

## Result

Stable navigation on uneven surfaces across three prototypes.
`,
  },
  {
    slug: "capstone-spider-robot",
    title: "Capstone Spider Robot",
    summary:
      "A multi-legged walking robot: linkage design in CAD, gait patterns in firmware, validated on uneven terrain.",
    role: "Design and firmware",
    tags: ["Fusion 360", "Arduino", "Robotics"],
    featured: true,
    githubUrl: null,
    demoUrl: null,
    description: `## What it is

A capstone project: a multi-legged walking robot built around a mechanical linkage system rather than wheels.

## What I did

- Modelled the linkage system and programmed the locomotion gait patterns.
- Fabricated the chassis via FDM 3D printing and validated walking stability across uneven terrain through iterative testing.

## Result

A walking platform whose walking stability was validated across uneven terrain through iterative testing.
`,
  },
  {
    slug: "underwater-rov-pipe-tracking",
    title: "Underwater ROV for Autonomous Pipe Tracking",
    summary:
      "An underwater ROV that follows pipelines on its own, fusing IMU and pressure data for depth hold and inspection telemetry.",
    role: "Sensor fusion",
    tags: ["ROV", "Sensor Fusion", "IMU"],
    featured: true,
    githubUrl: null,
    demoUrl: null,
    description: `## What it is

An underwater ROV for pipeline inspection: it tracks a pipe on its own while streaming telemetry and accepting remote control.

## What I did

- Built an underwater ROV with sensor fusion for autonomous pipe tracking, enabling real-time inspection with telemetry and manual override.
- Integrated IMU and pressure sensor data for depth stabilisation and pipeline following.

## Result

Successful pipe tracking in pool trials.
`,
  },
  {
    slug: "autonomous-conventional-vehicle",
    title: "Conversion of Conventional Vehicles into Autonomous Vehicles",
    summary:
      "Actuation control for a car turned autonomous platform: PID motor control, LiDAR obstacle avoidance and path planning.",
    role: "Actuation and navigation",
    tags: ["Sensor Fusion", "Path Planning", "PID", "LiDAR"],
    featured: true,
    githubUrl: null,
    demoUrl: null,
    description: `## What it is

Converting a conventional vehicle into an autonomous platform: the actuation layer that drives steering, throttle and brake, plus the navigation stack on top of it.

## What I did

- Developed actuation control systems for the conversion, integrating sensor fusion and path-planning algorithms for structured-environment navigation.
- Implemented PID-based motor control and LiDAR-assisted obstacle avoidance.

## Result

Reliable navigation at low speeds in controlled test environments.
`,
  },
];

type SeedProject = (typeof projects)[number];

async function main(): Promise<void> {
  const removedProjects = await prisma.project.deleteMany({
    where: { slug: { in: TEMPLATE_PROJECT_SLUGS }, description: { startsWith: "> EXAMPLE" } },
  });
  const removedPosts = await prisma.post.deleteMany({
    where: { slug: { in: TEMPLATE_POST_SLUGS }, body: { startsWith: "> EXAMPLE" } },
  });

  for (const project of projects as SeedProject[]) {
    const { slug, ...data } = project;
    await prisma.project.upsert({
      where: { slug },
      create: { slug, ...data, published: true },
      update: { ...data },
    });
  }

  // Settings are only created when missing, so admin edits survive a re-seed.
  const defaults: { key: string; value: string }[] = [
    { key: "contactEmail", value: "fikriabqarifawwaz@gmail.com" },
    { key: "cvUrl", value: "" },
    {
      key: "socials",
      value: JSON.stringify({
        github: "https://github.com/fikriabqarif",
        linkedin: "https://www.linkedin.com/in/fikriabqarifawwaz",
        instagram: "",
      }),
    },
  ];

  for (const setting of defaults) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: {},
    });
  }

  console.log(
    `Seed complete: ${projects.length} projects upserted, ${defaults.length} settings. ` +
      `Removed ${removedProjects.count} template projects and ${removedPosts.count} template notes.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
