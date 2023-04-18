import { ComponentStory, ComponentMeta } from "@storybook/react";

import { storybook } from "lib/support";

import { StorybookContainer } from "components/support";

import { Header as HeaderComponent, HeaderProps } from ".";

export default {
  title: "Layout/Header",
  component: HeaderComponent,
  argTypes: storybook.modifyProps(HeaderComponent, {}, { remove: [storybook.StandardProps] }),
} as ComponentMeta<typeof HeaderComponent>;

/* Here, because the Header has a plain white background color (and no border) it is not easily
   visible in documentation unless we place it in a mocked "page", with a background color and
   border, that represents how the header would look on a page-like structure. */
const Template: ComponentStory<React.ComponentType<HeaderProps>> = args => (
  <StorybookContainer style={{ backgroundColor: "#EFEFEF", width: "100%", height: 400 }}>
    <HeaderComponent {...args} style={{ position: "absolute", top: 0, left: 0, width: "100%" }} />
  </StorybookContainer>
);

export const Header = Template.bind({});
