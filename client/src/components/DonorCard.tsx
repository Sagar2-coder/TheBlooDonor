import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Droplet, User } from "lucide-react";
import type { PublicDonorInfo } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DonorCardProps {
  donor: PublicDonorInfo;
}

export function DonorCard({ donor }: DonorCardProps) {
  const isDonor = donor.userType === "donor";

  return (
    <Card className="group overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
      <CardHeader className="p-0">
        <div className={`h-2 w-full ${isDonor ? 'bg-primary' : 'bg-blue-500'}`} />
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDonor ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'}`}>
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground leading-none mb-1">{donor.name}</h3>
              <Badge variant="secondary" className={`${isDonor ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'} text-[10px] uppercase tracking-wider`}>
                {donor.userType}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">Group</span>
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
              {donor.bloodGroup}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/60" />
            <span className="line-clamp-2">{donor.address}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
            <span>Last Donation: {format(new Date(donor.lastDonationDate), "MMM d, yyyy")}</span>
          </div>

          <div className="pt-4 mt-4 border-t border-dashed border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-600">Available</span>
            </div>

            <Button
              size="sm"
              className="w-full h-9 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white border-0 shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                const message = `Hello, I'm interested in ${isDonor ? 'requesting blood from' : 'donating blood to'} ${donor.name} (${donor.bloodGroup}) listed on TheBlooDonor.`;
                window.open(`https://wa.me/9779819079020?text=${encodeURIComponent(message)}`, '_blank');
              }}
            >
              <Droplet className="w-3.5 h-3.5 mr-2" />
              Request
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
