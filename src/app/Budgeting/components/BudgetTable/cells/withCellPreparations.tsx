import React from "react";

interface WithCellPreparationsProps {
  readonly value: any;
}

const withCellPreparations = <P extends object>(Component: React.ComponentType<P>) =>
  class WithCellPreparations extends React.Component<P & WithCellPreparationsProps> {
    render() {
      const { value, ...props } = this.props;
      return <Component {...(props as P)}>{value}</Component>;
    }
  };

export default withCellPreparations;
