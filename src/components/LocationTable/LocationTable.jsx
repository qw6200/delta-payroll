/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { isAfter } from 'date-fns'
import { useEasybase } from 'easybase-react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CircularProgress from '@mui/material/CircularProgress';
import './LocationTable.css';

const Row = props => {
  const [open, setOpen] = useState(false);
  const { row } = props;

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.locationName}
        </TableCell>
        <TableCell align="right">{row.totalDaysWorkedOnLocation}</TableCell>
        <TableCell align="right">${row.totalEmployeePayout}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Location Work History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Location</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Date Worked</TableCell>
                    <TableCell>Pay Per Day</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.length > 0 ? row.history.map((historyRow, key) => (
                    <TableRow>
                      <TableCell>{row.locationName}</TableCell>
                      <TableCell>{historyRow.name}</TableCell>
                      <TableCell>{historyRow.dateWorked}</TableCell>
                      <TableCell>${historyRow.pay}</TableCell>
                    </TableRow>
                  )) : 'None'}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const LocationTable = () => {
  const { db } = useEasybase();
  const [employeesList, setEmployeesList] = useState([]);
  const [payDetailsList, setPayDetailsList] = useState(new Map());
  const [employeeWorkDataList, setEmployeeWorkDataList] = useState([]);
  const [rowList, setRowList] = useState([]);
  const [numOfEmp, setNumOfEmp] = useState(null);
  const [locationsList, setLocationsList] = useState([]);

  const getLocationsList = async () => {
    const locationResponse = await db("WORKLOCATIONS").return("locationName").all();
    locationResponse.map(location => {
      setLocationsList(prevArray => [...prevArray, location.locationname])
    });
  };

  const getPayDetails = async () => {
    const locationPayData = await db("LOCATIONS").return("employeeid", "numDaysWorked").all();
    const dateFilteredLocationData = locationPayData.filter(data => isAfter(new Date(data.dateworked), new Date('2021-10-10')));
    dateFilteredLocationData.map(emp => {
      if (payDetailsList.get(emp.employeeid)) {
        const initialDaysWorked = payDetailsList.get(emp.employeeid);
        setPayDetailsList(payDetailsList.set(emp.employeeid, initialDaysWorked + emp.numdaysworked));
      } else {
        if (emp.numdaysworked > 0) {
          setPayDetailsList(payDetailsList.set(emp.employeeid, emp.numdaysworked));
        } else {
          setPayDetailsList(payDetailsList.set(emp.employeeid, 0));
        }
      }
    });
  };

  const getEmployeeWorkData = async () => {
    const employeeWorkData = await db("LOCATIONS").return("locationname", "employeeid", "dateworked", "numDaysWorked").all();
    const dateFilteredLocationData = employeeWorkData.filter(data => isAfter(new Date(data.dateworked), new Date('2021-10-10')));
    dateFilteredLocationData.map(emp => {
      const data = {
        locationName: emp.locationname,
        employeeId: emp.employeeid,
        numDaysWorked: emp.numDaysWorked,
        dateWorked: new Date(emp.dateworked).toLocaleDateString("en-US"),
      };
      setEmployeeWorkDataList(prevArray => [...prevArray, data]);
    });
  };

  const getEmployeesList = async () => {
    const employeeResponse = await db("EMPLOYEES").return().all();
    employeeResponse.map(emp => {
      let totalDays;
      if (payDetailsList.get(emp.employeeid)) {
        totalDays = payDetailsList.get(emp.employeeid);
      } else {
        totalDays = 0;
      }
      const totalPay = totalDays * emp.pay;
      const employeeData = {
        employeeId: emp.employeeid,
        name: emp.name,
        pay: emp.pay,
        totalDaysWorked: totalDays,
        totalPay: totalPay,
      };
      setEmployeesList(prevArray => [...prevArray, employeeData]);
    });
  };

  const getLocationTotalPayout = location => {
    let total = 0;
    const locationList = employeeWorkDataList.filter(data => data.locationName === location);
    locationList.map(data => {
      const payPerDay = employeesList.find(emp => emp.employeeId === data.employeeId).pay;
      total += payPerDay;
    });
    return total;
  };

  const getRowList = async () => {
    locationsList.map(location => {
      const totalDays = employeeWorkDataList.filter(data => data.locationName === location).length;
      const history = employeeWorkDataList.filter(locationData => locationData.locationName === location);
      history.map(data => {
        const name = employeesList.find(emp => emp.employeeId === data.employeeId).name;
        const pay = employeesList.find(emp => emp.employeeId === data.employeeId).pay;
        data.name = name;
        data.pay = pay;
      });
      const rowData = {
        locationName: location,
        totalDaysWorkedOnLocation: totalDays,
        totalEmployeePayout: getLocationTotalPayout(location),
        history: history,
      }
      setRowList(prevArray => [...prevArray, rowData]);
    });
  };

  useEffect(() => {
    const doInOrder = async () => {
      if (employeesList.length !== numOfEmp) {
        const employeeResponse = await db("EMPLOYEES").return().all();
        setNumOfEmp(employeeResponse.length);
        await getEmployeeWorkData();
        await getPayDetails();
        await getLocationsList();
        await getEmployeesList();
      } else if (employeesList.length === numOfEmp && employeeWorkDataList) {
        getRowList();
      }
    }
    doInOrder();
  }, [employeesList.length === numOfEmp]);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Location</TableCell>
            <TableCell align="right">Total Days Worked</TableCell>
            <TableCell align="right">Total Employee Payout</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rowList.length > 0 ? rowList.map((row) => (
            <Row key={row.name} row={row} />
          )) : <CircularProgress />}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LocationTable;
