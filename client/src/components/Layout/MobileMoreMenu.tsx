import {
  CheckIcon,
  DotsHorizontalIcon,
  ExitIcon,
  GitHubLogoIcon,
  InfoCircledIcon,
  MoonIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { Popover, Text } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ACCENT_OPTIONS, useAppTheme } from "./AppThemeProvider";
import { GITHUB_URL } from "./GitHubNavButton";

const THEME_OPTIONS = [
  { value: "light", label: "Claro", Icon: SunIcon },
  { value: "dark", label: "Escuro", Icon: MoonIcon },
] as const;

// Acoes de baixa frequencia da barra inferior: aparencia, links e sair.
//
// O seletor de acento aparece inline aqui, e nao como o Popover do
// `AccentPicker`: no mobile, abrir um popover dentro de outro custa um toque a
// mais e o clique-fora fecha os dois.
export const MobileMoreMenu = ({ onLogout }: { onLogout: () => void }) => {
  const { theme, toggleTheme, accent, setAccent } = useAppTheme();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <button
          type="button"
          className="mobile-tab mobile-tab-more"
          aria-label="Mais opções"
        >
          <span className="mobile-tab-mark" aria-hidden="true" />
          <DotsHorizontalIcon className="mobile-tab-icon" />
          <span className="mobile-tab-label">Mais</span>
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="top"
        align="end"
        sideOffset={10}
        className="mobile-more-panel"
      >
        <Text as="p" size="1" color="gray" weight="bold" className="section-eyebrow">
          Aparência
        </Text>

        <div className="mobile-more-segment" role="group" aria-label="Tema">
          {THEME_OPTIONS.map(({ value, label, Icon }) => {
            const isActive = value === theme;

            return (
              <button
                key={value}
                type="button"
                className={`mobile-more-segment-option ${
                  isActive ? "mobile-more-segment-option-active" : ""
                }`}
                aria-pressed={isActive}
                onClick={() => {
                  if (!isActive) toggleTheme();
                }}
              >
                <Icon />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="mobile-more-accents" role="group" aria-label="Cor do tema">
          {ACCENT_OPTIONS.map((option) => {
            const isActive = option.value === accent;

            return (
              <button
                key={option.value}
                type="button"
                className={`mobile-more-accent ${
                  isActive ? "mobile-more-accent-active" : ""
                }`}
                aria-pressed={isActive}
                aria-label={option.label}
                onClick={() => setAccent(option.value)}
              >
                <span
                  className="mobile-more-accent-swatch"
                  style={{ background: option.swatch }}
                  aria-hidden="true"
                />
                {isActive && <CheckIcon className="mobile-more-accent-check" />}
              </button>
            );
          })}
        </div>

        <hr className="mobile-more-divider" />

        <Link to="/sobre" className="mobile-more-item" onClick={close}>
          <InfoCircledIcon />
          <span>Sobre o projeto</span>
        </Link>

        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="mobile-more-item"
          onClick={close}
        >
          <GitHubLogoIcon />
          <span>GitHub</span>
        </a>

        <button
          type="button"
          className="mobile-more-item mobile-more-item-danger"
          onClick={() => {
            close();
            onLogout();
          }}
        >
          <ExitIcon />
          <span>Sair</span>
        </button>
      </Popover.Content>
    </Popover.Root>
  );
};
