"use client";

import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  UploadCloud,
  Building2,
  MapPin,
  Briefcase,
  Target,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TagInputCard } from "@/components/TagInputCard/TagInputCard";
import { DropdownTagInputCard } from "@/components/TagInputCard/DropdownTagInputCard";
import { SideNavigator } from "@/components/SideNavigator/SideNavigator";
import { UserProfile } from "@/interfaces/user";
import { updateUserProfile } from "@/api/UserApi/updateUserProfile";

const PREDEFINED_JOB_ROLES = [
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "Mobile Developer",
  "Machine Learning Engineer",
];

const PREDEFINED_JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Remote",
  "Hybrid",
  "On-site",
];

const PREDEFINED_COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Stripe",
  "Netflix",
  "Spotify",
  "Vercel",
  "OpenAI",
];

export function AccountSettings({
  initialProfile,
}: {
  initialProfile?: UserProfile;
}) {
  const getInitialResumeName = () => {
    if (initialProfile?.resume_name) return initialProfile.resume_name;
    if (initialProfile?.resume?.extracted_data?.filename) return initialProfile.resume.extracted_data.filename;
    if (initialProfile?.resume?.cloudinary_url) {
      const urlParts = initialProfile.resume.cloudinary_url.split("/");
      return urlParts[urlParts.length - 1];
    }
    return null;
  };

  const [resumeName, setResumeName] = useState<string | null>(getInitialResumeName());
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(initialProfile?.name || "");
  const [email, setEmail] = useState(initialProfile?.email || "");
  const [mobile, setMobile] = useState(initialProfile?.mobile || "");

  const [jobRoles, setJobRoles] = useState<string[]>(
    initialProfile?.jobRoles || [],
  );
  const [jobTypes, setJobTypes] = useState<string[]>(
    initialProfile?.jobTypes || [],
  );
  const [locations, setLocations] = useState<string[]>(
    initialProfile?.locations || [],
  );
  const [companies, setCompanies] = useState<string[]>(
    initialProfile?.companies || [],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeName(e.target.files[0].name);
      setResumeFile(e.target.files[0]);
    }
  };

  const handleRemoveResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResumeName(null);
    setResumeFile(null);
    // You might also want to trigger an API call to delete the existing resume if one is already saved.
  };

  const hasChanges =
    name !== (initialProfile?.name || "") ||
    email !== (initialProfile?.email || "") ||
    mobile !== (initialProfile?.mobile || "") ||
    JSON.stringify(jobRoles) !== JSON.stringify(initialProfile?.jobRoles || []) ||
    JSON.stringify(jobTypes) !== JSON.stringify(initialProfile?.jobTypes || []) ||
    JSON.stringify(locations) !== JSON.stringify(initialProfile?.locations || []) ||
    JSON.stringify(companies) !== JSON.stringify(initialProfile?.companies || []) ||
    resumeFile !== null ||
    resumeName !== getInitialResumeName();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const profileData = {
        name,
        email,
        mobile,
        jobRoles,
        jobTypes,
        locations,
        companies,
        resume_name: resumeName,
      };

      await updateUserProfile({
        profile_data: JSON.stringify(profileData),
        file: resumeFile,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-10">
      <div className="container mx-auto px-6 lg:px-12 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Account Settings
          </h1>
          <p className="text-zinc-500">
            Manage your profile information and job preferences.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 pb-20">
          {/* Sidebar Navigation */}
          <SideNavigator />

          {/* Main Form Content */}
          <div className="md:col-span-2 space-y-8" id="profile">
            <Card className="shadow-sm border-zinc-200">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your contact details and basic profile information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-700 font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="pl-10 border-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-zinc-700 font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="pl-10 border-zinc-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="mobile"
                      className="text-zinc-700 font-medium"
                    >
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        id="mobile"
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="pl-10 border-zinc-200"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              id="resume"
              className="shadow-sm border-zinc-200 scroll-mt-24"
            >
              <CardHeader>
                <CardTitle>Resume Document</CardTitle>
                <CardDescription>
                  Upload your base resume. We use this to analyze matches
                  against job descriptions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-zinc-50 transition-colors group relative overflow-hidden">
                  <input
                    type="file"
                    id="resume"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".docx"
                    onChange={handleFileChange}
                    onClick={(e) => {
                      // Allow re-uploading the same file by clearing the value
                      (e.target as HTMLInputElement).value = "";
                    }}
                  />
                  {resumeName && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-20 text-zinc-500 hover:text-red-500 hover:bg-red-50"
                      onClick={handleRemoveResume}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="text-center space-y-1 relative z-20">
                    {resumeName ? (
                      <p 
                        className={`text-sm font-medium ${!resumeFile && initialProfile?.resume?.cloudinary_url ? "text-blue-600 hover:underline cursor-pointer" : "text-zinc-900"}`}
                        onClick={(e) => {
                          if (!resumeFile && initialProfile?.resume?.cloudinary_url) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.open(initialProfile.resume.cloudinary_url, "_blank");
                          }
                        }}
                      >
                        {resumeName}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-zinc-900">
                        Click or drag file to this area to upload
                      </p>
                    )}
                    <p className="text-xs text-zinc-500 pointer-events-none">
                      Supports DOCX (Max 10MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tag Input Cards */}
            <div className="space-y-8">
              <div id="target-role" className="scroll-mt-24">
                <DropdownTagInputCard
                  title="Target Job Roles"
                  description="Select the specific job titles you are aiming for."
                  icon={Target}
                  placeholder="Select a role..."
                  tags={jobRoles}
                  setTags={setJobRoles}
                  options={PREDEFINED_JOB_ROLES}
                />
              </div>

              <div id="job-type" className="scroll-mt-24">
                <DropdownTagInputCard
                  title="Job Types"
                  description="Specify your preferred working arrangements."
                  icon={Briefcase}
                  placeholder="Select job type..."
                  tags={jobTypes}
                  setTags={setJobTypes}
                  options={PREDEFINED_JOB_TYPES}
                />
              </div>

              <div id="location" className="scroll-mt-24">
                <TagInputCard
                  title="Location Preferences"
                  description="Where are you looking to work?"
                  icon={MapPin}
                  placeholder="e.g. New York, London, Remote"
                  tags={locations}
                  setTags={setLocations}
                />
              </div>

              <div id="target-companies" className="scroll-mt-24">
                <DropdownTagInputCard
                  title="Target Companies"
                  description="Select companies you would love to work for."
                  icon={Building2}
                  placeholder="Select a company..."
                  tags={companies}
                  setTags={setCompanies}
                  options={PREDEFINED_COMPANIES}
                />
              </div>
            </div>

            <div className="pt-6 pb-6 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-zinc-900 text-white hover:bg-zinc-800 px-8 h-10 shadow-sm w-full md:w-auto disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save All Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
