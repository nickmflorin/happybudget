import React from "react";
import { View, Text, RichText } from "components/pdf";

interface PageHeaderProps {
  readonly header: PdfActualsTable.Options["header"];
  readonly date: PdfActualsTable.Options["date"];
}

const PageHeader = (props: PageHeaderProps): JSX.Element => {
  return (
    <React.Fragment>
      <View className={"budget-page-primary-header"}>
        <RichText nodes={props.header} />
        <Text className={"budget-page-date"}>{props.date}</Text>
      </View>
    </React.Fragment>
  );
};

export default PageHeader;
