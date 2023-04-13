import { BasicIconProp } from "../icons";

export * from "./props";
export * from "./style";
export * from "./schemas";

export type Affix = BasicIconProp | JSX.Element;

export type Affixes = Affix | Affix[];

export type IDropdownRef = {
  readonly setVisible: (visible: boolean) => void;
};

export type RootModalProps = import("antd/lib/modal").ModalProps;

export interface ModalInstance extends UINotificationsManager {
  readonly setLoading: (value: boolean) => void;
  readonly loading: boolean | undefined;
}

export interface ModalProps extends Omit<RootModalProps, "visible"> {
  readonly id?: string;
  readonly open?: boolean;
  readonly titleIcon?: IconOrElement;
  readonly onCancel?: () => void;
  readonly okButtonClass?: string;
  readonly modal?: NonNullRef<ModalInstance>;
  readonly buttonSpinnerOnLoad?: boolean;
}

export type SearchIndex = string | string[];
export type SearchIndicies = SearchIndex[];
