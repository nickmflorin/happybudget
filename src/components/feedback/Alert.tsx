import { useMemo } from "react";
import { Alert as RootAlert } from "antd";
import { isNil } from "lodash";
import classNames from "classnames";

import * as api from "api";
import { util } from "lib";

export interface AlertProps extends StandardComponentProps {
  readonly children?: string | Http.Error | JSX.Element | undefined;
  readonly title?: string;
  readonly visible?: boolean;
  readonly type: AlertType;
  readonly alert?: Omit<IAlert, "type">;
  readonly closable?: boolean;
}

const Alert: React.FC<AlertProps> = (props: AlertProps) => {
  const data: { readonly message: string | JSX.Element | undefined; readonly title: string | undefined } =
    useMemo(() => {
      let message = props.children;
      if (isNil(message) && !isNil(props.alert)) {
        message = props.alert.message;
      }
      let title = props.title;
      if (isNil(title) && !isNil(props.alert)) {
        title = props.alert.title;
      }
      return !isNil(message) && api.typeguards.isHttpError(message)
        ? { title: title || "There was an error with the request.", message: api.standardizeError(message).message }
        : { title: title || util.formatters.toTitleCase(props.type), message };
    }, [props.children, props.alert, props.type]);

  const visible = useMemo(
    () => (!isNil(props.visible) ? props.visible : !isNil(data.message)),
    [data.message, props.visible]
  );

  if (visible === true) {
    return (
      <RootAlert
        className={classNames("alert", props.className)}
        message={data.title}
        closable={!isNil(props.closable) ? props.closable : props.alert?.closable}
        type={props.type}
        showIcon={true}
        style={props.style}
        description={data.message}
      />
    );
  }
  return <></>;
};

export default Alert;
