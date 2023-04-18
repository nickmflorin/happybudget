import Portal, { PortalProps } from "./Portal";

interface PortalOrRenderProps extends PortalProps {
  portal?: boolean;
}

const PortalOrRender = ({ portal, ...props }: PortalOrRenderProps): JSX.Element => {
  if (portal === true) {
    return <Portal {...props} />;
  }
  return <>{props.children}</>;
};

export default PortalOrRender;
