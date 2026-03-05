import { Navbar } from "@/components/Navbar";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-primary">About Thebloodonor</h1>
          
          <div className="prose prose-lg text-muted-foreground">
            <p className="lead text-xl text-foreground font-medium mb-6">
              Thebloodonor is a community-driven initiative designed to bridge the gap between blood donors and receivers, saving lives through timely connections.
            </p>
            
            <p className="mb-6">
              Our mission is simple: make blood donation accessible, transparent, and efficient. We understand that in medical emergencies, every second counts. Finding a compatible donor shouldn't be a struggle.
            </p>

            <h3 className="text-2xl font-bold text-foreground mt-10 mb-4">How It Works</h3>
            <ul className="space-y-4 list-none pl-0">
              <li className="flex items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-4 shrink-0">1</span>
                <span><strong>Register:</strong> Sign up securely and create your donor or receiver profile.</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-4 shrink-0">2</span>
                <span><strong>Search:</strong> Receivers can search for donors based on blood group and location availability.</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-4 shrink-0">3</span>
                <span><strong>Eligibility Check:</strong> Our system automatically filters out donors who have donated in the last 3 months to ensure donor safety.</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-4 shrink-0">4</span>
                <span><strong>Connect:</strong> Facilitate life-saving donations while maintaining privacy and security.</span>
              </li>
            </ul>

            <div className="mt-12 p-6 bg-red-50 rounded-2xl border border-red-100">
              <h4 className="text-xl font-bold text-red-800 mb-2">Why 3 Months?</h4>
              <p className="text-red-700/80 mb-0">
                Medical guidelines recommend a waiting period of 3 months (approx. 90 days) between whole blood donations for men, and 4 months for women, to allow iron stores to replenish. We strictly enforce a 3-month visibility rule for all donors to prioritize their health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
