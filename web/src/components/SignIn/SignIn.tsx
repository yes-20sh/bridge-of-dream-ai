"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LOGO } from "../../../public/logo";
import Image from "next/image";
import { useSignIn } from "../../api/AuthApi/useSignIn";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { loading, handleSignIn } = useSignIn();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignIn({ email, password, remember_me: rememberMe });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 w-full h-full">
      <div className="w-full max-w-[400px] flex flex-col space-y-8">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center">
          {/* Re-using the logo for branding consistency */}
          <div className="w-12 h-12 rounded-full overflow-hidden mb-6 flex items-center justify-center">
            <Image
              src={LOGO.logo2}
              alt="Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Welcome back
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            Please sign in to access your dashboard
          </p>
        </div>

        {/* Form Container (No Card) */}
        <div className="mt-8">
          <form className="space-y-6" onSubmit={onSubmit}>
            
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-zinc-800">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-white border-zinc-200 focus-visible:ring-zinc-900"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-zinc-800">
                  Password
                </Label>
                <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 bg-white border-zinc-200 focus-visible:ring-zinc-900"
              />
            </div>

            {/* Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900" 
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium text-zinc-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
            
          </form>

          {/* Divider */}
          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-zinc-50 px-6 text-zinc-500">Don't have an account?</span>
            </div>
          </div>

          {/* Request for Use */}
          <div className="mt-6">
            <Link 
              href="/request" 
              className={cn(
                buttonVariants({ variant: "outline" }), 
                "w-full h-12 text-base font-semibold border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 rounded-lg"
              )}
            >
              Request for use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
