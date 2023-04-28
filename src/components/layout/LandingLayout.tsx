import { CopyrightText } from "components/typography";

export const LandingLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="layout--landing">
    <div className="layout--landing__content">
      <h1>
        <span>The Future</span> of Production
      </h1>
      {children}
      <CopyrightText align="center" />
    </div>
  </div>
);
