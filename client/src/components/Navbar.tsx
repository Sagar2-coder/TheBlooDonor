import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile } from "@/hooks/use-donors";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { data: profile } = useMyProfile();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
            <img src="/logo.svg" alt="TheBlooDonor Logo" className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-foreground">
            TheBlooDonor
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/donors" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/donors') ? 'text-primary' : 'text-muted-foreground'}`}>
            Find Donors
          </Link>
          <Link href="/auth?mode=register" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/auth?mode=register') ? 'text-primary' : 'text-muted-foreground'}`}>
            Register
          </Link>
          <Link href="/about" className={`text-sm font-medium transition-colors hover:text-primary ${isActive('/about') ? 'text-primary' : 'text-muted-foreground'}`}>
            About Us
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Link href="/auth">
              <Button variant="default" className="rounded-full px-6 shadow-lg shadow-primary/20">
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              {!profile && (
                <Link href="/register">
                  <Button variant="outline" className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/5 hover:text-primary">
                    Register as Donor
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/20">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {user?.firstName?.[0] || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-[10px] leading-none text-muted-foreground/30 font-mono mt-1 pt-1 border-t border-border/10">
                        ID: {user?.id}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!profile && (
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="w-full cursor-pointer text-primary font-medium">
                        Complete Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="w-full cursor-pointer font-medium">
                          Edit Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-muted-foreground" disabled>
                        <span className="capitalize">Role: {profile.userType}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full cursor-pointer font-medium text-destructive">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
