"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bike, Store, ArrowRight, CheckCircle2, ChevronRight, Mail, Loader2, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { submitJoinRequest } from "./actions";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();

  // Rider State
  const [location, setLocation] = useState("");
  const [searchError, setSearchError] = useState("");

  // Business State
  const [rentalView, setRentalView] = useState<"initial" | "login" | "join">("initial");
  const [adminSlug, setAdminSlug] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleRiderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    const term = location.trim().toLowerCase();
    if (!term) {
      setSearchError("Please enter a location");
      return;
    }
    const validLocations = ["sillico", "castelnuovo"];
    if (validLocations.includes(term)) {
      router.push(`/${term}`);
    } else {
      // Fallback for demo
      setSearchError("Try 'Sillico' for this demo.");
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    const slug = adminSlug.trim().toLowerCase();
    if (!slug) {
      setAdminError("Please enter your shop ID");
      return;
    }
    router.push(`/${slug}/admin/login`);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-orange-500 selection:text-white overflow-hidden">

      {/* Navbar stub */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="text-xl font-bold tracking-tighter flex items-center gap-2 text-white pointer-events-auto cursor-default font-outfit">
          <Bike className="w-6 h-6 text-orange-500" />
          MTB Reserve
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* LEFT: RIDER SIDE */}
        <section className="flex-1 relative flex flex-col justify-center items-center p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors duration-500 group">
          {/* Background Image Effect */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

          <div className="max-w-md w-full relative z-10">
            <div className="mb-12 min-h-[120px] flex flex-col justify-end">
              <span className="text-orange-500 font-bold tracking-wider text-xs uppercase mb-4 flex items-center gap-2 font-outfit">
                <Bike className="w-4 h-4" /> For Riders
              </span>
              <h2 className="text-5xl lg:text-6xl font-black mb-4 group-hover:text-white text-neutral-200 transition-colors tracking-tighter font-outfit">
                Find a <span className="text-white">Ride.</span>
              </h2>
              <p className="text-neutral-400 text-lg font-medium leading-relaxed font-outfit">
                Rent top-tier mountain bikes in your favorite destination. Instantly.
              </p>
            </div>

            <form onSubmit={handleRiderSearch} className="space-y-4">
              <div className="relative group/input">
                <Label htmlFor="location" className="sr-only">Where to?</Label>
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-orange-500 transition-colors" />
                <Input
                  id="location"
                  className="w-full pl-14 h-16 bg-neutral-800 border-neutral-700 text-xl font-outfit text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-transparent rounded-2xl transition-all"
                  placeholder="Where do you want to ride?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {searchError && (
                <p className="text-orange-500 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1 px-2 font-medium font-outfit">
                  <span className="block w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  {searchError}
                </p>
              )}

              <Button size="lg" className="w-full h-16 text-xl font-bold bg-white text-black hover:bg-neutral-200 rounded-2xl tracking-tight transition-all active:scale-[0.98] font-outfit">
                Find Bikes <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </form>
          </div>
        </section>

        {/* RIGHT: BUSINESS SIDE */}
        <section className="flex-1 relative flex flex-col justify-center items-center p-8 lg:p-16 bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black pointer-events-none"></div>

          <div className="max-w-md w-full relative z-10 transition-all duration-500">

            {/* Header Section - Dynamic based on state */}
            <div className="mb-12 min-h-[120px] flex flex-col justify-end">
              <span className="text-blue-500 font-bold tracking-wider text-xs uppercase mb-4 flex items-center gap-2 font-outfit">
                <Store className="w-4 h-4 api-loading-spin" /> For Rentals & Shops
              </span>

              {rentalView === "initial" && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <h2 className="text-5xl lg:text-6xl font-black mb-4 text-white tracking-tighter font-outfit">
                    Manage <span className="text-blue-500">Fleet.</span>
                  </h2>
                  <p className="text-neutral-400 text-lg font-medium leading-relaxed font-outfit">
                    The easiest platform to manage MTB rentals, bookings, and availability.
                  </p>
                </div>
              )}
              {rentalView === "login" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <h2 className="text-5xl lg:text-6xl font-black mb-4 text-white tracking-tighter font-outfit">
                    Welcome <span className="text-blue-500">Back.</span>
                  </h2>
                  <p className="text-neutral-400 text-lg font-medium leading-relaxed font-outfit">
                    Enter your shop ID to access your dashboard.
                  </p>
                </div>
              )}
              {rentalView === "join" && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 hidden">
                  {/* Hidden in layout, shown in modal */}
                </div>
              )}
            </div>

            {/* Content Section - Swaps based on state */}
            <div className="space-y-4 relative min-h-[160px]">

              {rentalView === "initial" && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  {/* Input 1 Lookalike - Already Customer */}
                  {/* Styled to match the Input of the Rider side: h-16, rounded-2xl, bg-neutral-900 (darker than 800), text-xl, font-outfit */}
                  <button
                    onClick={() => setRentalView("login")}
                    className="w-full h-16 bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-800 text-left pl-14 pr-6 rounded-2xl flex items-center justify-between group transition-all relative"
                  >
                    <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-hover:text-blue-500 transition-colors" />
                    <span className="text-xl text-neutral-400 font-medium group-hover:text-white transition-colors font-outfit">Already a partner?</span>
                    <LogIn className="w-5 h-5 text-neutral-600 group-hover:text-blue-500 transition-colors" />
                  </button>

                  {/* Input 2 Lookalike - Join Request */}
                  {/* This triggers the Modal directly */}
                  <JoinRequestModal trigger={
                    <Button className="w-full h-16 text-xl font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.2)] hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all active:scale-[0.98] text-left pl-14 pr-6 flex items-center justify-between relative font-outfit">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80" />
                      <span className="text-xl font-bold font-outfit">I want to join</span>
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                  } />
                </div>
              )}

              {rentalView === "login" && (
                <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="relative group/input">
                    <Label htmlFor="slug" className="sr-only">Shop ID</Label>
                    <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within/input:text-blue-500 transition-colors" />
                    <Input
                      id="slug"
                      className="w-full pl-14 h-16 bg-neutral-900 border-neutral-800 text-xl font-outfit text-white placeholder:text-neutral-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent rounded-2xl transition-all"
                      placeholder="Enter Shop ID (e.g. myshop)"
                      value={adminSlug}
                      onChange={(e) => setAdminSlug(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {adminError && (
                    <p className="text-red-400 text-sm flex items-center gap-2 animate-in fade-in px-2 font-medium font-outfit">
                      <span className="block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {adminError}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRentalView("initial")}
                      className="h-16 w-16 rounded-2xl border-neutral-800 bg-black hover:bg-neutral-900 text-neutral-400"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <Button size="lg" className="flex-1 h-16 text-xl font-bold bg-white text-black hover:bg-neutral-200 rounded-2xl transition-all active:scale-[0.98] font-outfit">
                      Dashboard <ArrowRight className="ml-2 w-6 h-6" />
                    </Button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </section>

      </div >
    </div >
  );
}

function JoinRequestModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(submitJoinRequest, { success: false, error: "" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      {/* Fullscreen-ish modal, compacted for visibility */}
      <DialogContent className="max-w-[95vw] md:max-w-2xl bg-neutral-950 border-neutral-800 text-white p-0 gap-0 rounded-3xl shadow-2xl border-2 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

        <DialogHeader className="p-6 pb-2 relative z-10 bg-neutral-900/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight font-outfit">Partner Application</DialogTitle>
              <DialogDescription className="text-neutral-400 text-base font-outfit">
                Join the premium network.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 overflow-y-auto relative z-10 flex-1">
          {state.success ? (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-500 h-full">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-2 ring-8 ring-green-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white font-outfit">Application Received!</h3>
                <p className="text-neutral-400 text-lg max-w-sm mx-auto font-outfit">
                  Check your email inbox. We will contact you within 24 hours.
                </p>
              </div>
              <Button onClick={() => setOpen(false)} className="h-12 px-8 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold font-outfit">
                Close
              </Button>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-neutral-300 font-medium font-outfit">First Name</Label>
                  <Input id="firstName" name="firstName" required className="bg-neutral-900 border-neutral-800 h-11 focus:ring-blue-500 rounded-xl font-outfit" placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-neutral-300 font-medium font-outfit">Last Name</Label>
                  <Input id="lastName" name="lastName" required className="bg-neutral-900 border-neutral-800 h-11 focus:ring-blue-500 rounded-xl font-outfit" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="organization" className="text-neutral-300 font-medium font-outfit">Shop Name</Label>
                <Input id="organization" name="organization" required className="bg-neutral-900 border-neutral-800 h-11 focus:ring-blue-500 rounded-xl font-outfit" placeholder="e.g. Alpine Bikes" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-neutral-300 font-medium font-outfit">Phone</Label>
                  <Input id="phone" name="phone" required className="bg-neutral-900 border-neutral-800 h-11 focus:ring-blue-500 rounded-xl font-outfit" placeholder="+1 234..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-neutral-300 font-medium font-outfit">Email</Label>
                  <Input id="email" name="email" type="email" required className="bg-neutral-900 border-neutral-800 h-11 focus:ring-blue-500 rounded-xl font-outfit" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-neutral-300 font-medium font-outfit">Location</Label>
                <Input id="address" name="address" className="bg-neutral-900 border-neutral-800 h-11 focus:ring-blue-500 rounded-xl font-outfit" placeholder="Street, City, Zip" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-neutral-300 font-medium font-outfit">Fleet Details</Label>
                <Textarea id="message" name="message" className="bg-neutral-900 border-neutral-800 min-h-[80px] focus:ring-blue-500 rounded-xl resize-none p-3 font-outfit" placeholder="How many bikes?" />
              </div>

              {state.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2 font-outfit">
                  <span className="block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {state.error}
                </div>
              )}

              <div className="pt-2 pb-2">
                <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 text-lg rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01] font-outfit">
                  {isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : "Submit Application"}
                </Button>
                <p className="text-[10px] text-neutral-500 text-center mt-2 font-outfit">
                  Protected by standard encryption.
                </p>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
