import { useState } from "react";
import DateProvider from "../hoc/DateProvider";
import { Button, Popover } from "@mui/material";
import { endOfWeek, format, startOfWeek, addDays } from "date-fns";
import { WeekProps } from "../../views/Week";
import { LocaleArrow } from "../common/LocaleArrow";
import { DateCalendar } from "@mui/x-date-pickers";
import useStore from "../../hooks/useStore";

interface WeekDateBtnProps {
  selectedDate: Date;
  onChange(value: Date): void;
  weekProps: WeekProps;
}

const WeekDateBtn = ({ selectedDate, onChange, weekProps }: WeekDateBtnProps) => {
  const { locale, navigationPickerProps } = useStore();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { weekStartOn } = weekProps;
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: weekStartOn });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: weekStartOn });

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
    const ladtDayPrevWeek = addDays(weekStart, -1);
    onChange(ladtDayPrevWeek);
  };
  const handleNext = () => {
    const firstDayNextWeek = addDays(weekEnd, 1);
    onChange(firstDayNextWeek);
  };
  return (
    <>
      <LocaleArrow type="prev" onClick={handlePrev} />
      <Button style={{ padding: 4, fontSize: "0.65rem" }} onClick={handleOpen}>
        {`${format(weekStart, "dd", { locale })} - ${format(weekEnd, "dd MMMM yyyy", {
          locale,
        })}`}
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
      <LocaleArrow type="next" onClick={handleNext} aria-label="next week" />
    </>
  );
};

export { WeekDateBtn };
