import { Avatar, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";
import { useWindowResize } from "../../hooks/useWindowResize";
import { DefaultRecourse } from "../../types";
import useStore from "../../hooks/useStore";

interface EmptyHeaderProps {
  resource: DefaultRecourse;
}
const EmptyHeader = ({ resource }: EmptyHeaderProps) => {
  const { recourseHeaderComponent, resourceFields, resources, direction, resourceViewMode } =
    useStore();
  const { width } = useWindowResize();

  const text = resource[resourceFields.textField];
  const subtext = resource[resourceFields.subTextField || ""];
  const avatar = resource[resourceFields.avatarField || ""];
  const color = resource[resourceFields.colorField || ""];

  if (recourseHeaderComponent instanceof Function) {
    return recourseHeaderComponent(resource);
  }

  const headerBorders =
    resourceViewMode === "tabs"
      ? {}
      : {
          borderColor: "white",
          borderStyle: "solid",
          borderWidth: "1px 1px 0 1px",
        };
  return (
    <ListItem
      sx={{
        padding: "2px 10px",
        textAlign: direction === "rtl" ? "right" : "left",
        ...headerBorders,
      }}
      component="span"
    >
      <ListItemText
        primary={
          <Typography
            variant="body2"
            style={{ fontSize: "0.65rem", textTransform: "capitalize", fontWeight: "900" }}
            noWrap
          ></Typography>
        }
        secondary={
          <Typography
            variant="caption"
            style={{ fontSize: "0.55rem", textTransform: "capitalize" }}
            color="textSecondary"
            noWrap
          ></Typography>
        }
        style={{
          padding: 0,
          height: "30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      />
    </ListItem>
  );
};

export { EmptyHeader };
