import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, CssBaseline } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Route, Routes, Link, useLocation } from 'react-router-dom'; // useLocation import 추가

import DashboardPage from './DashboardPage';
import ManageUsersPage from './ManageUsersPage';
import ManageFilesPage from './ManageFilesPage';
import SettingsPage from './SettingsPage';
import LogoutPage from './LogoutPage';
import ManagePoliciesPage from './ManagePoliciesPage';

const drawerWidth = 240;

function AdminConsolePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentLocation = useLocation(); // 현재 경로를 확인하기 위한 훅

  // 현재 URL을 로그로 출력
  console.log('Current URL:', currentLocation.pathname);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        <ListItem button component={Link} to="/admin/console/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/admin/console/manage-policy">
          <ListItemText primary="Manage User Policy" />
        </ListItem>
        <ListItem button component={Link} to="/admin/console/manage-users">
          <ListItemText primary="Manage Users" />
        </ListItem>
        <ListItem button component={Link} to="/admin/console/manage-files">
          <ListItemText primary="Manage Files" />
        </ListItem>
        <ListItem button component={Link} to="/admin/console/settings">
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button component={Link} to="/admin/console/logout">
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Console
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* 모바일용 임시 Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        {/* 데스크탑용 고정 Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        
        
        {/* 각 페이지에 따른 라우팅 설정 */}
        <Routes>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="manage-policy" element={<ManagePoliciesPage />} />
          <Route path="manage-users" element={<ManageUsersPage />} />
          <Route path="manage-files" element={<ManageFilesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="logout" element={<LogoutPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default AdminConsolePage;
