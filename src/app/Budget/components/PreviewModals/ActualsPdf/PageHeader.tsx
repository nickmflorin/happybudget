import { View, Heading } from "components/pdf";

interface PageHeaderProps {
  readonly header: string;
}

const PageHeader = (props: PageHeaderProps): JSX.Element => {
  return (
    <View className={"page-header"}>
      <View className={"page-primary-header"}>
        <Heading level={2}>{props.header}</Heading>
      </View>
    </View>
  );
};

export default PageHeader;
