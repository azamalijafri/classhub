import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios-instance";
import { useLoading } from "@/stores/loader-store";

export const useFetchData = (queryKey: string[], apiUrl: string) => {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const fetchData = async () => {
    startLoading();
    const response = await axiosInstance.get(apiUrl);
    stopLoading();
    return response.data;
  };

  const { data, refetch } = useQuery({
    queryKey,
    queryFn: fetchData,
  });

  return { data, isLoading, refetch };
};
