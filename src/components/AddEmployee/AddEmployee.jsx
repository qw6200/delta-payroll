import React, { useState } from 'react';
import { useEasybase } from 'easybase-react';
import Button from '@mui/material/Button';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const AddEmployee = () => {
  const { db } = useEasybase();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(null);
  const [pay, setPay] = useState(null);

  const handleAddEmployee = async (location) => {
    await db('EMPLOYEES').insert({
      name: name,
      pay: pay,
      employeeId: Math.floor(Math.random() * 3000),
    }).one();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handlePayChange = (event) => {
    setPay(event.target.value);
  };
  return (
    <div>
      <Button variant="contained" startIcon={<AddLocationIcon />} onClick={handleOpen}>
        Add Employee
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add name of employee and his/her pay per day
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={name}
            onChange={handleNameChange}
            id="name"
            label="Employee Name"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            value={pay}
            onChange={handlePayChange}
            id="pay"
            label="Pay ($)"
            type="number"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddEmployee}>Add</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default AddEmployee;
