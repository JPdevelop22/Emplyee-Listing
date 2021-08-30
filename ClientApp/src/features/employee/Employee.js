import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import {
    getEmployeesThunk,
    deleteEmployeeThunk,
    getEmployees,
    selectStateStatus
} from './employeesSlice'

import { 
    Table,
    Button, 
    ButtonToolbar, 
    ButtonGroup,
    UncontrolledTooltip
} from 'reactstrap';
import SearchBar from '../../app/SearchBar'
import { AbsoluteCentralizedSpinner } from '../../app/Spinners'
import FloatingButtons from '../../app/FloatingButtons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import AddEmpModal from './PopUp modals/AddEmpModal';
import EditEmpModal from './PopUp modals/EditEmpModal';
import SweetAlert from 'react-bootstrap-sweetalert';

const Employee = () => {
    const dispatch = useDispatch()
    
    const employees = useSelector(getEmployees)
    const employeeStateStatus = useSelector(selectStateStatus)
    const error = useSelector(state => state.Employee.error)

    const [canGetEmployees, setCanGetEmployees] = useState(true)
    const [modalAddOpened, setModalAddOpened] = useState(false)
    const [modalEditOpened, setModalEditOpened] = useState(false)
    const [employeeToEdit, setEmployeeToEdit] = useState(null)
    const [employeesToShow, setEmployeesToShow] = useState(employees)
    const [alertToShow, setAlertToShow] = useState(null)
    const [isAlertShowing, setIsAlertShowing] = useState(false)

    // Handling Popup modals events (Pop up and Pop out)
    const enterAddMode = () => { 
        setModalAddOpened(!modalAddOpened)
    }

    const exitAddMode = () => { 
        setModalAddOpened(!modalAddOpened)
        setCanGetEmployees(true) 
    }

    const enterEditMode = (EmployeeId) => {
        setEmployeeToEdit(EmployeeId)
        setModalEditOpened(!modalEditOpened)
    }

    const exitEditMode = () => { 
        setModalEditOpened(!modalEditOpened)
        setCanGetEmployees(true) 
    }

    const enterDeleteMode = (EmployeeId) => {
        setAlertToShow(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                confirmBtnBsStyle="danger"
                title="Are you sure?"
                onConfirm={() => deleteEmployee(EmployeeId)}
                onCancel={() => setIsAlertShowing(false)}
                focusCancelBtn
            >
                Do you want to delete this employee? (This action can't be undone)
            </SweetAlert>
        )

        setIsAlertShowing(true)
    }

    const deleteEmployee = (EmployeeId) => {
        dispatch(deleteEmployeeThunk(EmployeeId))
            .then(unwrapResult)
            .then(() => {
                setAlertToShow(
                    <SweetAlert 
                        success 
                        title="Employee deleted" 
                        onConfirm={() => {
                            setIsAlertShowing(false)
                            setCanGetEmployees(true)
                        }} 
                        onCancel={() => setIsAlertShowing(false)}
                    >
                        The employee was deleted from the data base!
                    </SweetAlert>
                )
            })
    }

    // Dispatching, getting, and redering data
    useEffect(() => {
        if (canGetEmployees) {
            dispatch(getEmployeesThunk())
            setCanGetEmployees(false)
        } 
    }, [canGetEmployees, dispatch])

    useEffect(() => {
        setEmployeesToShow(employees)
    }, [employees])

    let Tbody = ({ employees }) => {
        const tRows = employees.map(
            (employee, idx) => (
                <tr key={idx}>
                    <td>{employee.EmployeeId}</td>
                    <td>{employee.EmployeeName}</td>
                    <td>{employee.Department}</td>
                    <td>{employee.DateOfJoining}</td>
        
                    {/* Employee actions */}
                    <td>
                        <ButtonToolbar>
                            <ButtonGroup size="sm">
                                <Button
                                    id={'editItemBtn' + idx}
                                    color="info" 
                                    outline 
                                    onClick={() => enterEditMode(employee.EmployeeId)}
                                >
                                    <FontAwesomeIcon icon={['fas', 'user-edit']} />
                                </Button>
                                
                                <Button
                                    id={'delItemBtn' + idx}
                                    color="danger" 
                                    outline 
                                    onClick={() => enterDeleteMode(employee.EmployeeId)}
                                >
                                    <FontAwesomeIcon icon={['fas', 'minus-circle']} />
                                </Button>
        
                                {/* Tooltips */}
                                <UncontrolledTooltip target={'editItemBtn' + idx} autohide={false} placement="left">
                                    Edit item
                                </UncontrolledTooltip>
        
                                <UncontrolledTooltip target={'delItemBtn' + idx} autohide={false} placement="bottom">
                                    Delete item
                                </UncontrolledTooltip>
                            </ButtonGroup>
                        </ButtonToolbar>
                    </td>
                </tr>
            )
        )
        
        return (
            <tbody>
                {tRows}
            </tbody>
        )
    }

    Tbody = React.memo(Tbody)

    // Error handler
    if (employeeStateStatus === 'rejected') {
        alert("Something went worng!\n" + error.message)
    }

    // Search Algorimth
    const searchByName = (name = "") => {
        const newEntries = employees.filter(
            (employee) => employee.EmployeeName.toLocaleLowerCase().includes(name.toLocaleLowerCase())
        )
        
        setEmployeesToShow(newEntries)
    }

    // Search handler
    const onIptSearchChange = (e) => searchByName(e.target.value)

    const onFormSearchSubmit = (e) => {
        e.preventDefault();
        searchByName(e.target.iptSearch.value)
    }

    return (
        <div className="my-5 d-flex flex-column justify-content-center">
            <h2 className="txt-secondary">
                Table of Departments
            </h2>

            <SearchBar onSearchBarSubmit={onFormSearchSubmit} onIptSearchChange={onIptSearchChange} />
            
            <Table striped hover bordered responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Employee name</th>
                        <th>Department</th>
                        <th>Date of Joining</th>
                        <th>Options</th>
                    </tr>
                </thead>

                {(employeesToShow.length !== 0)? <Tbody employees={employeesToShow} /> 
                        : null}
            </Table>
            
            <FloatingButtons addAction={enterAddMode} reloadAction={() => dispatch(getEmployeesThunk())} />

            {/* Pop up Add modal */}
            <AddEmpModal isOpen={modalAddOpened} toggle={exitAddMode} />
            <EditEmpModal isOpen={modalEditOpened} toggle={exitEditMode} targetid={employeeToEdit} />

            {/* Alert */}
            {(isAlertShowing)? alertToShow : null}

            {(employeeStateStatus === 'pending')? <AbsoluteCentralizedSpinner /> : null}
        </div>
    )
}

export default Employee