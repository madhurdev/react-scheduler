import { useState } from "react";
import DateProvider from "../hoc/DateProvider";
import { DateCalendar } from "@mui/x-date-pickers";
import { Button, Popover } from "@mui/material";
import { format, addDays } from "date-fns";
import { LocaleArrow } from "../common/LocaleArrow";
import useStore from "../../hooks/useStore";

interface DayDateBtnProps {
  selectedDate: Date;
  onChange(value: Date): void;
}

const DayDateBtn = ({ selectedDate, onChange }: DayDateBtnProps) => {
  const { locale, navigationPickerProps } = useStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (e: Date | null) => {
    onChange(e || new Date());
    handleClose();
  };

  const handlePrev = () => {
    const prevDay = addDays(selectedDate, -1);
    onChange(prevDay);
  };
  const handleNext = () => {
    const nexDay = addDays(selectedDate, 1);
    onChange(nexDay);
  };
  return (
    <>
      <div style={{ display: "grid", gap: "5px", gridTemplateColumns: "auto 1fr auto" }}>
        <LocaleArrow type="prev" onClick={handlePrev} />
        <Button
          style={{
            padding: "4px 10px 4px 10px",
            fontSize: "0.65rem",
            background: "#EDEDED",
            borderRadius: "10%",
            color: "black",
            fontWeight: 600,
          }}
          onClick={handleOpen}
        >
          {format(selectedDate, "dd MMMM yyyy", { locale })}
        </Button>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <DateProvider>
            <DateCalendar
              {...navigationPickerProps}
              openTo="day"
              views={["month", "day"]}
              value={selectedDate}
              onChange={handleChange}
            />
          </DateProvider>
        </Popover>
        <LocaleArrow type="next" onClick={handleNext} aria-label="next day" />
      </div>
    </>
  );
};

export { DayDateBtn };
