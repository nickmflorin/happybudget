import { Route } from "react-router-dom";

const ApplicationRoute = ({ ...props }: { [key: string]: any }): JSX.Element => {
  return <Route {...props} />;
};

export default ApplicationRoute;
