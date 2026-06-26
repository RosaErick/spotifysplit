import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";

const GITHUB_URL = "https://github.com/RosaErick/spotifysplit";

export const GitHubNavButton = () => (
  <Tooltip content="GitHub do projeto">
    <IconButton
      asChild
      variant="ghost"
      color="gray"
      highContrast
      className="github-nav-action utility-icon-action clickable-control"
    >
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="GitHub do projeto"
      >
        <GitHubLogoIcon />
      </a>
    </IconButton>
  </Tooltip>
);
