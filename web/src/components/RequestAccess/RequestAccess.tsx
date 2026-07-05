"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LOGO } from "../../../public/logo";
import { ArrowLeft } from "lucide-react";
import { useRequestAccess } from "@/api/RequestApi/useRequestAccess";

export const RequestAccess = () => {
  const { formData, errors, loading, handleChange, handleSubmit } = useRequestAccess();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50 w-full min-h-screen">
      <div className="w-full max-w-[480px] flex flex-col space-y-8">
        
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
            Request for use
          </h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-sm">
            Fill out the form below to request access to the platform. Our team will review your application.
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-zinc-800">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full h-11 bg-white focus-visible:ring-zinc-900 ${errors.name ? 'border-red-500' : 'border-zinc-200'}`}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

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
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className={`w-full h-11 bg-white focus-visible:ring-zinc-900 ${errors.email ? 'border-red-500' : 'border-zinc-200'}`}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Number Input */}
            <div className="space-y-2">
              <Label htmlFor="mobile_number" className="text-sm font-semibold text-zinc-800">
                Phone Number
              </Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                type="tel"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={`w-full h-11 bg-white focus-visible:ring-zinc-900 ${errors.mobile_number ? 'border-red-500' : 'border-zinc-200'}`}
              />
              {errors.mobile_number && <p className="text-sm text-red-500 mt-1">{errors.mobile_number}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-zinc-800">
                Why do you want access & how did you hear about us?
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please tell us a bit about your use case..."
                className={`w-full min-h-[120px] bg-white focus-visible:ring-zinc-900 resize-y ${errors.description ? 'border-red-500' : 'border-zinc-200'}`}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-all">
                {loading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
            
          </form>

          {/* Footer link */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/signin"
              className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
