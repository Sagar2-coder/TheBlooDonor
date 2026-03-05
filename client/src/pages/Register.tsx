import { Navbar } from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDonorSchema } from "@shared/schema";
import { type InsertDonor } from "@shared/schema";
import { useCreateDonor } from "@/hooks/use-donors";
import { useAuth } from "@/hooks/use-auth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Register() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const createDonor = useCreateDonor();

  const form = useForm<InsertDonor>({
    resolver: zodResolver(insertDonorSchema),
    defaultValues: {
      name: "",
      address: "",
      bloodGroup: "",
      contactNumber: "",
      userType: "donor",
      // Date default logic handled in component
    },
  });

  // Pre-fill name if available from auth
  useEffect(() => {
    if (user && !form.getValues("name")) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
      if (fullName) form.setValue("name", fullName);
    }
  }, [user, form]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/auth");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const onSubmit = (data: InsertDonor) => {
    createDonor.mutate(data, {
      onSuccess: () => {
        setLocation("/donors");
      },
    });
  };

  if (authLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Create Your Profile</h1>
            <p className="text-muted-foreground">Join our community to save lives. Please provide accurate details.</p>
          </div>

          <div className="bg-card rounded-3xl shadow-xl shadow-black/5 border border-border p-8 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="h-12 bg-gray-50/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} className="h-12 bg-gray-50/50" />
                        </FormControl>
                        <FormDescription className="text-xs">Only visible to admins</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} className="h-12 bg-gray-50/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-gray-50/50">
                              <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[100] border-2 shadow-2xl bg-white">
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                              <SelectItem key={bg} value={bg} className="h-10 cursor-pointer hover:bg-gray-100">{bg}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastDonationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mb-4">
                        <FormLabel>Last Donation Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-12 w-full pl-3 text-left font-normal bg-gray-50/50 border-input",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[100] border-2 shadow-2xl bg-white" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              className="rounded-md border shadow-sm"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Used to calculate eligibility (3 months rule)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Register as</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl border border-border p-4 hover:bg-gray-50 transition-colors w-full">
                            <FormControl>
                              <RadioGroupItem value="donor" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Blood Donor
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl border border-border p-4 hover:bg-gray-50 transition-colors w-full">
                            <FormControl>
                              <RadioGroupItem value="receiver" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer w-full">
                              Blood Receiver
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all mt-8"
                  disabled={createDonor.isPending}
                >
                  {createDonor.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Complete Registration
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}
