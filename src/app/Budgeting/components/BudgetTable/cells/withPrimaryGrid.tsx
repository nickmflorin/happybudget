import React from "react";

const withPrimaryGrid = <R extends Table.Row>(Component: React.ComponentType<any>) =>
  class WithCellPreparations extends React.Component<any> {
    render() {
      const row: R = this.props.node.data;
      if (row.meta.isBudgetFooter || row.meta.isTableFooter || row.meta.isGroupFooter) {
        return <></>;
      }
      return <Component {...this.props} />;
    }
  };

export default withPrimaryGrid;
