import React, { useState, useEffect } from 'react';
import EmployeeTable from './components/EmployeeTable/EmployeeTable';
import LocationTable from './components/LocationTable/LocationTable';
import AddEmployee from './components/AddEmployee/AddEmployee';
import AddLocation from './components/AddLocation/AddLocation';
import { EasybaseProvider } from 'easybase-react';
import ebconfig from './ebconfig';
import './App.css';
import AddWorkData from './components/AddWorkData/AddWorkData';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const App = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderTable = () => {
    switch (value) {
      case 0: return <EmployeeTable />
      case 1: return <LocationTable />
      case 2: return (
        <>
          <AddLocation />
          <AddEmployee />
          <AddWorkData />
        </>
      )
      default:
        return <EmployeeTable />
    }
  };

  return (
    <div>
      <EasybaseProvider ebconfig={ebconfig}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Delta Payroll
            </Typography>
            {/* <Button color="inherit">Login</Button> */}
          </Toolbar>
        </AppBar>
        <Tabs value={value} onChange={handleChange} aria-label="disabled tabs example" centered>
          <Tab label="Employees" />
          <Tab label="Locations" />
          <Tab label="Business Ops" />
        </Tabs>
        {renderTable()}
      </EasybaseProvider>
    </div>
  );
}

export default App;
