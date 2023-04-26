import hoistNonReactStatics from "hoist-non-react-statics";

import * as ui from "lib/ui/types";

import { Loading, LoadingProps } from "./Loading";

type _WithLoadingProps = Pick<LoadingProps, "loading"> & {
  readonly loadingProps?: Omit<LoadingProps, "children">;
};

export type WithLoadingProps<P> = Omit<_WithLoadingProps, keyof P> & P;

/**
 * A HOC (Higher Order Component) that can be used to modify a component such that it can accept
 * a loading prop and conditionally render a loading indicator in the center of the component when
 * loading.
 *
 * @param {React.FunctionComponent<P>} Component The component that should be modified with the HOC.
 * @returns {React.FunctionComponent<P & _WithLoadingProps>}
 */
export const withLoading = <P extends ui.ComponentProps>(
  Component: React.FunctionComponent<P>,
): React.FunctionComponent<P & _WithLoadingProps> => {
  const LoadedComponent = ({ loading, loadingProps, ...props }: _WithLoadingProps) => (
    <Loading {...loadingProps} loading={loading}>
      <Component {...(props as P)} />
    </Loading>
  );

  return hoistNonReactStatics(LoadedComponent, Component);
};
