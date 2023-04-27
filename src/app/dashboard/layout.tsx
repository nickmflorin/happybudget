import { Metadata, ResolvingMetadata } from "next";

import { DashboardLayout as DashboardLayoutComponent } from "components/layout/DashboardLayout";

import { useUser } from "../useUser";

export async function generateMetadata(params: any, parent?: ResolvingMetadata): Promise<Metadata> {
  return { title: "TEST" };
}

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await useUser();
  /* if (!user) {
       redirect("/login");
     } */
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
};

export default DashboardLayout;
