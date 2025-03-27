"use client";
import React, { useState, useMemo, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  Box,
  IconButton,
  Autocomplete,
  Typography,
  CircularProgress,
  Skeleton,
  Divider,
  Popper,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  RefreshOutlined,
  DownloadRounded,
} from "@mui/icons-material";
import { Resizable } from "react-resizable";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import TooltipCustom from "../tooltip";
import CustomSelect from "../customSelect";

const CustomPopper = (props) => {
  return (
    <Popper
      {...props}
      sx={{
        ...props.style,
        backgroundColor: "white !important", // Set background color
        borderRadius: "8px", // Border radius
        border: "1px solid", // Add a border
        borderColor: "background.defaultSolid", // Set border color
        overflow: "hidden", // Hide overflow
        background: "none",
      }}
    />
  );
};

const CustomTable = ({
  data,
  columns,
  onRowClick,
  isLoading,
  title,
  pagination = { page: 0, rowsPerPage: 10 },
  filters = {},
  searchTerm = "",
  order = "asc",
  orderBy = "",
  totalData = 0,
  logType = "",
  setLogType = () => {},
  setOrder = () => {},
  setOrderBy = () => {},
  setPagination = () => {},
  setFilters = () => {},
  setSearchTerm = () => {},
  refresh = () => {},
  downloadCsv = () => {},
}) => {
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [columnWidths, setColumnWidths] = useState(() => {
    return columns.reduce((acc, col) => {
      const keys = col.id.split("."); // Split based on dot notation for nested fields
      let current = acc;

      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          // This is the last key, so assign the width value
          current[key] = col.width || 150; // Default width is 150 if not provided
        } else {
          // If the key does not exist, initialize as an empty object
          current[key] = current[key] || {};
        }
      });

      return acc;
    }, {});
  });
  const [isRotated, setIsRotated] = useState(false);

  const tableRef = useRef(null);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleFilterChange = (columnId, value) => {
    setFilters((prev) => ({ ...prev, [columnId]: value || "" }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleResize = (columnId, event, { size }) => {
    setColumnWidths((prev) => ({ ...prev, [columnId]: size.width }));
  };

  const getValue = (obj, path) =>
    path.split(".").reduce((acc, part) => acc && acc[part], obj) || "-";

  const getColumnOptions = (columnId) => {
    const column = columns.find((col) => col.id === columnId);

    return Array.from(
      new Set(
        data.map((row) => {
          if (column?.filterValue) {
            return column.filterValue(row); // Use filterValue if defined
          }
          return getValue(row, columnId)?.toString() || "-";
        })
      )
    );
  };

  const filteredData = useMemo(() => {
    return (
      data
        // .filter((row) =>
        //   columns.some((col) => {
        //     const cellValue = getValue(row, col.id);
        //     return searchTerm
        //       ? cellValue
        //           ?.toString()
        //           .toLowerCase()
        //           .includes(searchTerm.toLowerCase())
        //       : true;
        //   })
        // )
        .filter((row) =>
          Object.entries(filters).every(([key, value]) => {
            if (!value) return true;

            const column = columns.find((col) => col.id === key);
            let cellValue = getValue(row, key)?.toString().toLowerCase() || "";

            // Apply filterValue transformation if the column has one
            if (column?.filterValue) {
              cellValue = column.filterValue(row).toLowerCase();
            }

            return cellValue.includes(value.toLowerCase());
          })
        )
    );

    // .sort((a, b) => {
    //   const aValue = getValue(a, orderBy);
    //   const bValue = getValue(b, orderBy);
    //   if (aValue < bValue) return order === "asc" ? -1 : 1;
    //   if (aValue > bValue) return order === "asc" ? 1 : -1;
    //   return 0;
    // });
  }, [data, orderBy, order, searchTerm, filters]);

  const getColumnWidth = (columnId = "") => {
    if (!columnId.includes(".")) return columnWidths[columnId];
    const keys = columnId.split("."); // Split based on dot notation for nested fields
    let current = columnWidths;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        // This is the last key, so return the width value
        return current[key];
      } else {
        // If the key does not exist, return null
        return current[key] ? current[key][key] : 200;
      }
    });
  };

  const renderSkeleton = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TableRow key={index}>
        {columns.map((column) => (
          <TableCell key={column.id} width={getColumnWidth(column.id)}>
            <Skeleton animation="wave" sx={{ bgcolor: "background.default" }} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Paper
      sx={{
        width: "100%",
        maxHeight: fullScreen ? "100vh" : "90vh",
        minHeight: fullScreen ? "100vh" : "auto",
        overflow: "hidden",
        padding: 2,
        position: fullScreen ? "fixed" : "relative",
        top: 0,
        left: 0,
        zIndex: fullScreen ? 1000 : "auto",
        backgroundColor: fullScreen
          ? "background.defaultSolid"
          : "background.default",
        backgroundImage: "none",
        borderRadius: "0.5rem",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.5s",
        // "& .react-resizable": {
        //   display: "inline-block",
        //   position: "relative",
        //   width: "100%",
        // },
        // "& .react-resizable-handle": {
        //   position: "absolute",
        //   right: "0",
        //   top: "0",
        //   bottom: "0",
        //   width: "5px",
        //   cursor: "col-resize",
        //   background: "rgba(255, 255, 255, 0.3)",
        // },
      }}
      ref={tableRef}
    >
      {/* Toolbar */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={"1rem"}
        mb={1}
        sx={{
          overflowX: "auto",
        }}
      >
        <Box className="flex gap-6 items-center">
          <Typography
            sx={{ fontWeight: "bold" }}
            fontSize={{
              xs: "0.9rem",
              sm: "1.2rem",
            }}
          >
            {title}
          </Typography>
          <CustomSelect
            multiple={true}
            labelTop="Type"
            options={[
              { label: "User", value: "user" },
              { label: "Data Api", value: "data" },
              { label: "Project", value: "project" },
              { label: "Auth Api", value: "auth" },
              { label: "Api", value: "api" },
            ]}
            value={logType}
            none={false}
            handleChange={(value) => setLogType(value)}
          />
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap={"1rem"}
        >
          <TextField
            size="small"
            type="search"
            placeholder="Search..."
            variant="outlined"
            margin="dense"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              minWidth: searchVisible ? "20rem" : "0rem", // Smooth width change
              maxWidth: searchVisible ? "20rem" : "0rem", // Smooth width change
              opacity: searchVisible ? 1 : 0, // Smooth fade in/out
              transition:
                "min-width 0.5s ease, max-width 0.5s ease, opacity 0.3s ease-in-out",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          />
          {/* )} */}
          <div className="flex gap-2 items-center py-2">
            <TooltipCustom title="Toggle Search" placement="top">
              <IconButton onClick={() => setSearchVisible(!searchVisible)}>
                {!searchVisible ? (
                  <SearchIcon color="secondary" />
                ) : (
                  <SearchOffIcon color="secondary" />
                )}
              </IconButton>
            </TooltipCustom>
            <TooltipCustom title="Refresh" placement="top">
              <IconButton
                onClick={() => {
                  refresh();
                  setIsRotated(true);
                  setTimeout(() => {
                    setIsRotated(false);
                  }, 500);
                }}
              >
                <RefreshOutlined
                  color="secondary"
                  sx={{
                    transform: isRotated ? "rotate(360deg)" : "rotate(0deg)",
                    transition: "all 0.5s",
                  }}
                />
              </IconButton>
            </TooltipCustom>
            <TooltipCustom title="Download CSV" placement="top">
              <IconButton onClick={downloadCsv}>
                <DownloadRounded color="secondary" />
              </IconButton>
            </TooltipCustom>
            <TooltipCustom title="Toggle Filters" placement="top">
              <IconButton onClick={() => setFilterVisible(!filterVisible)}>
                <FilterListIcon color="secondary" />
              </IconButton>
            </TooltipCustom>
            <TooltipCustom title="Toggle Fullscreen" placement="top">
              <IconButton onClick={() => setFullScreen(!fullScreen)}>
                {fullScreen ? (
                  <FullscreenExitIcon color="secondary" />
                ) : (
                  <FullscreenIcon color="secondary" />
                )}
              </IconButton>
            </TooltipCustom>
          </div>
        </Box>
      </Box>

      <Divider className="w-[100%] mx-auto" />

      {/* Table */}
      <TableContainer
        sx={{
          width: "100%",
          maxHeight: fullScreen ? "calc(100vh - 10rem)" : "calc(100vh - 17rem)",
          overflow: "auto",
          marginTop: "0.5rem",
          "& .MuiTableRow-root": {
            borderBottom: "2px solid",
            borderColor: "divider",
          },
        }}
      >
        <Table sx={{ width: "-webkit-fill-available" }}>
          <TableHead
            className="sticky top-0 z-10"
            sx={{
              backgroundColor: "background.defaultSolid",
            }}
          >
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} width={getColumnWidth(column.id)}>
                  <Resizable
                    width={getColumnWidth(column.id)}
                    height={30}
                    onResizeStop={(e, data) => handleResize(column.id, e, data)}
                    axis="x"
                  >
                    <div
                      style={{
                        width: getColumnWidth(column.id),
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleSort(column.id)}
                      >
                        <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                          {column.label}
                        </Typography>
                      </TableSortLabel>
                    </div>
                  </Resizable>
                  {filterVisible && (
                    <Autocomplete
                      options={getColumnOptions(column.id)}
                      value={filters[column.id] || ""}
                      PopperComponent={CustomPopper} // Use custom Popper
                      onChange={(_, value) =>
                        handleFilterChange(column.id, value)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          size="small"
                          placeholder="Filter"
                        />
                      )}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              renderSkeleton()
            ) : filteredData?.length ? (
              filteredData.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => onRowClick(row)}
                  sx={{ cursor: "pointer" }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      width={getColumnWidth(column.id)}
                    >
                      {column.cell ? (
                        column.cell(row)
                      ) : (
                        <Typography variant="h7">
                          {getValue(row, column.id)}
                        </Typography>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ textAlign: "center", fontSize: "1rem" }}
                >
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalData}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        onPageChange={(_, newPage) =>
          setPagination((prev) => ({ ...prev, page: newPage }))
        }
        onRowsPerPageChange={(event) =>
          setPagination({
            page: 0,
            rowsPerPage: parseInt(event.target.value, 10),
          })
        }
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
      />
    </Paper>
  );
};

export default CustomTable;
