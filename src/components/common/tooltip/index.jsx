import {
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.invert,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
    border: "0.1px solid",
    borderColor: "divider",
    fontSize: "0.8rem",
  },
  [`& .${tooltipClasses.arrow}`]: {
    // color: theme.palette.background.foreground,
    // backgroundColor: theme.palette.background.foreground,
  },
}));

const TooltipCustom = (props) => {
  return (
    <CustomTooltip  arrow={true} {...props}>
      {props.children}
    </CustomTooltip>
  );
};

export default TooltipCustom;
