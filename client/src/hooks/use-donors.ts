import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertDonor } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch all donors (public info)
export function useDonors(filters?: { bloodGroup?: string; userType?: "donor" | "receiver"; city?: string }) {
  const queryKey = [api.donors.list.path, filters?.bloodGroup, filters?.userType, filters?.city].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(window.location.origin + api.donors.list.path);
      if (filters?.bloodGroup && filters.bloodGroup !== "all") url.searchParams.append("bloodGroup", filters.bloodGroup);
      if (filters?.userType) url.searchParams.append("userType", filters.userType);
      if (filters?.city) url.searchParams.append("city", filters.city);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch donors");
      return api.donors.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch current user's donor profile
export function useMyProfile() {
  return useQuery({
    queryKey: [api.donors.getMine.path],
    queryFn: async () => {
      const res = await fetch(api.donors.getMine.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.donors.getMine.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

// Create a new donor profile
export function useCreateDonor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertDonor) => {
      const validated = api.donors.create.input.parse(data);
      const res = await fetch(api.donors.create.path, {
        method: api.donors.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.donors.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 401) throw new Error("You must be logged in to register");
        throw new Error("Failed to create profile");
      }
      return api.donors.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.donors.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.donors.getMine.path] });
      toast({
        title: "Registration Successful",
        description: "Your profile has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Update existing donor profile
export function useUpdateDonor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<InsertDonor>) => {
      // Validate with partial schema since we might only update some fields
      // But for the form we usually send all fields.
      // The API expects Partial<InsertDonor>.

      const res = await fetch(api.donors.update.path, {
        method: api.donors.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          // Try parsing as validation error
          try {
            const error = api.donors.update.responses[400].parse(await res.json());
            throw new Error(error.message);
          } catch (e) {
            throw new Error("Validation failed");
          }
        }
        if (res.status === 401) throw new Error("Unauthorized");
        if (res.status === 404) throw new Error("Profile not found");
        throw new Error("Failed to update profile");
      }
      return api.donors.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.donors.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.donors.getMine.path] });
      toast({
        title: "Update Successful",
        description: "Your profile has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
