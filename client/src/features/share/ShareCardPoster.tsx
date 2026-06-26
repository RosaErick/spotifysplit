// Poster exportavel (capturado via ref). Estilo proprio e fixo — ver
// ShareCardPoster.module.css. Recebe data URLs ja pre-carregadas (same-origin)
// para que a captura nunca toque recurso cross-origin. Serve tanto para top
// artistas quanto para top faixas (lista generica de itens).
import { forwardRef } from "react";
import { ShareFormatConfig } from "./formats";
import { buildPosterTheme } from "./posterThemes";
import styles from "./ShareCardPoster.module.css";

export interface PosterItem {
  id: string;
  name: string;
  /** Linha secundaria opcional (ex.: artistas de uma faixa). */
  subtitle?: string;
  /** data URL ja resolvida (ou undefined para cair nas iniciais). */
  imageDataUrl?: string;
}

export interface ShareCardPosterProps {
  displayName: string;
  avatarDataUrl?: string;
  /** Eyebrow do poster (ex.: "Top artistas" / "Top faixas"). */
  title: string;
  items: PosterItem[];
  periodLabel: string;
  /** Linha do rodape (ex.: "Seus top artistas · dados via Spotify"). */
  tagline: string;
  format: ShareFormatConfig;
  /** Cor de acento (hex) escolhida no picker. */
  accentColor: string;
}

const initialsOf = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Barras ESTATICAS do equalizador. A marca animada do app (EqualizerMark) saia
// cortada no PNG por usar transform/escala; aqui as alturas sao fixas e o icone
// fica inteiro na imagem.
const EqualizerStatic = () => (
  <span className={styles.eqMark} aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
  </span>
);

export const ShareCardPoster = forwardRef<HTMLDivElement, ShareCardPosterProps>(
  (
    {
      displayName,
      avatarDataUrl,
      title,
      items,
      periodLabel,
      tagline,
      format,
      accentColor,
    },
    ref
  ) => {
    const visible = items.slice(0, format.artistCount);
    const formatClass = format.value === "story" ? styles.story : styles.post;
    const themeVars = buildPosterTheme(accentColor);

    return (
      <div
        ref={ref}
        className={`${styles.poster} ${formatClass}`}
        style={themeVars}
        role="img"
        aria-label={`${title} de ${displayName} — ${periodLabel}`}
      >
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.avatar}>
              <div className={styles.avatarInner}>
                {avatarDataUrl ? (
                  <img className={styles.avatarImg} src={avatarDataUrl} alt="" />
                ) : (
                  <span className={styles.avatarInitials}>
                    {initialsOf(displayName)}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.headerText}>
              <span className={styles.eyebrow}>{title}</span>
              <h2 className={styles.name}>{displayName}</h2>
              <span className={styles.badge}>{periodLabel}</span>
            </div>
          </header>

          <ol className={styles.list}>
            {visible.map((item, index) => (
              <li key={item.id} className={styles.row}>
                <span className={styles.rank}>{index + 1}</span>
                <div className={styles.thumb}>
                  {item.imageDataUrl ? (
                    <img
                      className={styles.thumbImg}
                      src={item.imageDataUrl}
                      alt=""
                    />
                  ) : (
                    <span className={styles.thumbInitials}>
                      {initialsOf(item.name)}
                    </span>
                  )}
                </div>
                <div className={styles.rowText}>
                  <span className={styles.itemName}>{item.name}</span>
                  {item.subtitle && (
                    <span className={styles.itemSubtitle}>{item.subtitle}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <footer className={styles.footer}>
            <hr className={styles.divider} />
            <div className={styles.wordmarkRow}>
              <span className={styles.wordmark}>SPOTIFYSPLIT</span>
              <EqualizerStatic />
            </div>
            <span className={styles.tagline}>{tagline}</span>
            <span className={styles.url}>spotifysplit.onrender.com</span>
          </footer>
        </div>
      </div>
    );
  }
);

ShareCardPoster.displayName = "ShareCardPoster";
