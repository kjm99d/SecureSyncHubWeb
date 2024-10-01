import React from 'react';
import { Typography, Box } from '@mui/material';

function DashboardPage() {
  console.log('DashboardPage is rendering'); // 로그를 통해 렌더링 여부 확인
  return (
    <Box>
      <Typography variant="h4">Welcome to the Admin Dashboard</Typography>
    </Box>
  );
}

export default DashboardPage;
