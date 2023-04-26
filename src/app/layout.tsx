import { configureServerApplication } from "application/config/configuration/server";

configureServerApplication();

const RootLayout = async ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
