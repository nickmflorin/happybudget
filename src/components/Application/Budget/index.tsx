import React from "react";
import { useHistory, useLocation } from "react-router-dom";

import { FileAddOutlined, ContactsOutlined, FolderOutlined, DeleteOutlined } from "@ant-design/icons";

import { Layout } from "components/layout";
import { ShareIcon, ChatIcon, ExportIcon, SettingsIcon, BidAssistantIcon } from "components/svgs";

const Content = React.lazy(() => import("./Content"));

const Budget = (): JSX.Element => {
  const history = useHistory();
  const location = useLocation();

  return (
    <Layout
      collapsed
      toolbar={[
        {
          icon: <BidAssistantIcon />
        },
        {
          icon: <ExportIcon />
        },
        {
          icon: <ShareIcon />
        },
        {
          icon: <SettingsIcon />
        },
        {
          icon: <ChatIcon />
        }
      ]}
      sidebar={[
        {
          icon: <FileAddOutlined className={"icon"} />,
          onClick: () => history.push("/templates"),
          active: location.pathname.startsWith("/templates"),
          tooltip: {
            title: "Create New Budget",
            placement: "right"
          }
        },
        {
          icon: <FolderOutlined className={"icon"} />,
          onClick: () => history.push("/budgets"),
          active: location.pathname.startsWith("/budgets"),
          tooltip: {
            title: "My Budgets",
            placement: "right"
          }
        },
        {
          icon: <DeleteOutlined className={"icon"} />,
          onClick: () => history.push("/trash"),
          active: location.pathname.startsWith("/trash"),
          tooltip: {
            title: "Deleted Budgets",
            placement: "right"
          }
        },
        {
          icon: <ContactsOutlined className={"icon"} />,
          onClick: () => history.push("/contacts"),
          active: location.pathname.startsWith("/contacts"),
          tooltip: {
            title: "Contacts",
            placement: "right"
          }
        }
      ]}
    >
      <Content />
    </Layout>
  );
};

export default Budget;
