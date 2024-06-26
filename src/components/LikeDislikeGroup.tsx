import ThumbUpOffAltOutlinedIcon from "@mui/icons-material/ThumbUpOffAltOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { Box, Divider, IconButton, Popover, Typography } from "@mui/material";
import { useState } from "react";
import {
  // addDisLikeToUser,
  // addLikeToUser,
  // removeDislikeToUser,
  // removeLikeToUser,
  User,
} from "../services/db/users.service";
import {
  addDisLikesToCover,
  addLikesToCover,
  removeDisLikesToCover,
  removeLikesToCover,
} from "../services/db/coversV1.service";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import axios from "axios";

type Props = {
  coverId: string;
  voiceId: string;
  user: User;
  likesCount: number;
  disLikesCount: number;
  onRefreshUserObj: (uid: string) => void;
};

const LikeDislikeGroup = ({
  coverId,
  voiceId,
  user,
  likesCount,
  disLikesCount,
  onRefreshUserObj,
}: Props) => {
  const [isLiked, setIsLiked] = useState(
    () => user?.likedVoiceCovers?.includes(coverId + "_" + voiceId) || false
  );
  const [isDisLiked, setIsDisLiked] = useState(
    () => user?.disLikedVoiceCovers?.includes(coverId + "_" + voiceId) || false
  );
  const [copyPopEl, setCopyPopEl] = useState<null | HTMLButtonElement>(null);

  return (
    <Box display={"flex"}>
      <Box display={"flex"} alignItems="center" gap={0.2}>
        <IconButton
          size="small"
          onClick={async () => {
            if (isLiked) {
              setIsLiked(false);
              await removeLikesToCover(user.uid, coverId, voiceId);
              // await removeLikesToCover(coverId, voiceId);
              // await removeLikeToUser(user.uid, coverId, voiceId);
            } else {
              setIsLiked(true);
              if (isDisLiked) {
                setIsDisLiked(false);
              }
              await addLikesToCover(user.uid, coverId, voiceId);
              // await addLikesToCover(coverId, voiceId, isDisLiked);
              // await addLikeToUser(user.uid, coverId, voiceId);
            }
            await Promise.all([
              onRefreshUserObj(user.uid),
              axios.post(
                `${import.meta.env.VITE_VOX_COVER_SERVER}/refresh-ranking`
              ),
            ]);
          }}
        >
          {isLiked ? (
            <ThumbUpAltIcon fontSize="small" />
          ) : (
            <ThumbUpOffAltOutlinedIcon fontSize="small" />
          )}
        </IconButton>
        {!!likesCount && (
          <Typography variant="caption">{likesCount}</Typography>
        )}
      </Box>
      <Divider orientation="vertical" sx={{ mx: 1 }} />
      <Box display={"flex"} alignItems="center" gap={0.2}>
        <IconButton
          size="small"
          onClick={async () => {
            if (isDisLiked) {
              setIsDisLiked(false);
              await removeDisLikesToCover(user.uid, coverId, voiceId);
              // await removeDisLikesToCover(coverId, voiceId);
              // await removeDislikeToUser(user.uid, coverId, voiceId);
            } else {
              setIsDisLiked(true);
              if (isLiked) {
                setIsLiked(false);
              }
              await addDisLikesToCover(user.uid, coverId, voiceId);
              // await addDisLikesToCover(coverId, voiceId, isLiked);
              // await addDisLikeToUser(user.uid, coverId, voiceId);
            }
            await Promise.all([
              onRefreshUserObj(user.uid),
              axios.post(
                `${import.meta.env.VITE_VOX_COVER_SERVER}/refresh-ranking`
              ),
            ]);
          }}
        >
          {isDisLiked ? (
            <ThumbDownAltIcon fontSize="small" />
          ) : (
            <ThumbDownOffAltOutlinedIcon fontSize="small" />
          )}
        </IconButton>
        {!!disLikesCount && (
          <Typography variant="caption">{disLikesCount}</Typography>
        )}
      </Box>
      <Divider orientation="vertical" sx={{ mx: 1 }} />
      <IconButton
        size="small"
        onClick={(e) => {
          const input = `${location.origin}?coverId=${coverId}&voiceId=${voiceId}&uid=${user.uid}`;
          navigator.clipboard.writeText(input);
          setCopyPopEl(e.currentTarget);
          setTimeout(() => setCopyPopEl(null), 500);
        }}
      >
        <ReplyRoundedIcon sx={{ transform: "rotateY(180deg)" }} />
      </IconButton>
      <Popover
        open={!!copyPopEl}
        anchorEl={copyPopEl}
        onClose={() => setCopyPopEl(null)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Typography px={1} variant="caption">
          Copied
        </Typography>
      </Popover>
    </Box>
  );
};

export default LikeDislikeGroup;
