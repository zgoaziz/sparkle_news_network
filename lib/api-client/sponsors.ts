/**
 * Sponsors — manually written React-Query hooks (inlined copy).
 */
import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";

export type SponsorPlacement = "navbar" | "sidebar" | "both";

export interface Sponsor {
  id: string;
  name: string;
  content: string;
  linkUrl?: string | null;
  imageUrl?: string | null;
  placement: SponsorPlacement;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorBody {
  name: string;
  content: string;
  linkUrl?: string;
  imageUrl?: string;
  placement: SponsorPlacement;
  isActive?: boolean;
}

export interface UpdateSponsorBody extends Partial<CreateSponsorBody> {}

export const getSponsorsQueryKey = (placement?: string) =>
  placement ? ["/api/sponsors", placement] : ["/api/sponsors"];

export const getAdminSponsorsQueryKey = () => ["/api/admin/sponsors"];

export function useGetSponsors(
  placement?: SponsorPlacement,
  options?: Omit<UseQueryOptions<Sponsor[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Sponsor[]>({
    queryKey: getSponsorsQueryKey(placement),
    queryFn: () => {
      const url = placement
        ? `/api/sponsors?placement=${placement}`
        : `/api/sponsors`;
      return customFetch<Sponsor[]>(url, { method: "GET" });
    },
    staleTime: 60_000,
    ...options,
  });
}

export function useAdminGetSponsors(
  options?: Omit<UseQueryOptions<Sponsor[]>, "queryKey" | "queryFn">,
) {
  return useQuery<Sponsor[]>({
    queryKey: getAdminSponsorsQueryKey(),
    queryFn: () =>
      customFetch<Sponsor[]>("/api/admin/sponsors", { method: "GET" }),
    ...options,
  });
}

export function useAdminCreateSponsor(
  options?: UseMutationOptions<Sponsor, unknown, CreateSponsorBody>,
) {
  return useMutation<Sponsor, unknown, CreateSponsorBody>({
    mutationFn: (data) =>
      customFetch<Sponsor>("/api/admin/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

export function useAdminUpdateSponsor(
  options?: UseMutationOptions<
    Sponsor,
    unknown,
    { id: string; data: UpdateSponsorBody }
  >,
) {
  return useMutation<Sponsor, unknown, { id: string; data: UpdateSponsorBody }>(
    {
      mutationFn: ({ id, data }) =>
        customFetch<Sponsor>(`/api/admin/sponsors/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      ...options,
    },
  );
}

export function useAdminToggleSponsor(
  options?: UseMutationOptions<
    { id: string; isActive: boolean },
    unknown,
    string
  >,
) {
  return useMutation<{ id: string; isActive: boolean }, unknown, string>({
    mutationFn: (id) =>
      customFetch<{ id: string; isActive: boolean }>(
        `/api/admin/sponsors/${id}/toggle`,
        {
          method: "PATCH",
        },
      ),
    ...options,
  });
}

export function useAdminDeleteSponsor(
  options?: UseMutationOptions<{ message: string }, unknown, string>,
) {
  return useMutation<{ message: string }, unknown, string>({
    mutationFn: (id) =>
      customFetch<{ message: string }>(`/api/admin/sponsors/${id}`, {
        method: "DELETE",
      }),
    ...options,
  });
}
