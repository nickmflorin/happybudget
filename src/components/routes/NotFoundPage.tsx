import React from "react";

import { RouterLink } from "components/links";
import { NotFoundPageIcon } from "components/svgs";

const NotFoundPage = () => (
  <div className={"not-found-page"}>
    <NotFoundPageIcon />
    <h1>{"Oh no! The page you were looking for doesn't exist."}</h1>
    <RouterLink to={"/"}>{"Click here to return home."}</RouterLink>
  </div>
);

export default React.memo(NotFoundPage);
