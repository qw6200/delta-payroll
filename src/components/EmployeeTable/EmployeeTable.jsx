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
import CircularProgress from '@mui/material/CircularProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import './EmployeeTable.css';

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
          {row.name}
        </TableCell>
        <TableCell align="right">${row.pay}</TableCell>
        <TableCell align="right">{row.totalDaysWorked}</TableCell>
        <TableCell align="right">${row.totalPay}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Work History
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Date Worked</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Employee ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.length > 0 ? row.history.map((historyRow, key) => (
                    <TableRow>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>
                        {historyRow.dateWorked}
                      </TableCell>
                      <TableCell>{historyRow.locationName}</TableCell>
                      <TableCell>{historyRow.employeeId}</TableCell>
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

const EmployeeTable = () => {
  const { db, e } = useEasybase();
  const [employeesList, setEmployeesList] = useState([]);
  const [payDetailsList, setPayDetailsList] = useState(new Map());
  const [employeeWorkDataList, setEmployeeWorkDataList] = useState([]);
  const [rowList, setRowList] = useState([]);
  const [numOfEmp, setNumOfEmp] = useState(null);

  const getPayDetails = async () => {
    const locationPayData = await db("LOCATIONS").return("employeeid", "numDaysWorked", "dateworked").all();
    const dateFilteredLocationData = locationPayData.filter(data => isAfter(new Date(data.dateworked), new Date('2021-10-10')));
    console.log('locationPayData:', locationPayData);
    console.log('dateFilteredLocationData:', dateFilteredLocationData);
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
    const employeeWorkData = await db("LOCATIONS").return("locationname", "employeeid", "dateworked").all();
    const dateFilteredLocationData = employeeWorkData.filter(data => isAfter(new Date(data.dateworked), new Date('2021-10-10')));
    dateFilteredLocationData.map(emp => {
      const data = {
        locationName: emp.locationname,
        employeeId: emp.employeeid,
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

  const getRowList = async () => {
    employeesList.map(emp => {
      const history = employeeWorkDataList.filter(locationData => locationData.employeeId === emp.employeeId);
      const rowData = {
        name: emp.name,
        pay: emp.pay,
        totalDaysWorked: emp.totalDaysWorked,
        totalPay: emp.totalPay,
        employeeId: emp.employeeId,
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
            <TableCell>Employee</TableCell>
            <TableCell align="right">Pay Per Day</TableCell>
            <TableCell align="right">Total Days</TableCell>
            <TableCell align="right">Total Pay</TableCell>
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

export default EmployeeTable;
