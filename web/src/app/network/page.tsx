"use client";

import React, { useState } from "react";
import { NetworkList } from "@/components/NetworkList/NetworkList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NetworkPage() {
  const [open, setOpen] = useState(false);
  const [profileLink, setProfileLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileLink.trim()) {
      toast.error("Please enter a profile link");
      return;
    }
    // Handle saving / adding connection link
    toast.success("Connection profile link added successfully!");
    setProfileLink("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-zinc-100 bg-zinc-50/30">
        <div className="container mx-auto px-6 lg:px-12 py-7">
          <h1 className="text-3xl font-bold text-zinc-900">Your Network</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <p className="text-zinc-500">
              Connect with industry professionals and expand your reach.
            </p>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger>
                <Button className="bg-black text-white hover:bg-zinc-800 transition-colors gap-2 shrink-0">
                  <Plus className="w-4 h-4" />
                  Add Connection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-zinc-900">
                    Add Connection
                  </DialogTitle>
                  <DialogDescription className="text-zinc-500 mt-1">
                    Enter the profile link of the professional you would like to
                    connect with.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4 mt-4"
                >
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="profile-link"
                      className="text-sm font-semibold text-zinc-700"
                    >
                      Profile Link
                    </Label>
                    <Input
                      id="profile-link"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={profileLink}
                      onChange={(e) => setProfileLink(e.target.value)}
                      required
                      className="w-full border-zinc-300 focus:border-black focus:ring-black"
                    />
                  </div>
                  <DialogFooter className="mt-2 flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-black text-white hover:bg-zinc-800"
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 lg:px-12 py-10">
        <div className="w-full">
          <NetworkList />
        </div>
      </div>
    </div>
  );
}
