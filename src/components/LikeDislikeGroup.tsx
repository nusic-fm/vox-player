import ThumbUpOffAltOutlinedIcon from "@mui/icons-material/ThumbUpOffAltOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import {
  addDisLikeToUser,
  addLikeToUser,
  removeDislikeToUser,
  removeLikeToUser,
  User,
} from "../services/db/users.service";
import {
  addDisLikesToCover,
  addLikesToCover,
  removeDisLikesToCover,
  removeLikesToCover,
} from "../services/db/coversV1.service";

type Props = {
  coverId: string;
  voiceId: string;
  user: User;
  likesCount: number;
};

const LikeDislikeGroup = ({ coverId, voiceId, user, likesCount }: Props) => {
  const [isLiked, setIsLiked] = useState(
    () => user?.likedVoiceCovers?.includes(coverId + "_" + voiceId) || false
  );
  const [isDisLiked, setIsDisLiked] = useState(
    () => user?.disLikedVoiceCovers?.includes(coverId + "_" + voiceId) || false
  );

  return (
    <Box display={"flex"}>
      <Box display={"flex"} alignItems="center" gap={0.2}>
        <IconButton
          size="small"
          onClick={async () => {
            if (isLiked) {
              setIsLiked(false);
              await removeLikesToCover(coverId, voiceId);
              await removeLikeToUser(user.uid, coverId, voiceId);
            } else {
              setIsLiked(true);
              if (isDisLiked) {
                setIsDisLiked(false);
              }
              await addLikesToCover(coverId, voiceId, isDisLiked);
              await addLikeToUser(user.uid, coverId, voiceId);
            }
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
      <IconButton
        size="small"
        onClick={async () => {
          if (isDisLiked) {
            setIsDisLiked(false);
            await removeDisLikesToCover(coverId, voiceId);
            await removeDislikeToUser(user.uid, coverId, voiceId);
          } else {
            setIsDisLiked(true);
            if (isLiked) {
              setIsLiked(false);
            }
            await addDisLikesToCover(coverId, voiceId, isLiked);
            await addDisLikeToUser(user.uid, coverId, voiceId);
          }
        }}
      >
        {isDisLiked ? (
          <ThumbDownAltIcon fontSize="small" />
        ) : (
          <ThumbDownOffAltOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  );
};

export default LikeDislikeGroup;
