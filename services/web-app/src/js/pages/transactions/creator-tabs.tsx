import { Fragment } from 'react';
import { Avatar, Tab, Tabs } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { transactionsPath } from '../../constants';
import useCreators from './hooks/useCreators';
import useSelectedCreator from './hooks/useSelectedCreator';

export default function CreatorTabs() {
  const navigate = useNavigate();
  const creators = useCreators();
  const [selectedCreator, creatorIndex] = useSelectedCreator();
  const [searchParams] = useSearchParams();

  if (!selectedCreator.id) {
    return <Fragment />;
  }

  return (
    <Tabs
      orientation="vertical"
      value={creatorIndex}
      sx={{ minWidth: '256px' }}
      onChange={(_, i) => {
        const search = searchParams ? '?' + searchParams : '';
        if (i > 0 && creators[i]) {
          navigate(`${transactionsPath}/${creators[i].id}${search}`);
        } else {
          navigate(transactionsPath + search);
        }
      }}
    >
      {creators.map((creator, i) => {
        return (
          <Tab
            key={`${creator.type}_${creator.id}`}
            tabIndex={i}
            label={creator.name}
            sx={{
              flexDirection: 'row',
              justifyContent: 'left',
              textAlign: 'left',
              textTransform: 'none',
              borderRight: 1,
            }}
            icon={
              <Avatar
                alt={creator.name}
                src={creator.thumbnail}
                sx={{
                  marginRight: 2,
                  marginTop: 'auto',
                  marginBottom: 'auto',
                }}
                variant="rounded"
              >
                {creator.name.trim().charAt(0)}
              </Avatar>
            }
          />
        );
      })}
    </Tabs>
  );
}
