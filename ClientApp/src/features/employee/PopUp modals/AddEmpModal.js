import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { unwrapResult } from '@reduxjs/toolkit'
import { 
    postEmployeeThunk, 
    getAllDeparmentsNamesThunk, 
    savePhotoThunk,
    selectStateStatus,
    selectPhotoStatus
} from '../employeesSlice'

import {
    Modal, 
    ModalHeader, 
    ModalBody, 
    ModalFooter, 
    Row, 
    Col, 
    Form,
    FormGroup,
    Label, 
    Input, 
    Button
} from 'reactstrap';
import { InputAlongsideSpinner, PhotoSpinner } from '../../../app/Spinners'

const AddEmpModal = (props) => {
    const dispatch = useDispatch()

    const employeeStateStatus = useSelector(selectStateStatus)
    const photoStatus = useSelector(selectPhotoStatus)
    const error = useSelector(state => state.Employee.error)

    const [inputEmpName, setInputEmpName] = useState('')
    const [inputEmpDepartment, setInputEmpDepartment] = useState('')
    const [inputEmpDateOfJoining, setInputEmpDateOfJoining] = useState('')
    const [departmentOptions, setDepartmentOptions] = useState([])
    const [photoThumbnail, setPhotoThumbnail] = useState("anonymous.jpg")
    
    const imageSrc = process.env.REACT_APP_PHOTOSPATH + photoThumbnail;
    
    const ReloadDepartments = useCallback(() => {
        dispatch(getAllDeparmentsNamesThunk())
            .then(unwrapResult)
            .then(data => {
                setDepartmentOptions(
                    data.map(({ DepartmentName }, idx) => (
                        <option key={idx} value={DepartmentName}>{DepartmentName}</option>
                        ))
                    )
                }
            )
    }, [dispatch])

    useEffect(() => ReloadDepartments(), [ReloadDepartments])
    
    const onInputEmpNameChange = (e) => setInputEmpName(e.target.value)
    const onInputEmpDepartmentChange = (e) => setInputEmpDepartment(e.target.value)
    const onInputEmpDateOfJoiningChange = (e) => setInputEmpDateOfJoining(e.target.value)

    const onChangePhoto = (e) => {
        e.preventDefault();

        const formData = new FormData()
        formData.append("myPhoto", e.target.files[0], e.target.files[0].name)
        
        dispatch(savePhotoThunk(formData))
            .then(unwrapResult)
            .then(data => {
                setPhotoThumbnail(data)
            })
    }

    const addNewEmployee = (e) => {
        e.preventDefault()

        dispatch(postEmployeeThunk({ 
            EmployeeName: inputEmpName,
            Department: inputEmpDepartment,
            DateOfJoining: inputEmpDateOfJoining,
            PhotoFileName: photoThumbnail
        }))
        
        setInputEmpName('')
        setInputEmpDepartment('')
        setInputEmpDateOfJoining('')
        setPhotoThumbnail("anonymous.jpg")

        props.toggle()
    }

    if (employeeStateStatus === 'rejected' || photoStatus === 'rejected') {
        alert("Something went wrong!\n" + error.message)
    }

    return (
        <div className="container">

            <Modal {...props} centered size="lg">
            
                <ModalHeader>
                    Add a new employee
                </ModalHeader>
                
                <ModalBody>
                    <Form onSubmit={addNewEmployee}>
                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <Label for="inputEmployeeName">Department name:</Label>
                                    <Input 
                                        type="text" 
                                        id="inputEmployeeName"
                                        name="inputEmployeeName"
                                        required
                                        maxLength={300}
                                        onChange={onInputEmpNameChange} 
                                        value={inputEmpName} 
                                        placeholder="Jonh Rodriguez" 
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="inputEmployeeDepartment">
                                        Department: 
                                        {(employeeStateStatus === 'pending')? <InputAlongsideSpinner /> : null}
                                    </Label>
                                    <div className="d-flex">
                                        <Input 
                                            type="select" 
                                            id="inputEmployeeDepartment"
                                            name="inputEmployeeDepartment"
                                            required
                                            onChange={onInputEmpDepartmentChange}
                                        >
                                            <option value=""></option>
                                            {departmentOptions}
                                        </Input>
                                        <Button 
                                            className="ml-2"
                                            type="button" 
                                            outline 
                                            color="info"
                                            size="sm"
                                            onClick={ReloadDepartments}
                                        >
                                            <i className="fas fa-redo-alt" title="Reload department names"></i>
                                        </Button>
                                    </div>
                                </FormGroup>

                                <FormGroup>
                                    <Label for="inputEmployeeDateOfJoining">Date of Joining:</Label>
                                    <Input 
                                        type="date" 
                                        id="inputEmployeeDateOfJoining"
                                        name="inputEmployeeDateOfJoining"
                                        maxLength={10}
                                        onChange={onInputEmpDateOfJoiningChange} 
                                        value={inputEmpDateOfJoining} 
                                    />
                                </FormGroup>

                            </Col>

                            <Col className="mt-3" sm={6}>
                                <div className="position-relative" style={{width: "fit-content", height: "fit-content"}}>
                                    <img 
                                        src={imageSrc} 
                                        className="rounded img-thumbnail img-fluid" 
                                        alt="The employee for add"
                                    />
                                    {(photoStatus === 'sending')? <PhotoSpinner /> : null}
                                </div>
                                <Input type="file" onChange={onChangePhoto} />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="mt-3" sm={6}>
                                <Button color="info">Add employee</Button>
                            </Col>
                        </Row>
                    </Form>
                </ModalBody>
                
                <ModalFooter>
                    <Button color="danger" onClick={props.toggle}>Close</Button>
                </ModalFooter>

            </Modal>

        </div>
    )
}

export default AddEmpModal
