export const instanceList = [
  {
    label: "Node.js",
    value: "node",
  },
  {
    label: "Python",
    value: "python",
  },
  {
    label: "Java",
    value: "java",
  },
  {
    label: "PHP",
    value: "php",
  },
];

export const nodeVersions = [
  {
    label: "Node.js 23 (Current)",
    value: "node:23",
    pros: ["Includes the latest features and improvements."],
    cons: [
      "Not recommended for production due to potential instability and frequent updates that might introduce breaking changes.",
    ],
  },
  {
    label: "Node.js 23 Slim (Debian-based minimal image)",
    value: "node:23-slim",
    pros: [
      "Smaller image size (~50% smaller than the full Debian-based image), leading to faster deployments and reduced attack surface.",
    ],
    cons: [
      "Some utilities and system libraries may be missing, which could be necessary for certain applications.",
    ],
  },
  {
    label: "Node.js 23 Alpine (Alpine Linux-based minimal image)",
    value: "node:23-alpine",
    pros: [
      "Extremely lightweight, resulting in fast startup times and reduced resource consumption.",
    ],
    cons: [
      "Uses musl instead of glibc, which can cause compatibility issues with some npm packages and native modules.",
    ],
  },
  {
    label: "Node.js 23 Bullseye (Debian 11-based image)",
    value: "node:23-bullseye",
    pros: [
      "Based on the stable Debian 11 release, offering a good balance between image size and compatibility.",
    ],
    cons: [
      "Slightly larger than slim variants, which may impact deployment times and resource usage.",
    ],
  },
  {
    label: "Node.js 23 Bookworm (Debian 12-based image)",
    value: "node:23-bookworm",
    pros: [
      "Includes more updated libraries and security patches compared to Bullseye.",
    ],
    cons: [
      "Potential for breaking changes in compatibility due to newer libraries and dependencies.",
    ],
  },
  {
    label: "Node.js 22 (Active LTS)",
    value: "node:22",
    pros: [
      "Stable for production environments with long-term support until 2027, ensuring reliability and security updates.",
    ],
    cons: [
      "May lack some of the latest features introduced in newer releases.",
    ],
  },
  {
    label: "Node.js 22 Slim (Debian-based minimal image)",
    value: "node:22-slim",
    pros: [
      "Reduced image size compared to the full Debian-based image, leading to faster deployments and a smaller attack surface.",
    ],
    cons: [
      "May lack certain utilities and libraries that some applications might require.",
    ],
  },
  {
    label: "Node.js 22 Alpine (Alpine Linux-based minimal image)",
    value: "node:22-alpine",
    pros: [
      "Very lightweight, resulting in quick startup times and minimal resource usage.",
    ],
    cons: [
      "Potential compatibility issues due to the use of musl instead of glibc, affecting some npm packages and native modules.",
    ],
  },
  {
    label: "Node.js 22 Bullseye (Debian 11-based image)",
    value: "node:22-bullseye",
    pros: [
      "Built on the stable Debian 11 release, offering a balance between size and compatibility.",
    ],
    cons: [
      "Larger image size compared to slim and Alpine variants, which may impact deployment speed and resource consumption.",
    ],
  },
  {
    label: "Node.js 22 Bookworm (Debian 12-based image)",
    value: "node:22-bookworm",
    pros: ["Features updated libraries and security patches over Bullseye."],
    cons: [
      "May introduce compatibility issues due to newer dependencies and potential breaking changes.",
    ],
  },
  {
    label: "Node.js 20 (Maintenance LTS)",
    value: "node:20",
    pros: [
      "Still supported with stability suitable for production environments.",
    ],
    cons: ["Lacks some features and improvements found in newer releases."],
  },
  {
    label: "Node.js 20 Slim (Debian-based minimal image)",
    value: "node:20-slim",
    pros: [
      "Smaller image size for quicker deployments and a reduced attack surface.",
    ],
    cons: [
      "May be missing certain utilities and system libraries required by some applications.",
    ],
  },
  {
    label: "Node.js 20 Alpine (Alpine Linux-based minimal image)",
    value: "node:20-alpine",
    pros: ["Lightweight with fast startup times and minimal resource usage."],
    cons: [
      "Compatibility issues may arise due to the use of musl instead of glibc, affecting some npm packages and native modules.",
    ],
  },
  {
    label: "Node.js 20 Bullseye (Debian 11-based image)",
    value: "node:20-bullseye",
    pros: [
      "Based on the stable Debian 11 release, providing a good balance between size and compatibility.",
    ],
    cons: [
      "Slightly larger image size compared to slim and Alpine variants, potentially affecting deployment speed.",
    ],
  },
  {
    label: "Node.js 20 Bookworm (Debian 12-based image)",
    value: "node:20-bookworm",
    pros: [
      "Incorporates updated libraries and security patches over Bullseye.",
    ],
    cons: [
      "Newer dependencies may introduce compatibility issues and potential breaking changes.",
    ],
  },
  {
    label: "Node.js 18 (End-of-Life)",
    value: "node:18",
    pros: ["Widely used and well-tested in various environments."],
    cons: [
      "No longer receives security updates or official support; upgrading is recommended.",
    ],
  },
  {
    label: "Node.js 18 Slim (Debian-based minimal image)",
    value: "node:18-slim",
    pros: [
      "Smaller image size for faster deployments and a reduced attack surface.",
    ],
    cons: [
      "Lacks ongoing security updates and support; some utilities and libraries may be missing.",
    ],
  },
  {
    label: "Node.js 18 Alpine (Alpine Linux-based minimal image)",
    value: "node:18-alpine",
    pros: [
      "Extremely lightweight with quick startup times and minimal resource consumption.",
    ],
    cons: [
      "No longer supported; potential compatibility issues due to the use of musl instead of glibc.",
    ],
  },
  {
    label: "Node.js 18 Bullseye (Debian 11-based image)",
    value: "node:18-bullseye",
    pros: [
      "Based on the stable Debian 11 release, offering a balance between size and compatibility.",
    ],
    cons: [
      "End-of-life status means no more security updates; larger image size compared to slim variants.",
    ],
  },
  {
    label: "Node.js 18 Bookworm (Debian 12-based image)",
    value: "node:18-bookworm",
    pros: ["Includes updated libraries and security patches over Bullseye."],
    cons: [
      "No longer supported; potential compatibility issues due to newer dependencies.",
    ],
  },
  {
    label: "Node.js 16 (End-of-Life)",
    value: "node:16",
    pros: ["Used in legacy applications"],
    cons: ["No more security patches", "Should be migrated to a newer version"],
  },
];
