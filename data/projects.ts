export type MigrationProject = {
  id: string;
  name: string;
  updated: string;
};

export const MIGRATION_PROJECTS: MigrationProject[] = [
  {
    id: "project-1",
    name: "Project 1",
    updated: "Last updated 2h ago",
  },
  {
    id: "customer-master",
    name: "Customer Master — Oracle → SAP",
    updated: "Last updated 2h ago",
  },
  {
    id: "material-master",
    name: "Material Master",
    updated: "Last updated 1d ago",
  },
  {
    id: "vendor-master",
    name: "Vendor Master",
    updated: "Just created",
  },
];

export const DEFAULT_PROJECT_ID = "project-1";
