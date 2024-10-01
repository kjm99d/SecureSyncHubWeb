import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, IconButton, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';  // 아이콘 추가

function ManageFilesPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [files, setFiles] = useState([]);  // 파일 목록 상태 추가
  const [open, setOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    downloadType: '',
    downloadFilePath: '',
    priority: 0,
    userId: '',
    fileId: '',  // 파일 ID도 포함
  });

  const [newFile, setNewFile] = useState(null); // 파일 업로드 상태 추가

  // 사용자 목록 및 파일 목록 가져오기
  useEffect(() => {
    async function fetchData() {
      try {
        // 사용자 목록 가져오기
        const userResponse = await fetch('/api/admin/users');
        const usersData = await userResponse.json();
        setUsers(usersData.users);

        // 파일 목록 가져오기
        const fileResponse = await fetch('/api/admin/files');
        const fileData = await fileResponse.json();
        setFiles(fileData.files);  // 파일 목록 설정

        // 초기 사용자 선택
        if (usersData.users.length > 0) {
          setSelectedUser(usersData.users[0].id);
          fetchPolicies(usersData.users[0].id);
        }
      } catch (error) {
        console.error('Error fetching users or files:', error);
      }
    }

    fetchData();
  }, []);

  // 특정 사용자의 파일 정책 가져오기
  const fetchPolicies = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/policies`);
      const data = await response.json();
      setPolicies(data.filePolicies);
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  // 새로운 정책 추가
  const handleAddPolicy = () => {
    setNewPolicy({ ...newPolicy, userId: selectedUser });
    setOpen(true);
  };

  // 정책 저장
  const handleSavePolicy = async () => {
    const { userId, fileId, downloadType, downloadFilePath, priority } = newPolicy;
    try {
      const response = await fetch(`/api/admin/users/${userId}/files/${fileId}/policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          downloadType,
          downloadFilePath,
          priority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
        return;
      }

      const data = await response.json();
      setPolicies([...policies, data.filePolicy]);  // 새로운 정책 추가
      setOpen(false);
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  // 파일 정책 삭제 처리
  const handleDeletePolicy = async (fileId) => {

    const confirmDelete = window.confirm('정말 삭제하시겠습니까?');  // 삭제 확인 메시지

    if (!confirmDelete) {
      // 사용자가 취소를 선택하면 삭제 중단
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/files/${fileId}/policy`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData.message);
        return;
      }

      // 정책 삭제 후 목록에서 제거
      setPolicies(policies.filter(policy => policy.fileId !== fileId));
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  // 파일 업로드 처리
  const handleFileChange = (event) => {
    setNewFile(event.target.files[0]); // 선택된 파일을 상태에 저장
  };

  const handleUploadFile = async () => {
    if (!newFile) return;

    const formData = new FormData();
    formData.append('file', newFile);  // 선택된 파일을 FormData로 전송

    try {
      const response = await fetch('/api/admin/files', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      // 업로드 후 파일 목록 갱신
      setFiles([...files, data.file]);
      setNewFile(null);  // 업로드 후 파일 상태 초기화
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h1>Manage Files and Policies</h1>

      {/* 사용자 선택 드롭다운 */}
      <Select
        value={selectedUser}
        onChange={(e) => {
          setSelectedUser(e.target.value);
          fetchPolicies(e.target.value);
        }}
        fullWidth
      >
        {users.map((user) => (
          <MenuItem key={user.id} value={user.id}>
            {user.username}
          </MenuItem>
        ))}
      </Select>

      {/* 파일 업로드 입력 필드 */}
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <input type="file" onChange={handleFileChange} />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUploadFile}
          disabled={!newFile}
          style={{ marginLeft: '10px' }}
        >
          Upload File
        </Button>
      </div>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>FileName</TableCell>
              <TableCell>Download Type</TableCell>
              <TableCell>Download File Path</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell align="right">Action</TableCell> {/* 액션 컬럼 추가 */}
            </TableRow>
          </TableHead>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.File.fileName || 'N/A'}</TableCell>
                <TableCell>{policy.downloadType}</TableCell>
                <TableCell>{policy.downloadFilePath || 'N/A'}</TableCell>
                <TableCell>{policy.priority}</TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleDeletePolicy(policy.fileId)}>
                    <RemoveIcon />
                  </IconButton>
                </TableCell> {/* 삭제 버튼 추가 */}
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={5} align="center">
                <IconButton color="primary" onClick={handleAddPolicy}>
                  <AddIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* 정책 추가 다이얼로그 */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New FilePolicy</DialogTitle>
        <DialogContent>
          {/* 파일 선택 드롭다운 */}
          <Select
            value={newPolicy.fileId}
            onChange={(e) => setNewPolicy({ ...newPolicy, fileId: e.target.value })}
            fullWidth
          >
            {files.map((file) => (
              <MenuItem key={file.id} value={file.id}>
                {file.fileName}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={newPolicy.downloadType}
            onChange={(e) => setNewPolicy({ ...newPolicy, downloadType: e.target.value })}
            fullWidth
            style={{ marginTop: '20px' }}
          >
            <MenuItem value="file">File Download</MenuItem>
            <MenuItem value="memory">Memory Download</MenuItem>
          </Select>
          <TextField
            margin="dense"
            label="Download File Path"
            type="text"
            fullWidth
            value={newPolicy.downloadFilePath}
            onChange={(e) => setNewPolicy({ ...newPolicy, downloadFilePath: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Priority"
            type="number"
            fullWidth
            value={newPolicy.priority}
            onChange={(e) => setNewPolicy({ ...newPolicy, priority: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePolicy} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ManageFilesPage;
