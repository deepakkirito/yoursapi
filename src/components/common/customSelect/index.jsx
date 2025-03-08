"use client";

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  ListSubheader,
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
    backgroundColor: theme.palette.background.defaultSolid + " !important",
    ":hover": {
      background: theme.palette.background.defaultSolid,
    },
  },
}));

const CustomSelect = ({
  options = [],
  grouped = false, // Enable grouping
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
  multiple = false,
  maxWidth = "200px",
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
          multiple={multiple}
          value={value}
          onChange={(event) => {
            multiple
              ? handleChange(event.target.value.filter((item) => item))
              : handleChange(event);
          }}
          label={labelTop}
          disabled={disabled}
          renderValue={(selected) =>
            multiple
              ? selected
                  .map(
                    (val) =>
                      (grouped
                        ? options.flatMap((group) => group.options) // Flatten grouped options
                        : options
                      ).find((opt) => opt.value === val)?.label
                  )
                  .join(", ")
              : (grouped
                  ? options.flatMap((group) => group.options)
                  : options
                ).find((opt) => opt.value === selected)?.label
          }
          sx={{
            ...props.sx,
            maxWidth: multiple ? maxWidth : "100%",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
            },
            "& .MuiSelect-select": {
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: multiple ? maxWidth : "100%",
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
          {grouped ? (
            options?.length ? (
              options.map((group, groupIndex) => [
                <ListSubheader
                  key={`group-${groupIndex}`}
                  sx={{
                    backgroundColor: "background.header",
                    color: "text.primary",
                    fontWeight: "bold",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {group.label}
                </ListSubheader>,
                group.options?.length ? (
                  group.options.map((item, index) => (
                    <MenuItemWrapper key={index} value={item.value}>
                      {item.label}
                    </MenuItemWrapper>
                  ))
                ) : (
                  <MenuItemWrapper value="">
                    <em>None</em>
                  </MenuItemWrapper>
                ),
              ])
            ) : (
              <MenuItemWrapper value="">
                <em>None</em>
              </MenuItemWrapper>
            )
          ) : (
            options.map((item, index) => (
              <MenuItemWrapper key={index} value={item.value}>
                {item.label}
              </MenuItemWrapper>
            ))
          )}
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
