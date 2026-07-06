// ============================================================
// Media Library hooks — WordPress-style central image store.
// ============================================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type MediaItem = {
  id: string;
  url?: string;         // present on detail fetch or after upload
  thumb_url?: string;   // present on list
  filename?: string | null;
  mime?: string | null;
  size_bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
};

export type MediaListResponse = { items: MediaItem[]; total: number };

export const MEDIA_QUERY_KEY = ["admin", "media"] as const;

export const useMediaLibrary = (search = "") =>
  useQuery({
    queryKey: [...MEDIA_QUERY_KEY, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "120");
      try {
        return await api.get<MediaListResponse>(`/media?${params}`);
      } catch {
        return { items: [], total: 0 } as MediaListResponse;
      }
    },
    staleTime: 30_000,
  });

export const useUploadMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MediaItem>) =>
      api.post<{ id: string; url: string }>("/media", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDIA_QUERY_KEY }),
  });
};

export const useDeleteMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: MEDIA_QUERY_KEY }),
  });
};

export const fetchMediaFull = (id: string) => api.get<MediaItem>(`/media/${id}`);
