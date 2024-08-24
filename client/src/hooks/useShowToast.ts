import { useToast } from "../components/ui/use-toast";

export function useShowToast() {
  const { toast } = useToast();

  const showToast = ({
    title,
    description,
    isDestructive,
  }: {
    title: string;
    description: string;
    isDestructive?: boolean;
  }) => {
    toast({
      title,
      description,
      variant: isDestructive ? "destructive" : "default",
    });
  };

  return { showToast };
}
