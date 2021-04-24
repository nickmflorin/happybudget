import { Switch, Route } from "react-router-dom";

import { Page } from "components/layout";

import Discover from "./Discover";
import MyTemplates from "./MyTemplates";
import TemplatesMenu from "./TemplatesMenu";

const Templates = (): JSX.Element => {
  return (
    <Page className={"templates"} title={"Templates"}>
      <TemplatesMenu />
      <Switch>
        <Route path={"/templates"} component={MyTemplates} />
        <Route path={"/discover"} component={Discover} />
      </Switch>
    </Page>
  );
};

export default Templates;
