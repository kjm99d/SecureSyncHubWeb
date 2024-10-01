import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [roles, setRoles] = useState(['user', 'admin']); // 사용자 역할 목록
  const [userRole, setUserRole] = useState(''); // 선택된 사용자의 역할
  const [loginCooldownHour, setLoginCooldownHour] = useState(0); // 로그인 제한 시간
  const [point, setPoint] = useState(0); // 사용자 포인트
  const [lastLoginAt, setLastLoginAt] = useState(''); // 마지막 로그인 시간
  const [newPolicy, setNewPolicy] = useState(''); // 새로운 정책 추가 시 선택된 정책

  const [open, setOpen] = useState(false);

  // 사용자 목록 가져오기 및 첫 번째 사용자 자동 선택
  useEffect(() => {
    async function fetchUsers() {
      try {
        const userResponse = await fetch('/api/admin/users');
        const usersData = await userResponse.json();
        setUsers(usersData.users);

        if (usersData.users.length > 0) {
          // 첫 번째 사용자 자동 선택
          handleUserSelection(usersData.users[0]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  // 특정 사용자의 정책 목록 가져오기
  const fetchPolicies = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/policies`);
      const data = await response.json();
      setPolicies(data.policies);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  // 사용자 선택 시 정보 설정 (조회된 Role 값을 화면에 반영)
  const handleUserSelection = (user) => {
    setSelectedUser(user.id);
    setUserRole(user.role); // 조회된 역할을 상태에 반영
    setLoginCooldownHour(user.loginCooldownHour);
    setPoint(user.point);
    setLastLoginAt(user.lastLoginAt || '');
    fetchPolicies(user.id); // 정책 가져오기
  };

  // 사용자 정보 업데이트
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
          point,
          lastLoginAt,
        }),
      });

      if (response.ok) {
        alert(`User information updated successfully for user: ${userId}`);
      } else {
        const errorData = await response.json();
        console.error('Error updating user:', errorData.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // 새로운 정책 추가
  const handleAddPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policyName: newPolicy }), // 정책 추가 데이터
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies([...policies, data.policy]);
        setOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Error adding policy:', errorData.message);
      }
    } catch (error) {
      console.error('Error adding policy:', error);
    }
  };

  // 정책 삭제 처리
  const handleDeletePolicy = async (policyId) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/policies/${policyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPolicies(policies.filter(policy => policy.id !== policyId));
      } else {
        const errorData = await response.json();
        console.error('Error deleting policy:', errorData.message);
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
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
                    value={userRole} // 조회된 Role을 화면에 표시
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
                    value={loginCooldownHour}
                    onChange={(e) => setLoginCooldownHour(e.target.value)}
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={lastLoginAt}
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
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.name}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeletePolicy(policy.id)}>
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      {/* 정책 추가 다이얼로그 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Policy</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Policy Name"
            type="text"
            fullWidth
            value={newPolicy}
            onChange={(e) => setNewPolicy(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPolicy} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ManageUsersPage;
