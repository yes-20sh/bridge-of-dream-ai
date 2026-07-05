import React from "react";
import { getUserProfile } from "@/api/UserApi/getUserProfile";
import { AccountSettings } from "@/components/Account/AccountSettings";

export default async function AccountPage() {
  const profile = await getUserProfile();

  return <AccountSettings initialProfile={profile} />;
}
