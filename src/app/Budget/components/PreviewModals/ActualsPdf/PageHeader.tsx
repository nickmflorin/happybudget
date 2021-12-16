import { View, RichText } from "components/pdf";

interface PageHeaderProps {
  readonly header: PdfActualsTable.Options["header"];
}

const PageHeader = (props: PageHeaderProps): JSX.Element => {
  return (
    <View className={"page-header"}>
      <View className={"page-primary-header"}>
        <RichText nodes={props.header} />
      </View>
    </View>
  );
};

export default PageHeader;
