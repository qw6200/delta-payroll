import React, { useState } from 'react';
import { useEasybase } from 'easybase-react';
import Button from '@mui/material/Button';
import AddLocationIcon from '@mui/icons-material/AddLocation';
// import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const AddLocation = () => {
  const { db } = useEasybase();
  const [open, setOpen] = useState(false);
  const [locationName, setLocationName] = useState('');

  const handleAddLocation = async (location) => {
    await db('WORKLOCATIONS').insert({
      'locationName': locationName,
    }).one();
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleChange = (event) => {
    setLocationName(event.target.value);
  };

  return (
    <div>
      <Button variant="contained" startIcon={<AddLocationIcon />} onClick={handleOpen}>
        Add Work Location
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Work Location</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add the name of the work location. For example, "387 Shaler Blvd".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            value={locationName}
            onChange={handleChange}
            id="location-name"
            label="Location Name"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddLocation}>Add</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
export default AddLocation;
