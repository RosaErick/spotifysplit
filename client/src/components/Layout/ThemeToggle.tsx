import { IconButton, Tooltip } from "@radix-ui/themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useAppTheme } from "./AppThemeProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppTheme();
  const isDark = theme === "dark";

  return (
    <Tooltip content={isDark ? "Ativar tema claro" : "Ativar tema escuro"}>
      <IconButton
        type="button"
        variant="soft"
        color="gray"
        highContrast
        className="utility-icon-action clickable-control"
        onClick={toggleTheme}
        aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  );
};
