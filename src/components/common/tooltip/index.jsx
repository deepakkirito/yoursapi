import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";

const CustomTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "black",
    color: theme.palette.text.primary,
    boxShadow: `0px 0px 4px ${theme.palette.text.primary}`,
    fontSize: "0.8rem",
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: "black",
  },
}));

const TooltipCustom = (props) => {
  return (
    <CustomTooltip arrow={true} {...props}>
      {props.children}
    </CustomTooltip>
  );
};

export default TooltipCustom;
