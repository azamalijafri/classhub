import axiosInstance from "@/lib/axios-instance";
import { useQuery, QueryKey } from "@tanstack/react-query";

interface FetchOptions<T> {
  queryKey: QueryKey;
  url: string;
  params?: object;
  enabled?: boolean;
  initialData?: T;
}

export function useFetchData<T>({
  queryKey,
  url,
  params = {},
  enabled = true,
  initialData,
}: FetchOptions<T>) {
  const fetchData = async () => {
    const response = await axiosInstance.get(url, { params });
    return response.data;
  };

  const query = useQuery<T>({
    queryKey,
    queryFn: fetchData,
    enabled,
    initialData,
  });

  return {
    ...query,
    refetchData: query.refetch,
  };
}
