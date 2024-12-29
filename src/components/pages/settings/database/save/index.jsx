import CustomInput from "@/components/common/customTextField";
import GestureRoundedIcon from "@mui/icons-material/GestureRounded";
import { catchError } from "@/utilities/helpers/functions";
import { saveDBStringApi } from "@/utilities/api/databaseApi";
import { useState } from "react";
import { Button, CircularProgress, InputAdornment } from "@mui/material";
import { showNotification } from "@/components/common/notification";
import { decrypt, encrypt } from "@/utilities/helpers/encryption";

const SaveDatabase = ({ fetchData = () => {} }) => {
  const [dbString, setDbString] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const encrypted = encrypt(dbString);
    const decrypted = decrypt(encrypted);
    console.log({dbString, decrypted, encrypted});
    await saveDBStringApi({ dbString: encrypted, saveExternal: true, saveInternal: true })
      .then((res) => {
        showNotification({
          content: res.data.message,
        });
        setDbString("");
      })
      .catch((err) => {
        catchError(err);
      })
      .finally(() => {
        setLoading(false);
        fetchData();
      });
  };  

  return (
    <form
      className="flex flex-col gap-4 items-center"
      onSubmit={(event) => {
        event.preventDefault();
        const formElements = event.currentTarget.elements;
        const dbString = formElements.dbString.value;
        // setDbString(dbString);
        handleSave();
      }}
    >
      <CustomInput
        formLabel={"Enter your MongoDB String"}
        required
        name="dbString"
        placeholder="MongoDB String"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <GestureRoundedIcon color="secondary" />
              </InputAdornment>
            ),
          },
        }}
        onChange={(event) => {
          setDbString(event.target.value);
        }}
        onPaste={(event) => {
          setDbString(event.target.value);
        }}
      />
      <Button
        type="submit"
        variant="contained"
        color="loading"
        disabled={loading}
        endIcon={loading && <CircularProgress color="loading" size={24} />}
      >
        Save
      </Button>
    </form>
  );
};

export default SaveDatabase;
