/* import { NextRouter } from "next/router";
   import React from "react"; */

/* import classNames from "classnames";
   import * as config from "config"; */

// import { SidebarAnchor } from "components/buttons";

/* export type SidebarRoutesProps = {
     router: NextRouter;
     location?: config.SidebarPageLocation;
   }; */

/* export const SidebarRoutes = ({
     router,
     location = config.SidebarPageLocations.CENTER,
   }: SidebarRoutesProps): JSX.Element => (
     <div className={classNames("sidebar__routes", `sidebar__routes--${location}`)}>
       {config.SidebarPageIds.__ALL__
         .map((i: config.SidebarPageId) => config.SidebarPages[i])
         .filter(
           (i: config.SidebarPage) =>
             i.location === location && !config.sidebarPageIsHidden(router.asPath, i),
         )
         .map((i: config.SidebarPage, index: number) => (
           <SidebarAnchor
             key={index}
             pathname={i.pathname}
             id={i.id}
             emphasize={i.emphasize}
             icon={i.icon}
             active={config.sidebarPageIsActive(router.asPath, i)}
           />
         ))}
     </div>
   ); */

export {};
