import { isNil } from "lodash";
import { util } from "lib";
import { Portal } from "components/layout";

type WithAllowedPortalParams<PARAM extends string = "portalId"> = {
  readonly param?: PARAM;
  readonly onPortalProps?: { [key: string]: any };
  readonly onNoPortalProps?: { [key: string]: any };
};

type WithAllowedPortalProps<PARAM extends string = "portalId"> = Partial<Record<PARAM, string>>;

/* eslint-disable indent */
export const withAllowedPortal =
  <P extends object, PARAM extends string = "portalId">(params: WithAllowedPortalParams<PARAM>) =>
  (Component: React.ComponentType<P>): React.FC<P & WithAllowedPortalProps<PARAM>> =>
  (props: P & WithAllowedPortalProps<PARAM>) => {
    const param = params.param || ("portalId" as PARAM);
    const leftoverProps = util.destruct(props, param);
    const portalIdValue = props[param];
    if (!isNil(portalIdValue)) {
      return (
        <Portal id={portalIdValue}>
          <Component {...(leftoverProps as P)} {...params.onPortalProps} />
        </Portal>
      );
    }
    return <Component {...(leftoverProps as P)} {...params.onNoPortalProps} />;
  };
