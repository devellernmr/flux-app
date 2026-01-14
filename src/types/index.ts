export interface User {
  id: string;
  email?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

export interface Plan {
  name: string;
  max_projects: number;
  max_team_members: number;
  can_remove_branding: boolean;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: "active" | "paused" | "done" | "archived";
  created_at: string;
  user_id: string;
  due_date?: string;
  custom_logo_url?: string;
  agency_name?: string;
}

export interface ProjectMember {
  id: number;
  user_id: string;
  project_id: number;
  role: "owner" | "editor" | "viewer";
  email: string; // Joined from team_members_with_email view
  color?: "blue" | "pink" | "emerald" | "amber" | "violet";
}

export type PlanType = "starter" | "pro" | "agency";
