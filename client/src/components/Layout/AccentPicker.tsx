import { Flex, IconButton, Popover, Text } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import { ACCENT_OPTIONS, useAppTheme } from "./AppThemeProvider";

// Seletor da cor de acento do tema (troca o amarelo por verde/vermelho em todo
// o app). A escolha persiste no localStorage via AppThemeProvider.
export const AccentPicker = () => {
  const { accent, setAccent } = useAppTheme();
  const current = ACCENT_OPTIONS.find((option) => option.value === accent);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton
          type="button"
          variant="soft"
          color="gray"
          aria-label="Escolher a cor do tema"
        >
          <span
            className="accent-dot"
            style={{ background: current?.swatch }}
            aria-hidden="true"
          />
        </IconButton>
      </Popover.Trigger>

      <Popover.Content size="1" sideOffset={8} align="end">
        <Flex direction="column" gap="2" style={{ minWidth: 160 }}>
          <Text size="1" color="gray" weight="bold" className="section-eyebrow">
            Cor do tema
          </Text>
          <Flex direction="column" gap="1">
            {ACCENT_OPTIONS.map((option) => {
              const isActive = option.value === accent;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`accent-option ${isActive ? "accent-option-active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => setAccent(option.value)}
                >
                  <span
                    className="accent-swatch"
                    style={{ background: option.swatch }}
                    aria-hidden="true"
                  />
                  <span className="accent-option-label">{option.label}</span>
                  {isActive && <CheckIcon className="accent-option-check" />}
                </button>
              );
            })}
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
};
