import { Metadata, ResolvingMetadata } from "next";

import { configureServerApplication } from "application/config/configuration/server";
import { MetaData } from "application/config/metadata";

configureServerApplication();

export async function generateMetadata(params: any, parent?: ResolvingMetadata): Promise<Metadata> {
  return MetaData;
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
