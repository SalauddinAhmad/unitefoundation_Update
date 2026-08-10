// ============================================================
// Team members hook — CRUD with API + localStorage fallback
// Backend endpoint: /team  (GET, POST, PATCH /:id, DELETE /:id)
// ============================================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string; // URL or data URL
  order?: number;
  facebook?: string;
  linkedin?: string;
  email?: string;
};

const LOCAL_KEY = "uf_team_members";

const defaultTeam: TeamMember[] = [];

const teamMemberSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(160),
  bio: z.string().trim().max(5000).optional().nullable(),
  photo: z.string().trim().max(1000).optional().nullable(),
  order: z.number().finite().optional(),
  facebook: z.string().trim().max(1000).optional().nullable(),
  linkedin: z.string().trim().max(1000).optional().nullable(),
  email: z.string().trim().max(255).optional().nullable(),
});

const normalizeTeamMember = (member: Partial<TeamMember>): TeamMember => ({
  id: String(member.id ?? `TM-${Date.now()}`),
  name: member.name ?? "",
  role: member.role ?? "",
  bio: member.bio ?? "",
  photo: member.photo ?? "",
  order: Number.isFinite(Number(member.order)) ? Number(member.order) : 0,
  facebook: member.facebook ?? "",
  linkedin: member.linkedin ?? "",
  email: member.email ?? "",
});

function loadLocal(): TeamMember[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return (JSON.parse(raw) as Partial<TeamMember>[]).map(normalizeTeamMember);
  } catch {}
  return defaultTeam;
}

function saveLocal(list: TeamMember[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.map(normalizeTeamMember)));
  } catch {}
}

export const useTeam = () =>
  useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      try {
        const remote = await api.get<TeamMember[]>("/team", { auth: false });
        // Trust the server even when it returns an empty array.
        if (Array.isArray(remote)) {
          const normalized = remote.map(normalizeTeamMember);
          saveLocal(normalized); // Keep local sync for redundancy
          return normalized;
        }
        return loadLocal();
      } catch (e) {
        console.error("Team fetch error:", e);
        return loadLocal();
      }
    },
    staleTime: 5000, // Reduced staleTime for more frequent updates
    refetchOnWindowFocus: true,
  });

export const useSaveTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: TeamMember) => {
      const normalized = teamMemberSchema.parse(normalizeTeamMember(member));
      const current = (qc.getQueryData<TeamMember[]>(["team"]) ?? loadLocal());
      
      // We check against the server-synced cache to see if we should POST or PATCH.
      // If the ID is a fresh "TM-..." timestamp, it's definitely a new member.
      const isNew = normalized.id.startsWith("TM-") && !current.some((m) => m.id === normalized.id);

      try {
        if (!isNew) {
          await api.patch(`/team/${normalized.id}`, normalized);
        } else {
          await api.post("/team", normalized);
        }
      } catch (e) {
        const next = !isNew
          ? current.map((m) => (m.id === normalized.id ? normalized : m))
          : [...current, normalized];
        saveLocal(next);
        throw e;
      }
      return normalized;
    },
    onSuccess: () => {
      // Always refetch from server so every admin sees the same truth
      qc.invalidateQueries({ queryKey: ["team"] });
    },
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/team/${id}`);
      } catch (e) {
        const next = loadLocal().filter((m) => m.id !== id);
        saveLocal(next);
        throw e;
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] });
    },
  });
};
