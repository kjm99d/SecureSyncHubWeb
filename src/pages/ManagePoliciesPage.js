import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function ManagePoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [newPolicy, setNewPolicy] = useState({ policyName: '', description: '' }); // 새로운 정책 추가 시 입력될 값
  const [open, setOpen] = useState(false); // 다이얼로그 상태

  // 정책 목록 가져오기
  useEffect(() => {
    async function fetchPolicies() {
      try {
        const response = await fetch('/api/admin/policy', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'), // JWT 토큰을 Authorization 헤더에 추가
          },
        });
        const data = await response.json();
        setPolicies(data.policies);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    }

    fetchPolicies();
  }, []);

  // 새로운 정책 추가
  const handleAddPolicy = async () => {
    try {
      const response = await fetch('/api/admin/policy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'), // JWT 토큰을 Authorization 헤더에 추가
        },
        body: JSON.stringify(newPolicy), // 새로운 정책 데이터 전송
      });

      if (response.ok) {
        const data = await response.json();
        setPolicies([...policies, data.policy]); // 추가된 정책 목록에 추가
        setOpen(false); // 다이얼로그 닫기
        setNewPolicy({ policyName: '', description: '' }); // 입력 초기화
      } else {
        const errorData = await response.json();
        console.error('Error adding policy:', errorData.message);
      }
    } catch (error) {
      console.error('Error adding policy:', error);
    }
  };

  // 정책 삭제 처리 (선택적으로 구현 가능)
  const handleDeletePolicy = async (policyId) => {
    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/policy/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'), // JWT 토큰을 Authorization 헤더에 추가
        },
      });

      if (response.ok) {
        setPolicies(policies.filter(policy => policy.id !== policyId)); // 삭제된 정책을 목록에서 제거
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
      <h1>Manage Policies</h1>

      {/* 정책 목록 테이블 */}
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Policy Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.policyName}</TableCell>
                <TableCell>{policy.description || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleDeletePolicy(policy.id)}>
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

      {/* 정책 추가 다이얼로그 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Policy</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Policy Name"
            type="text"
            fullWidth
            value={newPolicy.policyName}
            onChange={(e) => setNewPolicy({ ...newPolicy, policyName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            value={newPolicy.description}
            onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
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

export default ManagePoliciesPage;
