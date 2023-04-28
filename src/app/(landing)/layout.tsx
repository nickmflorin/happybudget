import { LandingLayout as LandingLayoutComponent } from "components/layout/LandingLayout";

const LandingLayout = async ({ children }: { children: React.ReactNode }) => (
  <LandingLayoutComponent>{children}</LandingLayoutComponent>
);

export default LandingLayout;
