// Mosaico exportavel (capturado via ref). Componente puro de apresentacao: nao
// busca dados nem resolve imagens — recebe os ladrilhos prontos.
//
// Toda a escala vem de `width`, entao a mesma arvore serve para o preview fluido
// da tela e para a captura em 1080px (o que voce ve e o que sai no PNG).

import { CSSProperties, forwardRef } from "react";
import {
  APP_BRAND,
  APP_DOMAIN_SUFFIX,
} from "../../../shared/constants/app";
import { buildStudioTheme } from "../studioTheme";
import styles from "./CollageBoard.module.css";

export interface CollageTile {
  id: string;
  title: string;
  subtitle?: string;
  /** data URL same-origin (ver `shared/image/remoteImages`). */
  imageSrc?: string;
}

export interface CollageBoardProps {
  tiles: CollageTile[];
  gridSize: number;
  /** Largura do node em px: a medida do preview ou EXPORT_WIDTH na captura. */
  width: number;
  showLabels: boolean;
  showCaption: boolean;
  /** Ex.: "Top artistas · Últimos 6 meses". */
  eyebrow: string;
  displayName: string;
  /** Cor de acento (hex) escolhida no estudio; tematiza a legenda. */
  accentColor: string;
}

const initialsOf = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const EqualizerStatic = () => (
  <span className={styles.eqMark} aria-hidden="true">
    <span />
    <span />
    <span />
    <span />
  </span>
);

export const CollageBoard = forwardRef<HTMLDivElement, CollageBoardProps>(
  (
    {
      tiles,
      gridSize,
      width,
      showLabels,
      showCaption,
      eyebrow,
      displayName,
      accentColor,
    },
    ref
  ) => {
    // Sempre desenhamos a grade inteira: celulas sem item viram vazios discretos
    // em vez de quebrar o quadrado.
    const cells = Array.from(
      { length: gridSize * gridSize },
      (_, index) => tiles[index]
    );

    // A partir de 5 x 5 a celula fica pequena demais: manter a linha secundaria
    // so empilharia texto ilegivel sobre a capa.
    const showSubtitles = gridSize <= 4;

    const style = {
      ...buildStudioTheme(accentColor).vars,
      "--collage-width": `${width}px`,
      "--collage-cols": gridSize,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        className={styles.board}
        style={style}
        role="img"
        aria-label={`${eyebrow} de ${displayName}, mosaico ${gridSize} por ${gridSize}`}
      >
        <div className={styles.grid}>
          {cells.map((tile, index) => (
            <div
              key={tile?.id ?? `empty-${index}`}
              className={`${styles.tile}${tile ? "" : ` ${styles.tileEmpty}`}`}
            >
              {tile?.imageSrc ? (
                <img className={styles.tileImg} src={tile.imageSrc} alt="" />
              ) : tile ? (
                <span className={styles.tileFallback}>
                  {initialsOf(tile.title)}
                </span>
              ) : null}

              {showLabels && tile && (
                <div className={styles.label}>
                  <span className={styles.labelTitle}>{tile.title}</span>
                  {tile.subtitle && showSubtitles && (
                    <span className={styles.labelSubtitle}>{tile.subtitle}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showCaption && (
          <footer className={styles.caption}>
            <div className={styles.captionText}>
              <span className={styles.eyebrow}>{eyebrow}</span>
              <h3 className={styles.name}>{displayName}</h3>
            </div>

            {/* Marca em Fraunces + sufixo do dominio em mono: le como a URL
                inteira, com o nome em destaque, num bloco pequeno. */}
            <div className={styles.brand}>
              <EqualizerStatic />
              <span className={styles.wordmark}>
                {APP_BRAND}
                <span className={styles.wordmarkSuffix}>
                  {APP_DOMAIN_SUFFIX}
                </span>
              </span>
            </div>
          </footer>
        )}
      </div>
    );
  }
);

CollageBoard.displayName = "CollageBoard";
