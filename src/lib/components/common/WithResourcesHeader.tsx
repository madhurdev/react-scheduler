import { ReactChild, useMemo } from "react";
import { DefaultRecourse } from "../../types";
import { ResourceHeader } from "./ResourceHeader";
import { ButtonTabProps, ButtonTabs } from "./Tabs";
import useStore from "../../hooks/useStore";
import { EmptyHeader } from "./EmptyHeader";

interface WithResourcesHeaderProps {
  renderChildren(resource: DefaultRecourse, index: number): ReactChild;
  renderHeaderTable(): ReactChild;
}
const WithResourcesHeader = ({ renderChildren, renderHeaderTable }: WithResourcesHeaderProps) => {
  const { resourceViewMode } = useStore();

  if (resourceViewMode === "tabs") {
    return (
      <ResourcesTabTables renderChildren={renderChildren} renderHeaderTable={renderHeaderTable} />
    );
  } else {
    return (
      <ResourcesTables renderChildren={renderChildren} renderHeaderTable={renderHeaderTable} />
    );
  }
};

const ResourcesTables = ({ renderChildren, renderHeaderTable }: WithResourcesHeaderProps) => {
  const { resources, resourceFields } = useStore();

  const newLocal = 0;
  return (
    <>
      <div>
        <EmptyHeader resource={resources[0]} />
        {renderHeaderTable()}
      </div>
      {resources.map((res: DefaultRecourse, i: number) => (
        <div key={`${res[resourceFields.idField]}_${i}`}>
          <ResourceHeader resource={res} />
          {renderChildren(res, i)}
        </div>
      ))}
    </>
  );
};

const ResourcesTabTables = ({ renderChildren }: WithResourcesHeaderProps) => {
  const { resources, resourceFields, selectedResource, handleState } = useStore();

  const tabs: ButtonTabProps[] = resources.map((res, i) => {
    return {
      id: res[resourceFields.idField],
      label: <ResourceHeader resource={res} />,
      component: <>{renderChildren(res, i)}</>,
    };
  });

  const setTab = (tab: DefaultRecourse["assignee"]) => {
    handleState(tab, "selectedResource");
  };

  const currentTabSafeId = useMemo(() => {
    const firstId = resources[0][resourceFields.idField];
    if (!selectedResource) {
      return firstId;
    }
    // Make sure current selected id is within the resources array
    const idx = resources.findIndex((re) => re[resourceFields.idField] === selectedResource);
    if (idx < 0) {
      return firstId;
    }

    return selectedResource;
  }, [resources, selectedResource, resourceFields.idField]);

  return (
    <ButtonTabs tabs={tabs} tab={currentTabSafeId} setTab={setTab} style={{ display: "grid" }} />
  );
};
WithResourcesHeader.defaultProps = {
  span: 1,
};

export { WithResourcesHeader };
