import React from "react";

const withExcludeGroupRows = <R extends BudgetTable.Row>(Component: React.ComponentType<any>) =>
  class WithExcludeGroupRows extends React.Component<any> {
    render() {
      const row: R = this.props.node.data;
      if (row.meta.isGroupRow === true) {
        return <></>;
      }
      return <Component {...this.props} />;
    }
  };

export default withExcludeGroupRows;
