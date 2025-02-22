"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@mui/material";

const MenuItemWrapper = styled(MenuItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.invert,
  ":hover": {
    backgroundColor: theme.palette.background.hover,
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.background.defaultSolid,
    ":hover": {
      background: theme.palette.background.defaultSolid,
    },
  },
}));

const CustomSelect = ({
  options = [],
  label = "",
  value = "",
  disabled = false,
  handleChange = () => {},
  none = true,
  labelTop = "",
  buttonLabel = "",
  handleButton = () => {},
  style = {},
  size = "small",
  fullWidth = true,
  buttonDisable = false,
  ...props
}) => {
  return (
    <Box className="flex gap-4 items-center w-[100%]" sx={style}>
      {label && (
        <Box width={"100%"} className="flex justify-end">
          <Typography width={"fit-content"} textAlign={"right"}>
            {label}
          </Typography>
        </Box>
      )}
      <FormControl fullWidth={fullWidth} sx={{ minWidth: 120 }} size={size}>
        {labelTop && <InputLabel>{labelTop}</InputLabel>}
        <Select
          value={value}
          onChange={handleChange}
          label={labelTop}
          disabled={disabled}
          sx={{
            ...props.sx,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: "background.defaultSolid",
                marginTop: "0.5rem",
                boxShadow: "none",
                border: "1px solid",
                borderColor: "background.defaultSolid",
                "& .MuiList-padding": {
                  padding: "0rem",
                },
              },
            },
          }}
          {...props}
        >
          {none && (
            <MenuItemWrapper value="">
              <em>None</em>
            </MenuItemWrapper>
          )}
          {options.length &&
            options.map((item, index) => (
              <MenuItemWrapper
                key={index}
                value={item.value}
                name={item.label}
                disabled={item?.disabled}
              >
                {item.label}
              </MenuItemWrapper>
            ))}
          {buttonLabel && (
            <div className="px-4 py-2 cursor-pointer">
              <Button
                fullWidth
                onClick={handleButton}
                variant="contained"
                className="sticky bottom-0"
                disabled={buttonDisable}
              >
                {buttonLabel}
              </Button>
            </div>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CustomSelect;
