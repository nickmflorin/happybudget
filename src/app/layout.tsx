import { Metadata } from "next";

import { config, library } from "@fortawesome/fontawesome-svg-core";
/* FontAwesome's stylesheet must be imported, before any internal components or stylesheets are
   imported. */
import "@fortawesome/fontawesome-svg-core/styles.css";

import { configureServerApplication } from "application/config/configuration/server";
import { MetaData } from "application/config/metadata";
import "style/globals/index.scss";

configureServerApplication({ fontAwesome: { config, library } });

export async function generateMetadata(): Promise<Metadata> {
  return MetaData;
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
