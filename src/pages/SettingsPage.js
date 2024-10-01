import React from 'react';
import { Typography, Box } from '@mui/material';

function SettingsPage() {
  return (
    <Box sx={{ p: 2, backgroundColor: '#fff' }}> {/* 배경색 추가 */}
      <Typography variant="h4" color="textPrimary"> {/* 텍스트 색을 명시적으로 설정 */}
        Settings Page
      </Typography>
    </Box>
  );
}

export default SettingsPage;
