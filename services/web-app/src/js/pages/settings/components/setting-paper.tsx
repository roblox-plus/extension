import { Paper } from '@mui/material';

type SettingPaperInput = {
  children: JSX.Element | JSX.Element[];
};

export default function SettingPaper({ children }: SettingPaperInput) {
  return <Paper sx={{ p: 1, minWidth: 600, mt: 1 }}>{children}</Paper>;
}
