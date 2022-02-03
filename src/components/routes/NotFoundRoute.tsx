import { Route } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

type NotFoundRouteProps = {
  readonly auto?: boolean;
};

const NotFoundRoute = (props: NotFoundRouteProps) =>
  props.auto === true ? <Route component={NotFoundPage} /> : <Route path={"/404"} component={NotFoundPage} />;

export default NotFoundRoute;
