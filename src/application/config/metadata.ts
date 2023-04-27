import { Metadata, ResolvingMetadata } from "next";
import { parseEnvVar } from "./util";

export const DEFAULT_META_DESCRIPTION = parseEnvVar(
  process.env.NEXT_PUBLIC_DEFAULT_META_DESCRIPTION,
  "NEXT_PUBLIC_DEFAULT_META_DESCRIPTION",
  {
    required: true,
  },
);

export const DEFAULT_PAGE_TITLE = parseEnvVar(
  process.env.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  "NEXT_PUBLIC_DEFAULT_PAGE_TITLE",
  {
    required: true,
  },
);

export const MetaData: Metadata = {
  title: DEFAULT_PAGE_TITLE,
  description: DEFAULT_META_DESCRIPTION,
  applicationName: "happybudget",
  authors: [{ name: "Nick Florin", url: "nickmflorin@gmail.com" }],
  creator: "Nick Florin",
  publisher: "Nick Florin",
  icons: [
    {
      url: "/favicon.svg",
      rel: "icon",
      sizes: "64x64 32x32 24x24 16x16",
      type: "image/x-icon",
    },
  ],
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};
