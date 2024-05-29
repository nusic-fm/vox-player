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
  Badge,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { User } from "../services/db/users.service";
import { useEffect, useState } from "react";
import {
  deleteRevoxQueue,
  getOnGoingProgress,
  // RevoxProcessType,
  RevoxProcessTypeDoc,
} from "../services/db/revoxQueue.service";
import UserSelection from "./UserSelection";
import { getUserAvatar } from "../helpers";
// import axios from "axios";
import { LoadingButton } from "@mui/lab";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import DisplaySettingsRoundedIcon from "@mui/icons-material/DisplaySettingsRounded";
import { useNavigate } from "react-router-dom";
import { remoteConfig } from "../services/firebase.service";
import { getValue } from "firebase/remote-config";

type Props = {
  user?: User;
  onUserChange: (uid: string) => void;
  tempUserId?: string;
  onRevoxRetry: (p: RevoxProcessTypeDoc) => Promise<void>;
  refreshHeader: boolean;
};

const baseUrl = "https://discord.com/api/oauth2/authorize";
const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
const redirectUri = encodeURIComponent(window.location.origin);
const responseType = "token";
const scope = "identify+email";

const Header = ({
  user,
  onUserChange,
  tempUserId,
  onRevoxRetry,
  refreshHeader,
}: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingRevoxes, setPendingRevoxes] = useState<RevoxProcessTypeDoc[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIdLoading, setPendingIdLoading] = useState("");
  const [deleteIdLoading, setDeleteIdLoading] = useState("");
  const navigate = useNavigate();

  const fetchPendingRevoxes = async (uid: string) => {
    setIsLoading(true);
    const docs = await getOnGoingProgress(uid);
    setPendingRevoxes(docs);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchPendingRevoxes(user.uid);
    }
  }, [user, refreshHeader]);

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
          avatar={<Avatar src={getUserAvatar(user.uid, user.avatar)} />}
          deleteIcon={
            <Badge badgeContent={pendingRevoxes.length} color="warning">
              <ArrowDropDownIcon />
            </Badge>
          }
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
      {tempUserId &&
        ["826040837275910154", "362272367063597056"].includes(tempUserId) && (
          <UserSelection
            onUserChange={onUserChange}
            source={
              tempUserId === "826040837275910154"
                ? [
                    "3Cx4l7iMeFMKx2ywnaqS samUrI",
                    "ugKfRzQqn6yUFitpPapN Pammy",
                    "ENxvDxiBSsUy6TaupP3g AstralVisions",
                    "JEIOJky1oU90XsMFnvAw Emkatters",
                    "ZUKKbz0etLsdkGB2BUTM paradroid68",
                    "yA7gbZ85WIGPalUn3BjJ Gr8Fairee",
                    "OFBeiFrt6AvMNmbMScmz readi-playa",
                    "826040837275910154 adamnusic",
                  ]
                : [
                    "dYCM8E7Wfz3JjyyRA17V j_voorhees",
                    "I5ZljIvkolMOHOiJiYJ6 Cyber Monkey",
                    "CAbXJvrMXAeV5r8kfbHA AI Audio Lab",
                    "geEf5ZwcHOJNKZHR86Pv frank_costello",
                    "Z3IG8LHJK2S03L7BcZiD aimafia77",
                    "ve0Yg5v3jNLrxq6Ez3Zp peterpunk12",
                    "Mak3wXEn3OzrleoRx4hO the_bugg88",
                    "rTU6Pbn3eEGhYjV4zgev SilencioGPT",
                    "fVbXnhQHPfK5Zy7n4a3b OrchidQueen",
                    "DkcrmVEysfjfKAKeB6Fq mystic_muse",
                    "SY2TaHyAsP9idwz2DT0P Pixelpirate",
                    "ByLVcEfXyjxEEpDAbV2e QuantumQuokka3745",
                    "EKhmphjMGrfnICB3w99A NovaKnight",
                    "362272367063597056 alesalis",
                  ]
            }
          />
        )}
      {tempUserId &&
        [
          "826040837275910154",
          "362272367063597056",
          "879400465861869638",
        ].includes(tempUserId) && (
          <IconButton onClick={() => navigate("/admin")}>
            <DisplaySettingsRoundedIcon />
          </IconButton>
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
