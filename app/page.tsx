"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Bike, Store, ArrowRight, CheckCircle2, ChevronRight, Mail, Loader2 } from "lucide-react";
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

export default function LandingPage() {
  const router = useRouter();

  // Rider State
  const [location, setLocation] = useState("");
  const [searchError, setSearchError] = useState("");

  // Business State
  const [isRegistered, setIsRegistered] = useState<boolean>(true);
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

            <div className="space-y-6">
              {/* Login Form */}
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label className="text-neutral-300 mb-2 block">Enter your Shop ID (Slug)</Label>
                    <div className="relative">
                      <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <Input
                        className="w-full pl-12 h-14 bg-neutral-900 border-neutral-700 text-lg text-white placeholder:text-neutral-600 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl"
                        placeholder="e.g. myshop"
                        value={adminSlug}
                        onChange={(e) => setAdminSlug(e.target.value)}
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

              {/* Join Button & Modal */}
              <div className="pt-6 border-t border-neutral-800">
                <JoinRequestModal />
              </div>
            </div>

          </div>
        </section>

      </div >
    </div >
  );
}

function JoinRequestModal() {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(submitJoinRequest, { success: false, error: "" });

  // Close modal on success (optional, or show success state inside)
  // For now we show success state inside.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-16 text-lg justify-between px-6 border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white hover:border-green-500 transition-all group"
        >
          <span className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full text-green-500">
              <Mail className="w-5 h-5" />
            </div>
            I want to join
          </span>
          <ChevronRight className="w-5 h-5 text-neutral-500 group-hover:text-green-500 transition-colors" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-neutral-800 text-white p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Join MTB Reserve</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Apply to list your bike rental shop. We'll review your details and get back to you ASAP.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 pt-2 max-h-[80vh] overflow-y-auto">
          {state.success ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Request Sent!</h3>
              <p className="text-neutral-400">
                Thank you for your interest. Our team will contact you shortly to set up your account.
              </p>
              <Button onClick={() => setOpen(false)} className="mt-4 bg-green-600 hover:bg-green-500 text-white">
                Close
              </Button>
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-neutral-300">First Name <span className="text-red-500">*</span></Label>
                  <Input id="firstName" name="firstName" required className="bg-neutral-800 border-neutral-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-neutral-300">Last Name <span className="text-red-500">*</span></Label>
                  <Input id="lastName" name="lastName" required className="bg-neutral-800 border-neutral-700" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization" className="text-neutral-300">Organization / Shop Name <span className="text-red-500">*</span></Label>
                <Input id="organization" name="organization" required className="bg-neutral-800 border-neutral-700" placeholder="e.g. Sillico MTB" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-neutral-300">Address</Label>
                <Input id="address" name="address" className="bg-neutral-800 border-neutral-700" placeholder="Street, City, Zip" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-neutral-300">Phone <span className="text-red-500">*</span></Label>
                  <Input id="phone" name="phone" required className="bg-neutral-800 border-neutral-700" placeholder="+39 345..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-300">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" name="email" type="email" required className="bg-neutral-800 border-neutral-700" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-neutral-300">Message (Optional)</Label>
                <Textarea id="message" name="message" className="bg-neutral-800 border-neutral-700 min-h-[100px]" placeholder="Tell us about your fleet..." />
              </div>

              {state.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                  {state.error}
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={isPending} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12 text-md">
                  {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : "Submit Request"}
                </Button>
                <p className="text-[10px] text-neutral-500 text-center mt-3">
                  Your data is only used to reply to this request and not for marketing purposes.
                </p>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
