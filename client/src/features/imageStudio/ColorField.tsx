// Seletor da cor das imagens exportadas. A mesma cor vale para o poster e para
// a legenda do mosaico — o estudio tem uma cor so, escolhida uma vez.

import { HexColorInput, HexColorPicker } from "react-colorful";
import { Flex, Text } from "@radix-ui/themes";
import { StudioField } from "./StudioLayout";
import { studioColorPresets } from "./studioTheme";

interface ColorFieldProps {
  value: string;
  onChange: (hex: string) => void;
}

export const ColorField = ({ value, onChange }: ColorFieldProps) => (
  <StudioField label="Cor">
    <Flex direction="column" gap="3" className="studio-color-field">
      <div className="studio-colorpicker">
        <HexColorPicker color={value} onChange={onChange} />
      </div>

      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Flex gap="2" align="center" wrap="wrap">
          {studioColorPresets.map((preset) => {
            const isActive = preset.value.toLowerCase() === value.toLowerCase();
            return (
              <button
                key={preset.value}
                type="button"
                className={`studio-color-preset${
                  isActive ? " studio-color-preset-active" : ""
                }`}
                style={{ background: preset.value }}
                aria-label={preset.label}
                aria-pressed={isActive}
                onClick={() => onChange(preset.value)}
              />
            );
          })}
        </Flex>

        <Flex align="center" gap="2" className="studio-hex-field">
          <Text size="1" color="gray">
            Hex
          </Text>
          <HexColorInput
            color={value}
            onChange={onChange}
            prefixed
            className="studio-hex-input"
            aria-label="Código hexadecimal da cor"
          />
        </Flex>
      </Flex>
    </Flex>
  </StudioField>
);
