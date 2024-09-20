import { useQueryClient } from "@tanstack/react-query";

export const useRefetchQuery = () => {
  const queryClient = useQueryClient();

  const refetchQuery = (queryKey: (string | undefined)[]) => {
    queryClient.refetchQueries({ queryKey });
  };

  return refetchQuery;
};
