import { Route, RouteProps } from "react-router-dom";

const LandingRoute = (props: RouteProps): JSX.Element => {
  return (
    <div className={"landing-content"}>
      <Route {...props} />
    </div>
  );
};

export default LandingRoute;
