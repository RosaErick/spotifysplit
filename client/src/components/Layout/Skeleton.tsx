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

export const ProfileSkeleton = () => (
  <Card className="hero-panel profile-card" mb="2">
    <Flex direction="column" gap="6">
      <Flex
        gap={{ initial: "4", sm: "6" }}
        align={{ initial: "start", sm: "center" }}
        direction={{ initial: "column", sm: "row" }}
      >
        <Skeleton width="104px" height="104px" radius="999px" />
        <Flex direction="column" gap="3" width="100%">
          <Skeleton width="30%" height="0.7rem" />
          <Skeleton width="65%" height="2.4rem" />
          <Skeleton width="35%" height="1.4rem" radius="999px" />
        </Flex>
      </Flex>

      <Skeleton height="1px" />

      <Box className="stat-strip">
        {Array.from({ length: 3 }).map((_, index) => (
          <Box className="stat-cell" key={index}>
            <Skeleton width="60%" height="1.8rem" />
            <Box mt="2">
              <Skeleton width="80%" height="0.7rem" />
            </Box>
          </Box>
        ))}
      </Box>
    </Flex>
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
