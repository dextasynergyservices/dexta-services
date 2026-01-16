export interface Project {
  image: string;
  id: number;
  name: string;
  description: string;
  category: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: "QuantumLeap",
    description: "A next-generation analytics platform for enterprise.",
    category: "Web App",
    image:
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop", // Analytics/tech image
  },
  {
    id: 2,
    name: "NovaFind",
    description: "A mobile-first discovery app for local businesses.",
    category: "Mobile App",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w-800&auto=format&fit=crop", // Mobile app image
  },
  {
    id: 3,
    name: "StellarSuite",
    description: "An integrated CRM and project management tool.",
    category: "Web App",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop", // Dashboard/CRM image
  },
  {
    id: 4,
    name: "Momentum",
    description: "A high-performance e-commerce storefront.",
    category: "E-commerce",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop", // E-commerce image
  },
];

// Simulate a network request
export const fetchProjects = async (): Promise<Project[]> => {
  console.log("Fetching projects...");
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Projects fetched!");
  return mockProjects;
};
