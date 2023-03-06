import {
  Alert,
  CircularProgress,
  Grid,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import Thumbnail from '../components/thumbnail';
import ThumbnailType from '../enums/thumbnailType';
import { getLimitedInventory } from '../services/inventoryService';
import OwnedLimitedAsset from '../types/ownedLimitedAsset';
import { getCatalogLink } from '../utils/linkify';

type InventoryInput = {
  userId: number;
};

type SortedLimited = {
  // The asset ID of the limited item.
  id: number;

  // The name of the limited item.
  name: string;

  // The link to the limited item details page.
  link: URL;

  // The array containing owned serial numbers for this item.
  serialNumbers: number[];

  // The recent average price for the limited item.
  recentAveragePrice: number;
};

export default ({ userId }: InventoryInput) => {
  const [loading, setLoading] = useState<boolean>();
  const [error, setError] = useState<boolean>(false);
  const [limitedInventory, setLimitedInventory] = useState<OwnedLimitedAsset[]>(
    []
  );

  const sortedLimiteds = useMemo(() => {
    const limitedsById: { [assetId: number]: SortedLimited } = {};
    const limiteds: SortedLimited[] = [];

    limitedInventory.forEach((limited) => {
      if (!limitedsById.hasOwnProperty(limited.id)) {
        limiteds.push(
          (limitedsById[limited.id] = {
            id: limited.id,
            name: limited.name,
            link: getCatalogLink(limited.id, limited.name),
            serialNumbers: [],
            recentAveragePrice: limited.recentAveragePrice,
          })
        );
      }

      limitedsById[limited.id].serialNumbers.push(limited.serialNumber);
    });

    return limiteds.sort((a, b) => {
      return a.recentAveragePrice < b.recentAveragePrice ? 1 : -1;
    });
  }, [limitedInventory]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setLimitedInventory([]);

    getLimitedInventory(userId)
      .then((i) => {
        if (cancelled) {
          return;
        }

        setLimitedInventory(i);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error('Failed to load limited inventory', userId, err);
        setLoading(false);
        setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <CircularProgress size={96} />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ width: '100%' }}>
        Failed to load limited inventory.
        <br />
        The inventory may be private.
      </Alert>
    );
  }

  return (
    <Grid
      className="roblox-plus-limiteds-grid"
      container
      alignItems="center"
      justifyContent="space-around"
      rowGap={1}
    >
      {sortedLimiteds.map((limited) => {
        const getLimitedIconText = () => {
          if (limited.serialNumbers.length > 1) {
            return ` x${limited.serialNumbers.length.toLocaleString()}`;
          }

          if (limited.serialNumbers.length === 1 && limited.serialNumbers[0]) {
            return ` #${limited.serialNumbers[0].toLocaleString()}`;
          }

          return '';
        };

        return (
          <Grid
            item
            key={limited.link.href}
            className="roblox-plus-limited-item-card"
          >
            <Link
              href={limited.link.href}
              target="_blank"
              underline="none"
              color="inherit"
            >
              <Paper sx={{ position: 'relative' }}>
                <Thumbnail targetId={limited.id} type={ThumbnailType.Asset} />
                <Typography
                  className="roblox-plus-limited-indicator"
                  variant="caption"
                >
                  <span className="roblox-plus-limited-icon"></span>
                  {getLimitedIconText()}
                </Typography>
              </Paper>
              <Typography
                textOverflow="ellipsis"
                noWrap
                variant="inherit"
                title={limited.name}
              >
                {limited.name}
              </Typography>
              <Typography
                textAlign="left"
                variant="inherit"
                textOverflow="ellipsis"
                title={
                  limited.recentAveragePrice
                    ? limited.recentAveragePrice.toLocaleString()
                    : 'N/A'
                }
                noWrap
              >
                <span className="roblox-plus-robux-icon"></span>{' '}
                <b>
                  {limited.recentAveragePrice
                    ? limited.recentAveragePrice.toLocaleString()
                    : 'N/A'}
                </b>
              </Typography>
            </Link>
          </Grid>
        );
      })}
    </Grid>
  );
};
