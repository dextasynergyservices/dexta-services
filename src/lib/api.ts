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
  },
  {
    id: 2,
    name: "NovaFind",
    description: "A mobile-first discovery app for local businesses.",
    category: "Mobile App",
  },
  {
    id: 3,
    name: "StellarSuite",
    description: "An integrated CRM and project management tool.",
    category: "Web App",
  },
  {
    id: 4,
    name: "Momentum",
    description: "A high-performance e-commerce storefront.",
    category: "E-commerce",
  },
];

// Simulate a network request
export const fetchProjects = async (): Promise<Project[]> => {
  console.log("Fetching projects...");
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Projects fetched!");
  return mockProjects;
};
