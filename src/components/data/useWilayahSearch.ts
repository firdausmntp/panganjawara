import { useQuery } from '@tanstack/react-query';
import { fetchJSON, WilayahItem } from './useWilayah';

export const useWilayahSearch = (q: string) => useQuery<{ items: WilayahItem[] }, Error>({
  queryKey: ['wilayah-search', q],
  enabled: q.trim().length >= 3,
  queryFn: () => fetchJSON(`/wilayah/search?q=${encodeURIComponent(q)}`),
  placeholderData: (prev) => prev,
  select: (data) => ({ items: data.items || [] }),
});
