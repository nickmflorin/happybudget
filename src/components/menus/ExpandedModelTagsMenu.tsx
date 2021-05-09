import React, { Ref, forwardRef, useMemo, useImperativeHandle, useCallback, useState, useRef, useEffect } from "react";
import { isNil, get } from "lodash";

import classNames from "classnames";
import { Input } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-light-svg-icons";

import { isCharacterKeyPress, isBackspaceKeyPress } from "lib/util/events";

import createModelTagsMenu, {
  ModelTagsMenuRef,
  SingleModelTagsMenuProps,
  MultipleModelTagsMenuProps
} from "./ModelTagsMenu";
import "./ExpandedModelTagsMenu.scss";

export type ExpandedModelTagsMenuRef<M extends Model.Model = Model.Model> = {
  readonly focusSearch: (value: boolean, search?: string) => void;
  readonly incrementMenuFocusedIndex: () => void;
  readonly decrementMenuFocusedIndex: () => void;
  readonly focusMenu: (value: boolean) => void;
  readonly focusMenuAtIndex: (index: number) => void;
  readonly getModelAtMenuFocusedIndex: () => M | null;
  readonly selectModelAtMenuFocusedIndex: () => void;
  readonly menuFocused: boolean;
  readonly menuFocusedIndex: number | null;
  readonly menuAllowableFocusedIndexRange: number;
};

interface _ExpandedModelTagsMenuProps<M extends Model.Model> extends StandardComponentProps {
  readonly menuClassName?: string;
  readonly menuStyle?: React.CSSProperties;
  readonly forwardedRef?: Ref<ExpandedModelTagsMenuRef<M>>;
  readonly focusSearchOnCharPress?: boolean;
}

interface SingleExpandedModelTagsMenuProps<M extends Model.Model>
  extends Omit<SingleModelTagsMenuProps<M>, "className" | "style" | "forwardedRef">,
    _ExpandedModelTagsMenuProps<M> {}

interface MultipleExpandedModelTagsMenuProps<M extends Model.Model>
  extends Omit<MultipleModelTagsMenuProps<M>, "className" | "style" | "forwardedRef">,
    _ExpandedModelTagsMenuProps<M> {}

type ExpandedModelTagsMenuProps<M extends Model.Model> =
  | SingleExpandedModelTagsMenuProps<M>
  | MultipleExpandedModelTagsMenuProps<M>;

const ExpandedModelTagsMenu = <M extends Model.Model>({
  className,
  menuClassName,
  menuStyle,
  style,
  search,
  forwardedRef,
  focusSearchOnCharPress,
  ...props
}: ExpandedModelTagsMenuProps<M>): JSX.Element => {
  const [_search, setSearch] = useState("");
  const menuRef = useRef<ModelTagsMenuRef<M>>(null);
  const searchRef = useRef<Input>(null);
  const ModelTagsMenu = useMemo(() => createModelTagsMenu<M>(), []);

  const getFromMenuRef = useCallback(
    (getter: string, notSet: any): any => {
      if (!isNil(menuRef.current)) {
        return get(menuRef.current, getter);
      }
      return notSet;
    },
    [menuRef]
  );

  const getModelAtMenuFocusedIndex = () => {
    if (!isNil(menuRef.current)) {
      return menuRef.current.getModelAtFocusedIndex();
    }
    return null;
  };

  const selectModelAtMenuFocusedIndex = () => {
    if (!isNil(menuRef.current)) {
      return menuRef.current.selectModelAtFocusedIndex();
    }
  };

  const focusSearch = (value: boolean, searchValue?: string, timeout?: number) => {
    const searchInput = searchRef.current;
    if (!isNil(searchInput)) {
      if (value === true) {
        setTimeout(() => {
          searchInput.focus();
        }, timeout || 100);
        if (!isNil(searchValue)) {
          setSearch(searchValue);
        }
      } else {
        searchInput.blur();
        searchInput.setState({ focused: false });
      }
    }
  };

  useImperativeHandle(
    forwardedRef,
    (): ExpandedModelTagsMenuRef<M> => ({
      menuFocused: getFromMenuRef("focused", false),
      menuFocusedIndex: getFromMenuRef("focusedIndex", null),
      menuAllowableFocusedIndexRange: getFromMenuRef("allowableFocusedIndexRange", 0),
      getModelAtMenuFocusedIndex: getModelAtMenuFocusedIndex,
      selectModelAtMenuFocusedIndex: selectModelAtMenuFocusedIndex,
      incrementMenuFocusedIndex: () => {
        !isNil(menuRef.current) && menuRef.current.incrementFocusedIndex();
      },
      decrementMenuFocusedIndex: () => {
        !isNil(menuRef.current) && menuRef.current.decrementFocusedIndex();
      },
      focusMenuAtIndex: (index: number) => {
        !isNil(menuRef.current) && menuRef.current.focusAtIndex(index);
      },
      focusMenu: (value: boolean) => {
        !isNil(menuRef.current) && menuRef.current.focus(value);
      },
      focusSearch: focusSearch
    })
  );

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      if (isCharacterKeyPress(e) || isBackspaceKeyPress(e)) {
        const searchInput = searchRef.current;
        if (!isNil(searchInput)) {
          if (searchInput.state.focused === false) {
            searchInput.focus();
          }
        }
      } else {
        const menuRefObj = menuRef.current;
        if (!isNil(menuRefObj)) {
          if (e.code === "Enter") {
            selectModelAtMenuFocusedIndex();
          } else if (e.code === "ArrowDown") {
            e.stopPropagation();
            if (menuRefObj.focused === true) {
              menuRefObj.incrementFocusedIndex();
            } else {
              menuRefObj.focusAtIndex(0);
              focusSearch(false);
            }
          } else if (e.code === "ArrowUp") {
            e.stopPropagation();
            if (menuRefObj.focused) {
              if (menuRefObj.focusedIndex === 0) {
                menuRefObj.focus(false);
                focusSearch(true);
              } else {
                menuRefObj.decrementFocusedIndex();
              }
            }
          }
        }
      }
    };
    window.addEventListener("keydown", keyListener);
    return () => window.removeEventListener("keydown", keyListener);
  }, [searchRef, menuRef]);

  return (
    <div className={classNames("expanded-model-tags-menu", className)} style={style}>
      <div className={"search-container"}>
        <Input
          className={"input--small"}
          placeholder={"Search Rows"}
          autoFocus={true}
          value={isNil(search) ? _search : search}
          ref={searchRef}
          onFocus={() => {
            const menuRefObj = menuRef.current;
            if (!isNil(menuRefObj)) {
              menuRefObj.focus(false);
            }
          }}
          prefix={<FontAwesomeIcon className={"icon"} icon={faSearch} />}
          allowClear={true}
          style={{ maxWidth: 300, minWidth: 100 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(event.target.value);
          }}
        />
      </div>
      <ModelTagsMenu
        {...props}
        className={menuClassName}
        style={menuStyle}
        search={isNil(search) ? _search : search}
        ref={menuRef}
      />
    </div>
  );
};

export const TypeAgnosticExpandedModelTagsMenu = forwardRef(
  (props: ExpandedModelTagsMenuProps<any>, ref?: Ref<ExpandedModelTagsMenuRef>) => (
    <ExpandedModelTagsMenu<any> {...props} forwardedRef={ref} />
  )
);

const createExpandedModelTagsMenu = <M extends Model.Model>() => {
  return forwardRef((props: ExpandedModelTagsMenuProps<M>, ref?: Ref<ExpandedModelTagsMenuRef<M>>) => (
    <ExpandedModelTagsMenu<M> {...props} forwardedRef={ref} />
  ));
};

export default createExpandedModelTagsMenu;
