/* eslint-disable array-callback-return */
import React, { useEffect, useState } from 'react';
import { useEasybase } from 'easybase-react';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import Autocomplete from '@mui/material/Autocomplete';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import './AddWorkData.css';

const AddWorkData = () => {
  const { db } = useEasybase();
  const [inputFields, setInputFields] = useState([
    { id: Math.floor(Math.random() * 3000), locationName: '', employeeName: '', numOfDaysWorked: null, dateWorked: null },
  ]);
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getEmployeeList = async () => {
      const employeeResponse = await db("EMPLOYEES").return("name").all();
      employeeResponse.map(emp => {
        setEmployees(prevArray => [...prevArray, emp.name])
      });
    };
    const getLocationsList = async () => {
      const locationResponse = await db("WORKLOCATIONS").return("locationName").all();
      locationResponse.map(location => {
        setLocations(prevArray => [...prevArray, location.locationname])
      });
    };
    setEmployees([]);
    setLocations([]);
    getEmployeeList();
    getLocationsList();
  }, [db, open]);

  const getEmployeeID = async (name) => {
    const employeeResponse = await db("EMPLOYEES").return("employeeId").where({ name: name}).one();
    return employeeResponse.employeeid;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    inputFields.map(async field => {
      await db('LOCATIONS').insert({
        locationName: field.locationName,
        employeeId: await getEmployeeID(field.employeeName),
        numDaysWorked: field.numOfDaysWorked,
        dateWorked: field.dateWorked,
      }).one();
    });
  };

  const handleChangeInput = (id, event) => {
    const newInputFields = inputFields.map(i => {
      if(id === i.id) {
        i[event.target.name] = event.target.value
      }
      return i;
    })
    setInputFields(newInputFields);
  }

  const handleEmployeeChangeInput = (id, event) => {
    const newInputFields = inputFields.map(i => {
      if(id === i.id) {
        i['employeeName'] = event.target.textContent
      }
      return i;
    })
    setInputFields(newInputFields);
  }

  const handleLocationChangeInput = (id, event) => {
    const newInputFields = inputFields.map(i => {
      if(id === i.id) {
        i['locationName'] = event.target.textContent
      }
      return i;
    })
    setInputFields(newInputFields);
  }

  const handleAddFields = () => {
    setInputFields([...inputFields, { id: Math.floor(Math.random() * 3000), locationName: '', employeeName: '', numOfDaysWorked: null, dateWorked: null }])
  }

  const handleRemoveFields = id => {
    const values  = [...inputFields];
    values.splice(values.findIndex(value => value.id === id), 1);
    setInputFields(values);
  }
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Container className="work-data-container">
      <Button variant="contained" startIcon={<AddLocationIcon />} onClick={handleOpen}>
        Add Work Details
      </Button>
        <Dialog className="work-data-dialog" fullWidth maxWidth={'lg'} open={open} onClose={handleClose}>
        <DialogTitle>Add Work Details</DialogTitle>
        <DialogContent className="dialog-content">
      <form onSubmit={handleSubmit}>
        { inputFields.map(inputField => (
          <div className="inline-forms" key={inputField.id}>
            <Autocomplete
              disablePortal
              id="locations-autocomplete"
              options={locations}
              sx={{ width: 300 }}
              onInputChange={event => handleLocationChangeInput(inputField.id, event)}
              renderInput={(params) => <TextField {...params} label="Locations" />}
            />
            <TextField
              id="date-textfield"
              InputLabelProps={{ shrink: true }}
              classes="date-field"
              name="dateWorked"
              label="Date Worked"
              type="date"
              value={inputField.dateWorked}
              onChange={event => handleChangeInput(inputField.id, event)}
            />
            <Autocomplete
              disablePortal
              id="employees-autocomplete"
              options={employees}
              sx={{ width: 300 }}
              onInputChange={event => handleEmployeeChangeInput(inputField.id, event)}
              renderInput={(params) => <TextField {...params} label="Employee" />}
            />
            <TextField
              name="numOfDaysWorked"
              label="# of Days Worked"
              value={inputField.numOfDaysWorked}
              onChange={event => handleChangeInput(inputField.id, event)}
            />
            <IconButton disabled={inputFields.length === 1} onClick={() => handleRemoveFields(inputField.id)}>
              <RemoveIcon />
            </IconButton>
            <IconButton
              onClick={handleAddFields}
            >
              <AddIcon />
            </IconButton>
          </div>
        )) }
      </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit}>Submit</Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AddWorkData;
