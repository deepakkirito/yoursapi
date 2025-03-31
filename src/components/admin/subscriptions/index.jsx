import NavbarLayout from "@/components/common/navbarLayout";
import PageLayout from "@/components/common/pageLayout";
import SearchFilter from "@/components/common/searchFilter";
import {
  deleteSubscriptionApi,
  getSubscriptionApi,
} from "@/utilities/api/subscriptionApi";
import { catchError } from "@/utilities/helpers/functions";
import {
  Box,
  Button,
  CircularProgress,
  Grid2,
  Pagination,
  TablePagination,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import NotFound from "@/components/assets/svg/notFound.png";
import Image from "next/image";
import SubscriptionCard from "./card";
import { AddRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { showNotification } from "@/components/common/notification";

const Subscriptions = () => {
  const [filter, setFilter] = useState("createdAt");
  const [sort, setSort] = useState("lth");
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterCount, setFilterCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState("");

  const getSubscriptions = async () => {
    setLoading(true);
    await getSubscriptionApi(
      pagination.page,
      pagination.rowsPerPage,
      search,
      sort,
      filter
    )
      .then((res) => {
        setSubscriptions(res.data.data);
        setTotalCount(res.data.totalCount);
        setFilterCount(res.data.filterCount);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getSubscriptions();
  }, [pagination, search, sort, filter]);

  const handleDelete = async (id) => {
    setDeleteLoading(id);
    await deleteSubscriptionApi(id)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getSubscriptions();
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setDeleteLoading("");
      });
  };

  const renderNavbar = () => {
    return (
      <div className="flex gap-4 items-center justify-between">
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Subscriptions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => {
            router.push("/admin/subscriptions/create");
          }}
        >
          Create Plan
        </Button>
      </div>
    );
  };

  return (
    <Box>
      <PageLayout navContent={renderNavbar()}>
        <SearchFilter
          placeholder="Search subscriptions"
          label="Sort by"
          options={[
            { label: "Subscription Name", value: "name" },
            { label: "Created at", value: "createdAt" },
            { label: "Last updated", value: "updatedAt" },
          ]}
          value={filter}
          handleChange={(event) => setFilter(event.target.value)}
          getSort={(value) => setSort(value)}
          getSearch={(value) => {
            setTimeout(() => {
              setSearch(value);
            }, 200);
          }}
        />
        <Box>
          {loading ? (
            <Box className="flex justify-center items-center h-[calc(100vh-16.2rem)]">
              <CircularProgress size={24} color="secondary" />
            </Box>
          ) : (
            <Grid2
              container
              spacing={4}
              className="items-start p-4 min-h-[calc(100vh-19.4rem)] max-h-[calc(100vh-19.4rem)] overflow-auto content-baseline"
            >
              {!subscriptions?.length ? (
                <Grid2 item size={{ xs: 12 }}>
                  <Box className="flex flex-col items-center justify-center py-8">
                    <Image
                      src={NotFound}
                      alt="no subscription"
                      width={0}
                      height={0}
                      style={{
                        width: "40%",
                        height: "auto",
                        paddingTop: "4rem",
                      }}
                    />
                    <Typography className="notFound">
                      No Subscriptions found
                    </Typography>
                  </Box>
                </Grid2>
              ) : (
                subscriptions?.map((item, index) => (
                  <Grid2 item size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                    <SubscriptionCard
                      data={item}
                      deleteLoading={deleteLoading === item._id}
                      handleDelete={handleDelete}
                      clickUrl={`/admin/subscriptions/${item._id}`}
                    />
                  </Grid2>
                ))
              )}
            </Grid2>
          )}
          {subscriptions?.length ? (
            <Grid2
              item
              xs={12}
              sx={{
                position: "sticky",
                bottom: "0",
                backgroundColor: "background.default",
                borderRadius: "0.5rem",
              }}
            >
              <TablePagination
                component="div"
                count={totalCount}
                page={pagination.page}
                variant="outlined"
                color="loading"
                onPageChange={(event, newPage) =>
                  setPagination({ ...pagination, page: newPage })
                }
                rowsPerPage={pagination.rowsPerPage}
                onRowsPerPageChange={(event) =>
                  setPagination({
                    page: 0,
                    rowsPerPage: parseInt(event.target.value, 10),
                  })
                }
              />
            </Grid2>
          ) : (
            ""
          )}
        </Box>
      </PageLayout>
    </Box>
  );
};

export default Subscriptions;
