import React, { Ref, forwardRef, useMemo, useImperativeHandle, useCallback, useState, useRef, useEffect } from "react";
import { isNil, get } from "lodash";

import classNames from "classnames";
import { Input } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-light-svg-icons";

import { isCharacterKeyPress, isBackspaceKeyPress } from "lib/util/events";

import { ExpandedModelMenuRef, ModelMenuRef, ExpandedModelMenuProps } from "./model";
import createModelMenu from "./ModelMenu";
import "./ExpandedModelMenu.scss";

const ExpandedModelMenu = <M extends Model.M>({
  className,
  style,
  search,
  forwardedRef,
  focusSearchOnCharPress,
  onSearch,
  ...props
}: ExpandedModelMenuProps<M>): JSX.Element => {
  const [_search, _setSearch] = useState("");
  const menuRef = useRef<ModelMenuRef<M>>(null);
  const searchRef = useRef<Input>(null);
  const ModelMenu = useMemo(() => createModelMenu<M>(), []);

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

  const setSearch = (value: string) => {
    _setSearch(value);
    if (!isNil(onSearch)) {
      onSearch(value);
    }
  };

  const focusSearch = (value: boolean, searchValue?: string, timeout?: number) => {
    const searchInput = searchRef.current;
    if (!isNil(searchInput)) {
      if (value === true) {
        setTimeout(() => {
          searchInput.focus();
        }, timeout || 25);
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
    (): ExpandedModelMenuRef<M> => ({
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
    <div className={classNames("expanded-model-menu", className)} style={style}>
      <div className={"search-container"}>
        <Input
          className={"input--small"}
          placeholder={props.searchPlaceholder || "Search"}
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
      {!isNil(props.children) ? (
        props.children
      ) : (
        <ModelMenu
          {...props}
          {...props.menuProps}
          loading={props.menuLoading}
          search={isNil(search) ? _search : search}
          ref={menuRef}
        />
      )}
    </div>
  );
};

export const TypeAgnosticExpandedModelMenu = forwardRef(
  (props: ExpandedModelMenuProps<any>, ref?: Ref<ExpandedModelMenuRef<any>>) => (
    <ExpandedModelMenu<any> {...props} forwardedRef={ref} />
  )
);

const createExpandedModelMenu = <M extends Model.M>() => {
  return forwardRef((props: ExpandedModelMenuProps<M>, ref?: Ref<ExpandedModelMenuRef<M>>) => (
    <ExpandedModelMenu<M> {...props} forwardedRef={ref} />
  ));
};

export default createExpandedModelMenu;
