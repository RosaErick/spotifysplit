// Seletor visual do tamanho da grade (N x N).
//
// A grade desenhada e so o affordance de mouse/toque: passar o cursor na celula
// (linha, coluna) pre-visualiza a grade max(linha, coluna). Para acessibilidade o
// container e um `slider` unico — um so ponto de foco, operavel por setas — em
// vez de dezenas de botoes que representariam o mesmo valor.

import { KeyboardEvent, useState } from "react";
import { Text } from "@radix-ui/themes";
import { MAX_GRID_SIZE, MIN_GRID_SIZE } from "./collageOptions";
import styles from "./CollageSizePicker.module.css";

interface CollageSizePickerProps {
  value: number;
  /** Maior grade que os itens disponiveis preenchem por inteiro. */
  max: number;
  disabled?: boolean;
  onChange: (size: number) => void;
}

const rows = Array.from({ length: MAX_GRID_SIZE }, (_, index) => index + 1);

const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
};

/** A celula (linha, coluna) representa a grade que a conteria por inteiro. */
const sizeAtCell = (row: number, column: number) =>
  Math.max(row, column, MIN_GRID_SIZE);

export const CollageSizePicker = ({
  value,
  max,
  disabled = false,
  onChange,
}: CollageSizePickerProps) => {
  const [preview, setPreview] = useState<number | null>(null);
  const highlighted = preview ?? value;

  const change = (size: number) =>
    onChange(Math.min(Math.max(size, MIN_GRID_SIZE), max));

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEPS[event.key];

    if (step) {
      event.preventDefault();
      change(value + step);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      change(MIN_GRID_SIZE);
    } else if (event.key === "End") {
      event.preventDefault();
      change(max);
    }
  };

  return (
    <div className={`${styles.field}${disabled ? ` ${styles.disabled}` : ""}`}>
      <div className={styles.readout}>
        <Text as="span" size="1" weight="bold" color="gray">
          Grade
        </Text>
        <span className={styles.value}>
          {highlighted} × {highlighted}
        </span>
        <Text as="span" size="1" color="gray">
          · {highlighted * highlighted} capas
        </Text>
      </div>

      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${MAX_GRID_SIZE}, auto)` }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label="Tamanho da grade"
        aria-valuemin={MIN_GRID_SIZE}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value} por ${value}`}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setPreview(null)}
        onBlur={() => setPreview(null)}
      >
        {rows.map((row) =>
          rows.map((column) => {
            const size = sizeAtCell(row, column);
            const available = size <= max;
            const isOn = available && size <= highlighted;

            const state = !available
              ? styles.cellUnavailable
              : isOn
                ? preview !== null
                  ? styles.cellPreview
                  : styles.cellSelected
                : "";

            return (
              <span
                key={`${row}-${column}`}
                className={`${styles.cell} ${state}`}
                onMouseEnter={() => available && setPreview(size)}
                onClick={() => available && change(size)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
