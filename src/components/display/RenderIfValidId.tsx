import { ReactNode } from "react";

function RenderIfValidId(props: { id: any; children: ReactNode }): JSX.Element {
  if (!isNaN(parseInt(props.id))) {
    return <>{props.children}</>;
  }
  return <></>;
}

export default RenderIfValidId;
