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
  const [newPolicyValue, setNewPolicyValue] = useState('');
  const [open, setOpen] = useState(false);

  // 역할 정의
  const roles = ['user', 'admin']; // 이 부분 추가

   // 날짜를 'YYYY-MM-DDTHH:MM' 형식으로 변환하는 함수
   const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTimeLocalEx = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const userResponse = await fetch('/api/admin/users');
        const usersData = await userResponse.json();
        setUsers(usersData.users);

        if (usersData.users.length > 0) {
          handleUserSelection(usersData.users[0].id);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch('/api/admin/policy');
        const data = await response.json();
        setPolicies(data.policies);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    }

    fetchPolicies();
  }, []);

  const fetchUserPolicies = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/policies`);
      const data = await response.json();
      setUserPolicies(data.userPolicies);
    } catch (error) {
      console.error('Error fetching user policies:', error);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUser(userId);
    fetchUserPolicies(userId);
  };

  const handleUserChange = (userId, key, value) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, [key]: value } : user
      )
    );
  };

  const handleUserUpdate = async (userId) => {
    const user = users.find((u) => u.id === userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: user.role,
          loginCooldownHour: user.loginCooldownHour,
          accountExpiry: user.accountExpiry,
          point: user.point,
          lastLoginAt: user.lastLoginAt,
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

  const handleAddUserPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policyId: newPolicyId,
          policyValue: newPolicyValue,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserPolicies([...userPolicies, data.policy]);
        setOpen(false);
        setNewPolicyId('');
        setNewPolicyValue('');
      } else {
        const errorData = await response.json();
        console.error('Error adding user policy:', errorData.message);
      }
    } catch (error) {
      console.error('Error adding user policy:', error);
    }
  };

  const handleDeleteUserPolicy = async (policyId) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/policies/${policyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUserPolicies(userPolicies.filter((policy) => policy.id !== policyId));
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
              <TableRow key={user.id} onClick={() => handleUserSelection(user.id)}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => handleUserChange(user.id, 'role', e.target.value)}
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
                    value={user.point}
                    onChange={(e) => handleUserChange(user.id, 'point', e.target.value)}
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={formatDateTimeLocal(user.accountExpiry)} // 날짜 형식 변환
                    onChange={(e) => handleUserChange(user.id, 'accountExpiry', e.target.value)}
                    type="date"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={user.loginCooldownHour}
                    onChange={(e) => handleUserChange(user.id, 'loginCooldownHour', e.target.value)}
                    type="number"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={formatDateTimeLocal(user.lastLoginAt)} // 날짜 형식 변환
                    onChange={(e) => handleUserChange(user.id, 'lastLoginAt', e.target.value)}
                    type="date"
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
                  <TableCell>Policy Value</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.Policy.policyName}</TableCell>
                    <TableCell>{policy.policyValue}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteUserPolicy(policy.id)}>
                        <RemoveIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="center">
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
          <Select fullWidth value={newPolicyId} onChange={(e) => setNewPolicyId(e.target.value)}>
            {policies.map((policy) => (
              <MenuItem key={policy.id} value={policy.id}>
                {policy.policyName}
              </MenuItem>
            ))}
          </Select>
          <TextField
            margin="dense"
            label="Policy Value"
            type="text"
            fullWidth
            value={newPolicyValue}
            onChange={(e) => setNewPolicyValue(e.target.value)}
            style={{ marginTop: '20px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddUserPolicy} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ManageUsersPage;
