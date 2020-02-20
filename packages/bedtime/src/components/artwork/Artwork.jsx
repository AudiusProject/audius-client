import cn from "classnames";
import { h } from "preact";
import { useState } from "preact/hooks";
import { getAudiusURL } from "../../util/shareUtil";
import PlayButton, { PlayingState } from "../playbutton/PlayButton";

import styles from "./Artwork.module.css";

// interface ArtworkProps {
//   onClickURL: string
//   artworkURL: string
//   className?: string
//   displayHoverPlayButton?: boolean
//   onAfterPause?: () => void
//   onTogglePlay?: () => void
//   playingState?: PlayingState
//   iconColor?: string
// }

const Artwork = ({
  onClickURL,
  artworkURL,
  className,
  displayHoverPlayButton = false,
  onAfterPause = () => {},
  onTogglePlay = () => {},
  playingState = PlayingState.Playing,
  iconColor = "#ffffff"
}: ArtworkProps) => {
  const onClick = () => {
    window.open(`${getAudiusURL()}/${onClickURL}`, "_blank");
  };

  const [isHovering, setIsHovering] = useState(false);

  const onClickWrapper = () => {
    onTogglePlay();
    if (playingState === PlayingState.Playing) {
      onAfterPause();
    }
  };
  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {displayHoverPlayButton && (
        <div className={styles.playButtonWrapper} onClick={onClickWrapper}>
          <PlayButton
            className={styles.playButton}
            onAfterPause={onAfterPause}
            onTogglePlay={onTogglePlay}
            playingState={playingState}
            iconColor={iconColor}
          />
        </div>
      )}
      <div
        onClick={onClick}
        className={cn(styles.albumArt, className)}
        style={{ backgroundImage: `url(${artworkURL})` }}
      />
    </div>
  );
};

export default Artwork;
