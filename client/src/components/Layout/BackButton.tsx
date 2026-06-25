import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      type="button"
      variant="soft"
      color="gray"
      className="clickable-control"
      onClick={() => navigate(-1)}
    >
      <ArrowLeftIcon />
      Voltar
    </Button>
  );
};
