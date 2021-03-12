import React from "react";
import { map } from "lodash";

import { Page } from "components/layout";

import { TEMPLATES, TemplateConfig } from "./constants";
import Template from "./Template";
import "./index.scss";

const Templates = (): JSX.Element => {
  return (
    <Page className={"templates"} title={"Templates"}>
      <div className={"templates-grid"}>
        {map(TEMPLATES, (config: TemplateConfig, index: number) => {
          return <Template key={index} config={config} />;
        })}
      </div>
    </Page>
  );
};

export default Templates;
