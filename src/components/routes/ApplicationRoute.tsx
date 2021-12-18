import { Route } from "react-router-dom";

const ApplicationRoute = ({ ...props }: Record<string, unknown>): JSX.Element => {
  return <Route {...props} />;
};

export default ApplicationRoute;
