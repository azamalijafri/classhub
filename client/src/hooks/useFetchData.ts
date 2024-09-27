/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { useLoading } from "@/stores/loader-store";

export const useFetchData = ({
  apiUrl,
  queryKey = [],
}: {
  apiUrl: string;
  queryKey?: any[];
}) => {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const fetchData = async () => {
    startLoading();
    const response = await axiosInstance.get(apiUrl);
    stopLoading();
    return response.data;
  };

  const { data, refetch, isError } = useQuery({
    queryKey,
    queryFn: fetchData,
  });

  return { data, isLoading, refetch, isError };
};
