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
  const [newPolicyValue, setNewPolicyValue] = useState(''); // 새 정책의 Value 입력받기
  const [roles, setRoles] = useState(['user', 'admin']);
  const [userRole, setUserRole] = useState('');
  const [loginCooldownHour, setLoginCooldownHour] = useState(0);
  const [point, setPoint] = useState(0);
  const [lastLoginAt, setLastLoginAt] = useState('');
  const [accountExpiry, setAccountExpiry] = useState('');
  const [open, setOpen] = useState(false);

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

  const handleUserSelection = (user) => {
    if (selectedUser !== user.id) {
      setSelectedUser(user.id);
      setUserRole(user.role);
      setLoginCooldownHour(user.loginCooldownHour);
      setPoint(user.point);
      setLastLoginAt(user.lastLoginAt ? new Date(user.lastLoginAt).toISOString().substring(0, 16) : '');
      setAccountExpiry(user.accountExpiry ? new Date(user.accountExpiry).toISOString().substring(0, 16) : '');
      fetchUserPolicies(user.id);
    }
  };

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

  const handleAddUserPolicy = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policyId: newPolicyId,
          policyValue: newPolicyValue, // 추가된 Value 전송
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserPolicies([...userPolicies, data.policy]);
        setOpen(false);
        setNewPolicyId('');
        setNewPolicyValue(''); // 입력 필드 초기화
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
              <TableRow key={user.id} onClick={() => handleUserSelection(user)}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                    {roles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <TextField value={point} onChange={(e) => setPoint(e.target.value)} type="number" />
                </TableCell>
                <TableCell>
                  <TextField value={accountExpiry} onChange={(e) => setAccountExpiry(e.target.value)} type="datetime-local" />
                </TableCell>
                <TableCell>
                  <TextField value={loginCooldownHour} onChange={(e) => setLoginCooldownHour(e.target.value)} type="number" />
                </TableCell>
                <TableCell>
                  <TextField value={lastLoginAt} onChange={(e) => setLastLoginAt(e.target.value)} type="datetime-local" />
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
                  <TableCell>Policy Value</TableCell> {/* Policy Value 추가 */}
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.Policy.policyName}</TableCell>
                    <TableCell>{policy.policyValue}</TableCell> {/* Policy Value 출력 */}
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
            onChange={(e) => setNewPolicyValue(e.target.value)} // Policy Value 입력받기
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
