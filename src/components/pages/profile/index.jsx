import CustomInput from "@/components/common/customTextField";
import {
  getUsersApi,
  updateUserApi,
  updateUsernameApi,
} from "@/utilities/api/userApi";
import { catchError, getDate } from "@/utilities/helpers/functions";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  Grid2,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import {
  Key,
  SaveRounded,
  UploadRounded,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import Person4RoundedIcon from "@mui/icons-material/Person4Rounded";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utilities/helpers/cropImage";
import { showNotification } from "@/components/common/notification";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const [editedUserData, setEditedUserData] = useState({});
  const [customLoading, setCustomLoading] = useState({});
  const fileRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [openCropModal, setOpenCropModal] = useState(false);
  const [seePassword, setSeePassword] = useState(false);

  useEffect(() => {
    getUserDetails();
  }, []);

  const getUserDetails = (loading = true) => {
    loading && setLoading(true);
    getUsersApi()
      .then((res) => {
        setUserData(res.data.data);
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      event.target.value = null;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImageSrc(reader.result);
        setOpenCropModal(true);
      };
    }
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    setEditedUserData({ ...editedUserData, profile: croppedImage });
    setOpenCropModal(false);
  };

  const updateUser = async (body, key) => {
    setCustomLoading({ ...customLoading, [key]: true });
    await updateUserApi(body)
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getUserDetails(false);
        setEditedUserData({});
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({ ...customLoading, [key]: false });
      });
  };

  const handleUpdateUsername = async () => {
    setCustomLoading({ ...customLoading, username: true });
    await updateUsernameApi({
      username: editedUserData?.username,
    })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        getUserDetails(false);
        setEditedUserData({});
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setCustomLoading({ ...customLoading, username: false });
      });
  };

  return (
    <div className="h-[inherit]">
      <Dialog open={openCropModal} onClose={() => setOpenCropModal(false)}>
        <Box sx={{ width: 400, height: 400, position: "relative" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </Box>
        <Button onClick={handleCrop}>Crop & Save</Button>
      </Dialog>
      <Box className="h-full">
        <Box
          sx={{
            padding: "0.7rem 1rem",
            backgroundColor: "background.foreground",
            borderBottom: "0.1rem solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h4">Profile Settings</Typography>
        </Box>
        <Box className="w-full p-8 overflow-auto h-[calc(100vh-14rem)]">
          {loading ? (
            <Box className="flex justify-center items-center h-full">
              <CircularProgress color="secondary" size={24} />
            </Box>
          ) : (
            <>
              <Grid2 container spacing={2} className="py-4 items-center">
                <Grid2
                  className="flex flex-col gap-1 items-end"
                  item
                  size={{ xs: 12, md: 5 }}
                >
                  <Typography variant="h6">
                    {userData?.name} ({userData?.username})
                  </Typography>
                  <Typography variant="h7">{userData?.email}</Typography>
                  <Typography variant="h7">Available {userData?.credits?.data || 0} Credits</Typography>
                  <Typography variant="h7">Last Recharge {getDate(userData?.credits?.updatedAt)}</Typography>
                </Grid2>
                <Grid2
                  className="flex items-center justify-center"
                  item
                  size={{ xs: 12, md: 2 }}
                >
                  <Box
                    className="rounded-full relative"
                    sx={(theme) => ({
                      ".image": {
                        filter: "blur(0px)",
                        transition: "all 0.5s",
                      },
                      ".upload": {
                        transform: "translate(-6.9rem, 2.6rem)",
                        zIndex: -1,
                        opacity: 0,
                        transition: "all 0.5s",
                        backgroundColor: "background.default",
                        border: "2px solid",
                        borderColor: "background.defaultSolid",
                      },
                      ":hover": {
                        ".image": {
                          filter: "blur(4px)",
                          padding: "1rem",
                        },
                        ".upload": {
                          opacity: 1,
                          zIndex: 2,
                        },
                      },
                    })}
                  >
                    {userData?.profile && (
                      <Image
                        src={editedUserData?.profile || userData?.profile}
                        alt="profile"
                        width={150}
                        height={150}
                        className="rounded-full image"
                      />
                    )}
                    <input
                      type="file"
                      id="profile"
                      name="profile"
                      hidden
                      ref={fileRef}
                      onChange={handleImageUpload}
                    />
                    <IconButton
                      className="upload absolute flex-col gap-2"
                      onClick={() => fileRef.current.click()}
                    >
                      <UploadRounded color="secondary" />
                      <Typography variant="h7">Upload</Typography>
                    </IconButton>
                  </Box>
                  {editedUserData?.profile && (
                    <Box
                      className="absolute flex-col gap-2"
                      sx={{
                        transform: "translate(10rem, 0rem)",
                      }}
                    >
                      {customLoading?.profile ? (
                        <CircularProgress color="secondary" size={24} />
                      ) : (
                        <IconButton
                          onClick={() =>
                            updateUser(
                              { profile: editedUserData?.profile },
                              "profile"
                            )
                          }
                        >
                          <SaveRounded color="secondary" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                </Grid2>
              </Grid2>
              <Divider className="w-[95%] flex m-auto" />
              <br />

              <Grid2 container spacing={{ xs: 8, md: 4 }} className="px-4">
                <Grid2
                  item
                  size={{ xs: 12, md: 6 }}
                  className="flex flex-col gap-4"
                >
                  <Typography variant="h5" textAlign={"center"}>
                    Edit Profile
                  </Typography>
                  <Grid2 container spacing={2}>
                    <Grid2 item size={{ xs: 12, md: 6 }}>
                      <CustomInput
                        label="Name"
                        value={editedUserData?.name || userData?.name}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onChange={(event) => {
                          setEditedUserData({
                            ...editedUserData,
                            name: event.target.value,
                          });
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeOutlinedIcon color="secondary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              {customLoading?.name ? (
                                <CircularProgress size={16} color="secondary" />
                              ) : (
                                <IconButton
                                  disabled={
                                    !editedUserData?.name ||
                                    editedUserData?.name === userData?.name
                                  }
                                  onClick={() =>
                                    updateUser(
                                      { name: editedUserData?.name },
                                      "name"
                                    )
                                  }
                                >
                                  <SaveRounded color="secondary" />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid2>
                    <Grid2 item size={{ xs: 12, md: 6 }}>
                      <CustomInput
                        label="Username"
                        value={editedUserData?.username || userData?.username}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onChange={(event) => {
                          setEditedUserData({
                            ...editedUserData,
                            username: event.target.value,
                          });
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person4RoundedIcon color="secondary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              {customLoading?.username ? (
                                <CircularProgress size={16} color="secondary" />
                              ) : (
                                <IconButton
                                  disabled={
                                    !editedUserData?.username ||
                                    editedUserData?.username ===
                                      userData?.username
                                  }
                                  onClick={handleUpdateUsername}
                                >
                                  <SaveRounded color="secondary" />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid2>
                  </Grid2>
                </Grid2>

                <Grid2
                  item
                  size={{ xs: 12, md: 6 }}
                  className="flex flex-col gap-4"
                >
                  <Typography variant="h5" textAlign={"center"}>
                    Change Password
                  </Typography>
                  <Box className="flex gap-2 items-center flex-col w-full">
                    <CustomInput
                      label="Current Password"
                      value={editedUserData?.currentPassword}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onChange={(event) => {
                        setEditedUserData({
                          ...editedUserData,
                          currentPassword: event.target.value,
                        });
                      }}
                      type="password"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Key color="secondary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Grid2 container spacing={2} className="w-full">
                      <Grid2 item size={{ xs: 12, md: 6 }}>
                        <CustomInput
                          label="Password"
                          value={editedUserData?.password}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={(event) => {
                            setEditedUserData({
                              ...editedUserData,
                              password: event.target.value,
                            });
                          }}
                          type="password"
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Key color="secondary" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid2>
                      <Grid2 item size={{ xs: 12, md: 6 }}>
                        <CustomInput
                          label="Confirm Password"
                          value={editedUserData?.confirmPassword}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={(event) => {
                            setEditedUserData({
                              ...editedUserData,
                              confirmPassword: event.target.value,
                            });
                          }}
                          type={seePassword ? "text" : "password"}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Key color="secondary" />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                {seePassword ? (
                                  <IconButton
                                    onClick={() => setSeePassword(!seePassword)}
                                  >
                                    <VisibilityOff color="secondary" />
                                  </IconButton>
                                ) : (
                                  <IconButton
                                    onClick={() => setSeePassword(!seePassword)}
                                  >
                                    <Visibility color="secondary" />
                                  </IconButton>
                                )}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid2>
                    </Grid2>
                  </Box>
                  <Button
                    variant="contained"
                    disabled={
                      customLoading?.password ||
                      !editedUserData?.password ||
                      !editedUserData?.confirmPassword ||
                      !editedUserData?.currentPassword
                    }
                    endIcon={
                      customLoading?.password && (
                        <CircularProgress size={16} color="secondary" />
                      )
                    }
                    onClick={() => {
                      if (
                        editedUserData?.password !==
                        editedUserData?.confirmPassword
                      ) {
                        showNotification({
                          content: "Passwords do not match",
                          type: "error",
                        });
                        return;
                      }
                      updateUser(
                        {
                          newPassword: editedUserData?.password,
                          oldPassword: editedUserData?.currentPassword,
                        },
                        "password"
                      );
                    }}
                  >
                    Save
                  </Button>
                </Grid2>
              </Grid2>
            </>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default Profile;
