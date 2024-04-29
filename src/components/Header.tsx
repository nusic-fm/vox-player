import {
  Box,
  Chip,
  Avatar,
  Button,
  // Popper,
  Popover,
  Typography,
  Stack,
  Skeleton,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { User } from "../services/db/users.service";
import { useState } from "react";
import {
  deleteRevoxQueue,
  getOnGoingProgress,
  // RevoxProcessType,
  RevoxProcessTypeDoc,
} from "../services/db/revoxQueue.service";
import UserSelection from "./UserSelection";
import { getCoverCreatorAvatar } from "../helpers";
// import axios from "axios";
import { LoadingButton } from "@mui/lab";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

type Props = {
  user?: User;
  onUserChange: (uid: string) => void;
  tempUserId?: string;
  onRevoxRetry: (p: RevoxProcessTypeDoc) => Promise<void>;
};

const baseUrl = "https://discord.com/api/oauth2/authorize";
const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
const redirectUri = import.meta.env.VITE_REDIRECT_URL as string;
const responseType = "token";
const scope = "identify+email";

const Header = ({ user, onUserChange, tempUserId, onRevoxRetry }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingRevoxes, setPendingRevoxes] = useState<RevoxProcessTypeDoc[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIdLoading, setPendingIdLoading] = useState("");
  const [deleteIdLoading, setDeleteIdLoading] = useState("");

  const fetchPendingRevoxes = async (uid: string) => {
    setIsLoading(true);
    const docs = await getOnGoingProgress(uid);
    setPendingRevoxes(docs);
    setIsLoading(false);
  };

  return (
    <Box
      my={2}
      display="flex"
      justifyContent={"center"}
      alignItems="center"
      gap={2}
    >
      {user ? (
        <Chip
          avatar={<Avatar src={getCoverCreatorAvatar(user.uid, user.avatar)} />}
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={async (e) => {
            setAnchorEl(e.currentTarget.parentElement);
            await fetchPendingRevoxes(user.uid);
          }}
          label={user.name}
        />
      ) : (
        <Button
          size="small"
          variant="contained"
          // onClick={onSignInWithFb}
          href={`${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`}
          startIcon={<img src="/discord.png" alt="" width={"22px"} />}
        >
          Sign in
        </Button>
      )}
      {"826040837275910154" === tempUserId && (
        <UserSelection onUserChange={onUserChange} />
      )}
      <Popover
        sx={{ mt: 1 }}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack gap={1} p={2}>
          {isLoading ? (
            <Skeleton variant="rectangular" width={160} animation="wave" />
          ) : !pendingRevoxes.length ? (
            <Typography>No Pending Revoxes</Typography>
          ) : (
            pendingRevoxes.map((p) => (
              <Box display={"flex"} gap={1.5} alignItems="center">
                {p.status === "Failed" && (
                  <LoadingButton
                    size="small"
                    variant="contained"
                    loading={p.id === pendingIdLoading}
                    onClick={async () => {
                      setPendingIdLoading(p.id);
                      await onRevoxRetry(p);
                      setPendingIdLoading("");
                    }}
                  >
                    Retry
                  </LoadingButton>
                )}
                <Typography>
                  {p.title} - {p.voiceModelName}
                </Typography>
                <Chip
                  size="small"
                  label={p.status || "Processing"}
                  color={p.status === "Failed" ? "error" : "default"}
                />
                {user?.uid && (
                  <IconButton
                    size="small"
                    disabled={deleteIdLoading === p.id}
                    onClick={async () => {
                      setDeleteIdLoading(p.id);
                      await deleteRevoxQueue(p.id);
                      await fetchPendingRevoxes(user.uid);
                      setDeleteIdLoading("");
                    }}
                  >
                    {deleteIdLoading === p.id ? (
                      <CircularProgress size={14} color="secondary" />
                    ) : (
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                )}
              </Box>
            ))
          )}
          {/* <Button variant="contained" onClick={() => }>Logout</Button> */}
        </Stack>
      </Popover>
    </Box>
  );
};

export default Header;