import React, { ReactNode } from "react";
import { RouteComponentProps } from "react-router-dom";
import { isNil, reduce, includes } from "lodash";

import Route, { RouteProps } from "./Route";
import NotFoundPage from "./NotFoundPage";

type PathParamsRouteProps<P extends Record<string, string | number>> = Omit<RouteProps, "component" | "render"> & {
  readonly params: (keyof P)[];
  readonly numericIdParams?: (keyof P)[] | "__all__";
  readonly component?: React.FunctionComponent<P>;
  readonly render?: (params: P) => JSX.Element;
};

/**
 * A <Route /> component that will render the child component with the IDs in the
 * URL PATH parameters defined by `params`.  If any of the URL PATH parameters
 * defined by `params` either are not in the URL PATH parameters or cannot be
 * converted to valid integers (if they are included in the optional
 * `numericIdParams` prop), the route will render the <NotFoundPage />.
 *
 * Note: The limitation of this route component is that the component being
 * rendered must accept no other props other than the ID parameters defined
 * by `params`.  However, this is mostly for Typescript purposes, as typing that
 * is difficult, and that functionality could be incorporated if we needed it.
 *
 * @param params  The URL PATH parameters associated with the ID props that will
 *                be passed into the component.
 * @returns       <Route />
 */
const PathParamsRoute = <P extends Record<string, string | number>>({
  params,
  component,
  render,
  numericIdParams = "__all__",
  ...props
}: PathParamsRouteProps<P>) => (
  <Route
    {...props}
    render={(routeProps: RouteComponentProps<{ [key: string]: string | undefined }>): ReactNode => {
      let validIdMissing = false;
      /* An object constrcuted from the URL PATH parameters corresponding to
         the `params` prop that are valid integers. */
      const idParams: P = reduce(
        params,
        (curr: P, param: keyof P) => {
          const v: string | undefined = routeProps.match.params[param];
          if (!isNil(v)) {
            if (numericIdParams === "__all__" || includes(numericIdParams, param)) {
              if (!isNaN(parseInt(v))) {
                return { ...curr, [param]: parseInt(v) };
              }
              validIdMissing = true;
              return curr;
            }
            return { ...curr, [param]: v };
          }
          validIdMissing = true;
          return curr;
        },
        {} as P
      );
      if (validIdMissing) {
        return <NotFoundPage />;
      } else if (!isNil(component)) {
        const Component = component;
        return <Component {...idParams} />;
      } else if (!isNil(render)) {
        return render(idParams);
      } else {
        return <></>;
      }
    }}
  />
);

export default React.memo(PathParamsRoute) as typeof PathParamsRoute;
