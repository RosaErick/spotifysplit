import { Box, Card, Flex, Grid } from "@radix-ui/themes";

type SkeletonProps = {
  width?: string;
  height?: string;
  radius?: string;
};

export const Skeleton = ({ width = "100%", height = "1rem", radius }: SkeletonProps) => (
  <span
    className="skeleton"
    style={{ display: "block", width, height, borderRadius: radius }}
  />
);

// Card de midia (artista/faixa/album) em carregamento.
const MediaCardSkeleton = () => (
  <Card>
    <Box className="media-tile" mb="3">
      <span className="skeleton" style={{ display: "block", height: "100%" }} />
    </Box>
    <Flex direction="column" gap="2">
      <Skeleton width="80%" height="0.9rem" />
      <Skeleton width="55%" height="0.75rem" />
    </Flex>
  </Card>
);

type GridSkeletonProps = {
  count?: number;
  columns?: Record<string, string>;
};

export const CardGridSkeleton = ({
  count = 4,
  columns = { initial: "2", sm: "3", lg: "4" },
}: GridSkeletonProps) => (
  <Grid columns={columns} gap="4">
    {Array.from({ length: count }).map((_, index) => (
      <MediaCardSkeleton key={index} />
    ))}
  </Grid>
);

// Espelha o layout do card de perfil: cabecalho com acao, identidade e faixa
// de numeros.
export const ProfileSkeleton = () => (
  <Card className="hero-panel profile-card" mb="2">
    <Box className="profile-layout">
      <Box className="profile-topline">
        <Skeleton width="7rem" height="0.6rem" />
        <Box className="profile-action">
          <Skeleton radius="999px" />
        </Box>
      </Box>

      <Box className="profile-identity">
        <Box className="avatar-ring">
          <Skeleton width="64px" height="64px" radius="999px" />
        </Box>

        <Box style={{ flex: "1 1 auto", minWidth: 0 }}>
          <Skeleton width="min(15rem, 62%)" height="1.65rem" />
        </Box>
      </Box>

      <Box className="stat-strip">
        {Array.from({ length: 3 }).map((_, index) => (
          <Box className="stat-cell" key={index}>
            <Skeleton width="60%" height="1rem" />
            <Box mt="2">
              <Skeleton width="78%" height="0.62rem" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  </Card>
);

export const RowSkeleton = ({ count = 6 }: { count?: number }) => (
  <Flex gap="4" style={{ overflow: "hidden" }} pb="3">
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} width={{ initial: "220px", sm: "240px" }} flexShrink="0">
        <MediaCardSkeleton />
      </Box>
    ))}
  </Flex>
);
