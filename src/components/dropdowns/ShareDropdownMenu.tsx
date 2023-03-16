import React, { useMemo, useState } from "react";

import { isNil } from "lodash";

import { ui, http } from "lib";
import { Icon } from "components";
import { Menu } from "components/menus";
import EditPublicTokenMenu from "components/menus/EditPublicTokenMenu";

import Dropdown, { DropdownProps } from "./Dropdown";

export type ShareDropdownMenuProps<
  P extends Model.PublicHttpModel,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
> = Pick<StandardComponentProps, "className"> &
  Omit<DropdownProps, "overlayId" | "overlay"> & {
    readonly instance: P;
    readonly table: Table.TableInstance<R, M>;
    readonly menu?: IMenu["menu"];
    readonly menuProps?: Omit<IMenu, "menu" | "id">;
    readonly publicToken?: Model.PublicToken;
    readonly services: {
      readonly create: (
        id: number,
        payload: Http.PublicTokenPayload,
        options: Http.RequestOptions,
      ) => Promise<Model.PublicToken>;
    };
    readonly urlFormatter: (tokenId: string) => string;
    readonly onCreateTokenSuccess?: ((token: Model.PublicToken) => void) | undefined;
    readonly onEditTokenSuccess?: ((token: Model.PublicToken) => void) | undefined;
    readonly onTokenDeleted?: (() => void) | undefined;
  };

const ShareDropdownMenu = <
  P extends Model.PublicHttpModel,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
>({
  publicToken,
  menuProps,
  services,
  instance,
  table,
  children,
  onTokenDeleted,
  onEditTokenSuccess,
  onCreateTokenSuccess,
  urlFormatter,
  ...props
}: ShareDropdownMenuProps<P, R, M>): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const menu = ui.menu.useMenuIfNotDefined(props.menu);
  const overlayId = ui.useId("public-token-overlay-");
  const [cancelToken] = http.useCancelToken();

  const performShare = useMemo(
    () => () => {
      setLoading(true);
      services
        .create(instance.id, {}, { cancelToken: cancelToken() })
        .then((token: Model.PublicToken) => {
          setLoading(false);
          onCreateTokenSuccess?.(token);
        })
        .catch((e: Error) => {
          setLoading(false);
          table.handleRequestError(e, {
            message: `There was an error sharing the ${instance.type}.`,
          });
        });
    },
    [instance, table, services.create, onCreateTokenSuccess],
  );

  const overlay = useMemo(() => {
    if (isNil(publicToken)) {
      return (
        <Menu
          {...menuProps}
          menu={menu}
          id={overlayId}
          models={[
            {
              id: "share-link",
              loading,
              label: "Create Sharable Link",
              onClick: () => performShare(),
              icon: <Icon icon="link" weight="solid" />,
              keepDropdownOpenOnClick: true,
            },
          ]}
        />
      );
    }
    return (
      <EditPublicTokenMenu
        onSuccess={onEditTokenSuccess}
        onDeleted={() => {
          setVisible(false);
          onTokenDeleted?.();
        }}
        urlFormatter={urlFormatter}
        publicTokenId={publicToken.id}
        id={overlayId}
      />
    );
  }, [
    publicToken,
    onEditTokenSuccess,
    onTokenDeleted,
    overlayId,
    urlFormatter,
    menu,
    menuProps,
    loading,
    performShare,
  ]);

  return (
    <Dropdown
      {...props}
      overlayId={overlayId}
      visible={visible}
      setVisible={setVisible}
      destroyPopupOnHide={true}
      overlay={overlay}
    >
      {children}
    </Dropdown>
  );
};

export default React.memo(ShareDropdownMenu) as typeof ShareDropdownMenu;
