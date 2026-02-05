"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bike, Store, ArrowRight, CheckCircle2, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();

  // Rider State
  const [location, setLocation] = useState("");
  const [searchError, setSearchError] = useState("");

  // Business State
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
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

    // Simple stub for autocomplete/validation logic
    // In a real app, this would query an API of active tenants
    const validLocations = ["sillico", "castelnuovo"];

    if (validLocations.includes(term)) {
      router.push(`/${term}`);
    } else {
      setSearchError("Location not found. Try 'Sillico'.");
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

    // Direct navigation to admin login
    router.push(`/${slug}/admin/login`);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-orange-500 selection:text-white">

      {/* Navbar stub */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pointer-events-none">
        <div className="text-xl font-bold tracking-tighter flex items-center gap-2 text-white pointer-events-auto cursor-default">
          <Bike className="w-6 h-6 text-orange-500" />
          MTB Reserve
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">

        {/* LEFT: RIDER SIDE */}
        <section className="relative flex flex-col justify-center items-center p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors duration-500 group">
          {/* Background Image Effect (Optional) */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

          <div className="max-w-md w-full relative z-10">
            <div className="mb-8 min-h-[160px] flex flex-col justify-end">
              <span className="text-orange-500 font-bold tracking-wider text-xs uppercase mb-2 block">For Riders</span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 group-hover:text-white transition-colors">
                Ready to <span className="text-white">Ride?</span>
              </h2>
              <p className="text-neutral-400 text-lg">
                Find top-tier mountain bike rentals in your favorite destination. Instantly.
              </p>
            </div>

            <form onSubmit={handleRiderSearch} className="space-y-4">
              <div className="relative">
                <Label htmlFor="location" className="sr-only">Where to?</Label>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="location"
                  className="w-full pl-12 h-14 bg-neutral-800 border-neutral-700 text-lg text-white placeholder:text-neutral-500 focus-visible:ring-orange-500 focus-visible:border-orange-500 rounded-xl transition-all"
                  placeholder="Where do you want to ride?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {searchError && (
                <p className="text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <span className="block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {searchError}
                </p>
              )}

              <Button size="lg" className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-neutral-200 rounded-xl">
                Find Bikes <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </div>
        </section>

        {/* RIGHT: BUSINESS SIDE */}
        <section className="relative flex flex-col justify-center items-center p-8 lg:p-16 bg-black">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black pointer-events-none"></div>

          <div className="max-w-md w-full relative z-100">
            <div className="mb-8 min-h-[160px] flex flex-col justify-end">
              <span className="text-blue-500 font-bold tracking-wider text-xs uppercase mb-2 block">For Rentals & Shops</span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
                Manage your <span className="text-blue-500">Fleet</span>
              </h2>
              <p className="text-neutral-400 text-lg">
                The easiest platform to manage MTB rentals, bookings, and availability.
              </p>
            </div>

            {isRegistered === null ? (
              <div className="grid gap-4">
                <Button
                  onClick={() => setIsRegistered(true)}
                  variant="outline"
                  className="h-16 text-lg justify-between px-6 border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white hover:border-blue-500 transition-all group"
                >
                  <span>I have an account</span>
                  <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-blue-500 transition-colors" />
                </Button>
                <Button
                  onClick={() => setIsRegistered(false)}
                  variant="outline"
                  className="h-16 text-lg justify-between px-6 border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white hover:border-green-500 transition-all group"
                >
                  <span>I want to join</span>
                  <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-green-500 transition-colors" />
                </Button>
              </div>
            ) : isRegistered ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button onClick={() => setIsRegistered(null)} className="text-sm text-neutral-500 hover:text-white mb-4 flex items-center gap-1 transition-colors">
                  ← Back
                </button>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label className="text-neutral-300 mb-2 block">Enter your Shop ID (Slug)</Label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <Input
                        className="w-full pl-12 h-14 bg-neutral-900 border-neutral-700 text-lg text-white placeholder:text-neutral-600 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                        placeholder="e.g. sillico"
                        value={adminSlug}
                        onChange={(e) => setAdminSlug(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  {adminError && (
                    <p className="text-red-400 text-sm flex items-center gap-2 animate-in fade-in">
                      <span className="block w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {adminError}
                    </p>
                  )}

                  <Button size="lg" className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    Go to Dashboard
                  </Button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
                <button onClick={() => setIsRegistered(null)} className="text-sm text-neutral-500 hover:text-white mb-4 flex items-center gap-1 transition-colors">
                  ← Back
                </button>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 bg-green-500/10 rounded-full text-green-500">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Let's Get You Set Up</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    We are currently onboarding shops manually to ensure quality. Drop us a line to get your dedicated booking portal.
                  </p>
                  <a
                    href="mailto:contact@mtbreserve.com"
                    className="mt-2 text-xl font-bold text-green-400 hover:text-green-300 transition-colors underline underline-offset-4 decoration-green-500/30 hover:decoration-green-500"
                  >
                    contact@mtbreserve.com
                  </a>
                </div>
              </div>
            )}

          </div>
        </section>

      </div >
    </div >
  );
}
