/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { useLoading } from "@/stores/loader-store";

type Method = "POST" | "PUT" | "DELETE";

interface UseApiProps<T> {
  isLoading: boolean;
  error: string | null;
  data: T | null;
  fetchData: () => void;
  mutateData: (url: string, method: Method, payload?: any) => Promise<void>;
  fetchedData: T | null;
}

export const useApi = <T = any>({
  apiUrl,
  queryKey = [],
  enabledFetch = true,
}: {
  apiUrl: string;
  queryKey?: any[];
  enabledFetch?: boolean;
}): UseApiProps<T> => {
  const queryClient = useQueryClient();
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();

  const [isLocalLoading, setIsLocalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const isLoading = globalLoading || isLocalLoading;

  const fetchData = useCallback(async () => {
    try {
      startLoading();
      const response = await axiosInstance.get(apiUrl);
      setData(response.data);
      return response.data;
    } finally {
      stopLoading();
    }
  }, [apiUrl, startLoading, stopLoading]);

  const { data: fetchedData } = useQuery({
    queryKey,
    queryFn: fetchData,
    enabled: enabledFetch,
  });

  const mutateData = useCallback(
    async (url: string, method: Method, payload?: any) => {
      setIsLocalLoading(true);
      setError(null);

      try {
        const response = await axiosInstance({
          method,
          url,
          data: payload,
        });
        setData(response.data);
        queryClient.invalidateQueries({ queryKey });
        return response.data;
      } finally {
        setIsLocalLoading(false);
      }
    },
    [queryClient, queryKey]
  );

  return {
    isLoading,
    error,
    data,
    fetchData,
    mutateData,
    fetchedData,
  };
};
