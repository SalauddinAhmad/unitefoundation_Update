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
        // Trust the server even when it returns an empty array — otherwise
        // deleting the last member would resurrect stale localStorage data.
        if (Array.isArray(remote)) return remote.map(normalizeTeamMember);
        return loadLocal();
      } catch {
        return loadLocal();
      }
    },
    staleTime: 30_000,
  });

export const useSaveTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: TeamMember) => {
      const normalized = normalizeTeamMember(member);
      // Decide create vs update from the current server-backed cache,
      // NOT from localStorage (which can be stale on other admins' machines).
      const current = (qc.getQueryData<TeamMember[]>(["team"]) ?? loadLocal());
      const exists = current.some((m) => m.id === normalized.id);
      try {
        if (exists) await api.patch(`/team/${normalized.id}`, normalized);
        else await api.post("/team", normalized);
      } catch (e) {
        // If the API call fails, persist locally as a last-resort fallback
        const next = exists
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
