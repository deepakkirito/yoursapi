import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  //   border: `1px solid ${theme.palette.background.foreground}`,
  background: "none",
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&::before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={
      <ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} color="secondary" />
    }
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: theme.palette.background.defaultSolid,
  border: `1px solid ${theme.palette.background.foreground}`,
  borderRadius: "0.5rem",
  flexDirection: "row-reverse",
  [`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
      transform: "rotate(90deg)",
    },
  [`& .${accordionSummaryClasses.content}`]: {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.background.foreground}`,
  borderBottom: `1px solid ${theme.palette.background.foreground}`,
  backgroundColor: theme.palette.background.default,
  borderRadius: "0.5rem",
}));

const CustomAccordion = ({ items, defaultExpanded, onChange }) => {
  const [expanded, setExpanded] = useState(defaultExpanded || false);

  const handleChange = (panel) => (_, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
    if (onChange) {
      onChange(panel, newExpanded);
    }
  };

  return (
    <div className="w-full">
      {items.map((item) => (
        <Accordion
          key={item.id}
          id={item.id}
          expanded={expanded === item.id}
          onChange={handleChange(item.id)}
        >
          <AccordionSummary
            aria-controls={`${item.id}-content`}
            id={`${item.id}-header`}
          >
            <Typography component="span">{item.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{item.content}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default CustomAccordion;
