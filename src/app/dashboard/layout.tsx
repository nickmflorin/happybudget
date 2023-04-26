import { redirect } from "next/navigation";

import { DashboardLayout as DashboardLayoutComponent } from "components/layout/DashboardLayout";

import { useUser } from "../useUser";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await useUser();
  /* if (!user) {
       redirect("/login");
     } */
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
};

export default DashboardLayout;
