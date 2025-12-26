import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, error, isLoading } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/user");
        return await res.json();
      } catch (err) {
        // If 401, return null (not authenticated)
        return null;
      }
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Hoşgeldin!",
        description: "Başarıyla giriş yaptınız.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Giriş Başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu ve giriş yapıldı.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Kayıt Başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Çıkış Yapıldı",
        description: "Görüşmek üzere!",
      });
      setLocation("/auth");
    },
    onError: (error: Error) => {
      toast({
        title: "Çıkış Yapılamadı",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
