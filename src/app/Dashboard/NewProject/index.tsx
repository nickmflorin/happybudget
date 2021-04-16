import { Switch, Route, Redirect, useRouteMatch } from "react-router-dom";

import { Page } from "components/layout";

import Discover from "./Discover";
import Templates from "./Templates";
import NewProjectMenu from "./NewProjectMenu";

const NewProject = (): JSX.Element => {
  const match = useRouteMatch();

  return (
    <Page className={"new-project"} title={"New Project"}>
      <NewProjectMenu />
      <Switch>
        <Redirect exact from={match.url} to={`${match.url}/templates`} />
        <Route path={`${match.url}/templates`} component={Templates} />
        <Route path={`${match.url}/discover`} component={Discover} />
      </Switch>
    </Page>
  );
};

export default NewProject;
