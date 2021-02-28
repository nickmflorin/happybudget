import { Route } from "react-router-dom";

interface LandingRouteProps {
  [key: string]: any;
}

const LandingRoute = ({ ...props }: LandingRouteProps): JSX.Element => {
  return (
    <div className={"landing-content"}>
      <Route {...props} />
    </div>
  );
};

export default LandingRoute;
