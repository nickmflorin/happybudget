import { TemplateConfig } from "./constants";

interface TemplateProps {
  config: TemplateConfig;
}

const Template = ({ config }: TemplateProps): JSX.Element => {
  return (
    <div className={"template"}>
      <div className={"template-icon"} style={{ backgroundColor: config.color }}>
        {config.icon}
      </div>
      <div className={"template-text"}>{config.text}</div>
    </div>
  );
};

export default Template;
