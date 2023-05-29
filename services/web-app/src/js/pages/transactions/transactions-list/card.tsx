import { Card, Link } from '@mui/material';

type TransactionCardContainerInput = {
  link?: URL;

  children: JSX.Element | JSX.Element[];
};

export default function TransactionCardContainer({
  link,
  children,
}: TransactionCardContainerInput) {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '448px',
        minHeight: '128px',
        float: 'left',
        overflow: 'hidden',
        m: 1,
      }}
      className="rplus-item-card"
    >
      {link ? (
        <Link
          href={link.href}
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex',
            width: '100%',
          }}
        >
          {children}
        </Link>
      ) : (
        children
      )}
    </Card>
  );
}
