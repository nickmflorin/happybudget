import { AppConfig } from "components/config";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppConfig authenticated={true}>{children}</AppConfig>
      </body>
    </html>
  );
}
