import React from "react";
import {
  User,
  FileText,
  Target,
  Briefcase,
  MapPin,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function SideNavigator() {
  return (
    <div className="flex flex-col gap-2">
      <nav className="flex flex-col space-y-1 sticky top-24">
        <Button
          variant="ghost"
          className="justify-start bg-zinc-100 font-medium text-zinc-900 w-full"
          onClick={() =>
            document
              .getElementById("profile")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 w-full"
          onClick={() =>
            document
              .getElementById("resume")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <FileText className="mr-2 h-4 w-4" />
          Resume
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 w-full"
          onClick={() =>
            document
              .getElementById("target-role")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Target className="mr-2 h-4 w-4" />
          Target Role
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 w-full"
          onClick={() =>
            document
              .getElementById("job-type")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Briefcase className="mr-2 h-4 w-4" />
          Job Type
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 w-full"
          onClick={() =>
            document
              .getElementById("location")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <MapPin className="mr-2 h-4 w-4" />
          Location
        </Button>
        <Button
          variant="ghost"
          className="justify-start text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 w-full"
          onClick={() =>
            document
              .getElementById("target-companies")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Building2 className="mr-2 h-4 w-4" />
          Target Companies
        </Button>
      </nav>
    </div>
  );
}
