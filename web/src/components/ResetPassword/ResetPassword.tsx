"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGO } from "../../../public/logo";
import Image from "next/image";
import { useResetPassword } from "../../api/AuthApi/useResetPassword";

export const ResetPassword = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const { loading, handleForgotPassword, handleVerifyOtp, handleResetPassword } = useResetPassword();

  const onSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleForgotPassword({ email });
    if (success) {
      setStep(2);
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleVerifyOtp({ email, otp });
    if (success) {
      setStep(3);
    }
  };

  const onResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleResetPassword({ 
      email, 
      otp, 
      new_password: newPassword, 
      confirm_password: confirmPassword 
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 w-full h-full">
      <div className="w-full max-w-[400px] flex flex-col space-y-8">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center">
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
            Reset Password
          </h2>
          <p className="mt-3 text-sm text-zinc-500">
            {step === 1 && "Enter your email to receive a password reset OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Enter your new password"}
          </p>
        </div>

        <div className="mt-8">
          {step === 1 && (
            <form className="space-y-6" onSubmit={onSendOtp}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-zinc-800">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-white border-zinc-200 focus-visible:ring-zinc-900"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all">
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={onVerifyOtp}>
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-semibold text-zinc-800">
                  One-Time Password (OTP)
                </Label>
                <Input
                  id="otp"
                  type="text"
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-11 bg-white border-zinc-200 focus-visible:ring-zinc-900 text-center tracking-widest text-lg"
                  maxLength={6}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all">
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6" onSubmit={onResetPassword}>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-zinc-800">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-11 bg-white border-zinc-200 focus-visible:ring-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-zinc-800">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 bg-white border-zinc-200 focus-visible:ring-zinc-900"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-zinc-50 px-6 text-zinc-500">Remember your password?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link 
              href="/signin" 
              className="flex items-center justify-center w-full h-12 text-base font-semibold border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 rounded-lg"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
