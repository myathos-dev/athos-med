// Stand-in for the Softr "@/lib/datasource" module the blocks were written against.
// Same hook names and return shapes, backed by this app's own /api/records server.
// The Softr field IDs in q.select() are kept so the blocks stay unchanged; records
// are stored under the readable keys (name, status, email, ...).

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const RECORDS_KEY = ["records"];

export const q = {
  select: (fieldMap) => ({ ...fieldMap }),
};

const pick = (fields, keys) => {
  const out = {};
  for (const k of keys) if (k in fields) out[k] = fields[k];
  return out;
};

export function useRecords({ select = {}, count = 100 } = {}) {
  const keys = Object.keys(select);
  return useInfiniteQuery({
    queryKey: [...RECORDS_KEY, count, keys],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/records?offset=${pageParam}&limit=${count}`);
      if (!res.ok) throw new Error(`Failed to load records (${res.status})`);
      const page = await res.json();
      return {
        items: page.items.map((r) => ({ id: r.id, fields: pick(r.fields, keys) })),
        nextOffset: page.nextOffset,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
  });
}

export function useRecordUpdate({ fields = {}, onError } = {}) {
  const queryClient = useQueryClient();
  const allowed = Object.keys(fields);
  return useMutation({
    mutationFn: async ({ recordId, fields: values }) => {
      const res = await fetch(`/api/records/${encodeURIComponent(recordId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: pick(values, allowed) }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Save failed (${res.status})`);
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RECORDS_KEY }),
    onError,
  });
}
