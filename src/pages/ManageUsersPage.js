import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPolicies, setUserPolicies] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [newPolicyId, setNewPolicyId] = useState('');
  const [roles, setRoles] = useState(['user', 'admin']);
  const [userRole, setUserRole] = useState('');
  const [loginCooldownHour, setLoginCooldownHour] = useState(0);
  const [point, setPoint] = useState(0);
  const [lastLoginAt, setLastLoginAt] = useState('');
  const [accountExpiry, setAccountExpiry] = useState('');
  const [open, setOpen] = useState(false);

  // 사용자 목록 가져오기 및 첫 번째 사용자 자동 선택
  useEffect(() => {
    async function fetchUsers() {
      try {
        const userResponse = await fetch('/api/admin/users');
        const usersData = await userResponse.json();
        setUsers(usersData.users);

        if (usersData.users.length > 0) {
          handleUserSelection(usersData.users[0]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  // 정책 목록 가져오기 (드롭다운용)
  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch('/api/admin/policy');
        const data = await response.json();
        setPolicies(data.policies); // 정책 목록 설정
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    }

    fetchPolicies();
  }, []);

  // 특정 사용자의 정책 목록 가져오기
  const fetchUserPolicies = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/policies`);
      const data = await response.json();
      setUserPolicies(data.policies);
    } catch (error) {
      console.error('Error fetching user policies:', error);
    }
  };

// 사용자 선택 시 정보 설정
const handleUserSelection = (user) => {
  if (selectedUser !== user.id) { // 이미 선택된 사용자인지 확인하여 덮어쓰지 않음
    setSelectedUser(user.id);
    setUserRole(user.role);
    setLoginCooldownHour(user.loginCooldownHour);
    setPoint(user.point);
    setLastLoginAt(user.lastLoginAt ? new Date(user.lastLoginAt).toISOString().substring(0, 16) : ''); // 날짜 형식 유지
    setAccountExpiry(user.accountExpiry ? new Date(user.accountExpiry).toISOString().substring(0, 16) : ''); // 날짜 형식 유지
    fetchUserPolicies(user.id);
  }
};

// 사용자 정보 업데이트 후 상태 동기화
const handleUserUpdate = async (userId) => {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: userRole,
        loginCooldownHour,
        accountExpiry,
        point,
        lastLoginAt,
      }),
    });

    if (response.ok) {
      alert('User information updated successfully.');
    } else {
      const errorData = await response.json();
      console.error('Error updating user information:', errorData.message);
    }
  } catch (error) {
    console.error('Error updating user information:', error);
  }
};

  // 새로운 사용자 정책 추가
  const handleAddUserPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policyId: newPolicyId }), // 선택된 정책 ID 전송
      });

      if (response.ok) {
        const data = await response.json();
        setUserPolicies([...userPolicies, data.policy]); // 추가된 정책을 사용자 정책 목록에 추가
        setOpen(false);
        setNewPolicyId(''); // 정책 선택 초기화
      } else {
        const errorData = await response.json();
        console.error('Error adding user policy:', errorData.message);
      }
    } catch (error) {
      console.error('Error adding user policy:', error);
    }
  };

  // 정책 삭제 처리
  const handleDeleteUserPolicy = async (policyId) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/policies/${policyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUserPolicies(userPolicies.filter(policy => policy.id !== policyId));
      } else {
        const errorData = await response.json();
        console.error('Error deleting user policy:', errorData.message);
      }
    } catch (error) {
      console.error('Error deleting user policy:', error);
    }
  };

  return (
    <div>
      <h1>Manage Users</h1>

      {/* 사용자 목록 테이블 */}
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Point</TableCell>
              <TableCell>Expiry Date</TableCell>
              <TableCell>Login Cooldown Hour</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} onClick={() => handleUserSelection(user)}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField
                    value={point}
                    onChange={(e) => setPoint(e.target.value)}
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={accountExpiry ? accountExpiry.substring(0, 16) : ''}
                    onChange={(e) => setAccountExpiry(e.target.value)}
                    type="datetime-local"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={loginCooldownHour}
                    onChange={(e) => setLoginCooldownHour(e.target.value)}
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={lastLoginAt ? lastLoginAt.substring(0, 16) : ''}
                    onChange={(e) => setLastLoginAt(e.target.value)}
                    type="datetime-local"
                  />
                </TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleUserUpdate(user.id)}>
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 사용자 정책 목록 */}
      {selectedUser && (
        <div>
          <h2>User Policies</h2>
          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Policy Name</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.name}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteUserPolicy(policy.id)}>
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <IconButton color="primary" onClick={() => setOpen(true)}>
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* 정책 추가 다이얼로그 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New User Policy</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={newPolicyId}
            onChange={(e) => setNewPolicyId(e.target.value)}
          >
            {policies.map((policy) => (
              <MenuItem key={policy.id} value={policy.id}>
                {policy.policyName}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUserPolicy} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ManageUsersPage;
