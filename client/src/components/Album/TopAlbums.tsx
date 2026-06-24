import { Box, Grid } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTopAlbums } from "../../provider/spotfy";
import { LoadingState } from "../Layout/LoadingState";
import { Section } from "../Layout/Section";
import { AlbumCard } from "./AlbumCard";

const TopAlbums = () => {
  const [albums, setAlbums] = useState<any[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTopAlbums().then((response) => setAlbums(response || []));
  }, []);

  return (
    <Section title="Albuns para investigar" eyebrow="Descoberta">
      {!albums ? (
        <LoadingState label="Carregando albuns" />
      ) : (
        <Grid columns={{ initial: "1", xs: "2", sm: "3", lg: "5" }} gap="4">
          {albums.map((album, index) => (
            <Box
              key={`${album.id}-${index}`}
              onClick={() => navigate(`/albums/${album.id}`)}
            >
              <AlbumCard album={album} />
            </Box>
          ))}
        </Grid>
      )}
    </Section>
  );
};

export default TopAlbums;
