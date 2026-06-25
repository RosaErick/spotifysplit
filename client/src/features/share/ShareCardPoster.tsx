// Poster exportavel (capturado via ref). Estilo proprio e fixo — ver
// ShareCardPoster.module.css. Recebe data URLs ja pre-carregadas (same-origin)
// para que a captura nunca toque recurso cross-origin.
import { forwardRef } from "react";
import { EqualizerMark } from "../../components/Layout/EqualizerMark";
import { ShareFormatConfig } from "./formats";
import { getShareAccentTheme, ShareAccent } from "./posterThemes";
import styles from "./ShareCardPoster.module.css";

export interface PosterArtist {
  id: string;
  name: string;
  /** data URL ja resolvida (ou undefined para cair nas iniciais). */
  imageDataUrl?: string;
}

export interface ShareCardPosterProps {
  displayName: string;
  avatarDataUrl?: string;
  artists: PosterArtist[];
  periodLabel: string;
  format: ShareFormatConfig;
  accent: ShareAccent;
}

const initialsOf = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const ShareCardPoster = forwardRef<HTMLDivElement, ShareCardPosterProps>(
  ({ displayName, avatarDataUrl, artists, periodLabel, format, accent }, ref) => {
    const visible = artists.slice(0, format.artistCount);
    const formatClass =
      format.value === "story" ? styles.story : styles.post;
    const theme = getShareAccentTheme(accent);

    return (
      <div
        ref={ref}
        className={`${styles.poster} ${formatClass}`}
        style={theme.vars}
        role="img"
        aria-label={`Top artistas de ${displayName} — ${periodLabel}`}
      >
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.avatar}>
              <div className={styles.avatarInner}>
                {avatarDataUrl ? (
                  <img
                    className={styles.avatarImg}
                    src={avatarDataUrl}
                    alt=""
                  />
                ) : (
                  <span className={styles.avatarInitials}>
                    {initialsOf(displayName)}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.headerText}>
              <span className={styles.eyebrow}>Top artistas</span>
              <h2 className={styles.name}>{displayName}</h2>
              <span className={styles.badge}>{periodLabel}</span>
            </div>
          </header>

          <ol className={styles.list}>
            {visible.map((artist, index) => (
              <li key={artist.id} className={styles.row}>
                <span className={styles.rank}>{index + 1}</span>
                <div className={styles.thumb}>
                  {artist.imageDataUrl ? (
                    <img
                      className={styles.thumbImg}
                      src={artist.imageDataUrl}
                      alt=""
                    />
                  ) : (
                    <span className={styles.thumbInitials}>
                      {initialsOf(artist.name)}
                    </span>
                  )}
                </div>
                <span className={styles.artistName}>{artist.name}</span>
              </li>
            ))}
          </ol>

          <footer className={styles.footer}>
            <hr className={styles.divider} />
            <div className={styles.wordmarkRow}>
              <span className={styles.wordmark}>SPOTIFYSPLIT</span>
              <span className={styles.eqWrap}>
                <span className={styles.eqScale}>
                  <EqualizerMark />
                </span>
              </span>
            </div>
            <span className={styles.tagline}>
              Seus top artistas · dados via Spotify
            </span>
          </footer>
        </div>
      </div>
    );
  }
);

ShareCardPoster.displayName = "ShareCardPoster";
