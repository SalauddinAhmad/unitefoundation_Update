// ============================================================
// Team members hook — CRUD with API + localStorage fallback
// Backend endpoint: /team  (GET, POST, PATCH /:id, DELETE /:id)
// ============================================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

function loadLocal(): TeamMember[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultTeam;
}

function saveLocal(list: TeamMember[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {}
}

export const useTeam = () =>
  useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      try {
        const remote = await api.get<TeamMember[]>("/team", { auth: false });
        if (Array.isArray(remote) && remote.length) return remote;
        return loadLocal();
      } catch {
        return loadLocal();
      }
    },
    staleTime: 60_000,
  });

export const useSaveTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: TeamMember) => {
      const current = loadLocal();
      const exists = current.some((m) => m.id === member.id);
      const next = exists
        ? current.map((m) => (m.id === member.id ? member : m))
        : [...current, member];
      try {
        if (exists) await api.patch(`/team/${member.id}`, member);
        else await api.post("/team", member);
      } catch {
        // fall back to local persistence
      }
      saveLocal(next);
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData(["team"], next);
    },
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const next = loadLocal().filter((m) => m.id !== id);
      try {
        await api.delete(`/team/${id}`);
      } catch {}
      saveLocal(next);
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData(["team"], next);
    },
  });
};
