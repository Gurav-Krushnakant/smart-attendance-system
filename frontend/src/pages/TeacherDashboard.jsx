import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Tabs, Tab, Form, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  // Attendance Modal state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const classRes = await axios.get('http://localhost:5000/api/teacher/classes');
      setClasses(classRes.data.data);

      const leaveRes = await axios.get('http://localhost:5000/api/teacher/leave-requests?status=Pending');
      setLeaveRequests(leaveRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveDecision = async (id, decision) => {
    try {
      const status = decision === 'Rejected' ? 'Rejected' : 'Approved';
      const approvedAs = decision === 'Rejected' ? null : decision;

      await axios.put(`http://localhost:5000/api/teacher/leave-requests/${id}`, { status, approvedAs });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async (classId) => {
      try {
          const response = await axios.get(`http://localhost:5000/api/reports/export?type=attendance&classId=${classId}&format=csv`, {
              responseType: 'blob',
          });
          
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'attendance_report.csv');
          document.body.appendChild(link);
          link.click();
      } catch(err) {
          console.error('Export failed', err);
      }
  };

  const openAttendanceModal = async (cls) => {
      setSelectedClass(cls);
      setShowAttendanceModal(true);
      try {
          const res = await axios.get(`http://localhost:5000/api/teacher/classes/${cls._id}/students`);
          setStudents(res.data.data);
          // Initialize records to 'Present'
          const initialRecords = {};
          res.data.data.forEach(s => {
              initialRecords[s._id] = 'Present';
          });
          setAttendanceRecords(initialRecords);
      } catch (err) {
          console.error(err);
      }
  };

  const handleRecordChange = (studentId, status) => {
      setAttendanceRecords({
          ...attendanceRecords,
          [studentId]: status
      });
  };

  const submitAttendance = async () => {
      try {
          // Format records to match API array
          const recordsArray = Object.keys(attendanceRecords).map(studentId => ({
              student: studentId,
              status: attendanceRecords[studentId]
          }));

          await axios.post('http://localhost:5000/api/teacher/attendance', {
              classId: selectedClass._id,
              subjectId: selectedClass.subjects[0]._id, // assuming 1 subject for simplicity in UI right now
              date: attendanceDate,
              records: recordsArray
          });
          
          setShowAttendanceModal(false);
          alert("Attendance marked successfully!");
      } catch (err) {
          alert(err.response?.data?.message || 'Error marking attendance');
      }
  };

  return (
    <Container className="dashboard-container">
      <h2 className="fw-bold mb-4">Teacher Dashboard</h2>
      
      <Card className="p-4">
        <Tabs defaultActiveKey="classes" className="mb-4">
          <Tab eventKey="classes" title="My Classes">
            <Row>
              {classes.map(cls => (
                <Col md={6} lg={4} key={cls._id} className="mb-4">
                  <Card className="h-100 shadow-sm border-0 bg-light">
                    <Card.Body>
                      <h5 className="fw-bold text-primary mb-1">{cls.name}</h5>
                      <p className="text-muted mb-3">{cls.department?.name}</p>
                      
                      <div className="d-grid gap-2 mt-4">
                        <Button variant="primary" onClick={() => openAttendanceModal(cls)}>Mark Attendance</Button>
                        <Button variant="outline-secondary" onClick={() => handleExport(cls._id)}>Export Report (CSV)</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Tab>
          
          <Tab eventKey="leaves" title={`Leave Requests (${leaveRequests.length})`}>
            {leaveRequests.length === 0 ? (
                <p className="text-center text-muted my-4">No pending leave requests.</p>
            ) : (
                <Table hover responsive className="table-custom">
                <thead>
                    <tr>
                    <th>Student</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map(req => (
                    <tr key={req._id} className="align-middle">
                        <td>
                            <div className="fw-medium">{req.student?.name}</div>
                            <small className="text-muted">{req.student?.rollNumber}</small>
                        </td>
                        <td>
                            {new Date(req.startDate).toLocaleDateString()} - <br/>
                            {new Date(req.endDate).toLocaleDateString()}
                        </td>
                        <td>{req.reason}</td>
                        <td>
                            <div className="d-flex flex-column gap-2">
                                <Button variant="success" size="sm" onClick={() => handleLeaveDecision(req._id, 'Official Leave')}>Approve as Official (OL)</Button>
                                <Button variant="warning" size="sm" onClick={() => handleLeaveDecision(req._id, 'Personal Leave')}>Approve as Personal (PL)</Button>
                                <Button variant="danger" size="sm" onClick={() => handleLeaveDecision(req._id, 'Rejected')}>Reject</Button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            )}
          </Tab>
        </Tabs>
      </Card>

      {/* Mark Attendance Modal */}
      <Modal show={showAttendanceModal} onHide={() => setShowAttendanceModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Mark Attendance: {selectedClass?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form.Group className="mb-4" style={{maxWidth: '250px'}}>
                <Form.Label>Attendance Date</Form.Label>
                <Form.Control type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
            </Form.Group>
            
            {students.length === 0 ? (
                <p>No students found in this class.</p>
            ) : (
                <Table bordered hover>
                    <thead className="bg-light">
                        <tr>
                            <th>Roll No</th>
                            <th>Student Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student._id}>
                                <td>{student.rollNumber}</td>
                                <td>{student.name}</td>
                                <td>
                                    <Form.Select 
                                        size="sm" 
                                        value={attendanceRecords[student._id]} 
                                        onChange={(e) => handleRecordChange(student._id, e.target.value)}
                                        className={
                                            attendanceRecords[student._id] === 'Present' || attendanceRecords[student._id] === 'Official Leave' 
                                            ? 'text-success fw-bold' 
                                            : 'text-danger fw-bold'
                                        }
                                    >
                                        <option value="Present" className="text-success">Present</option>
                                        <option value="Absent" className="text-danger">Absent</option>
                                        <option value="Official Leave" className="text-primary">Official Leave</option>
                                        <option value="Personal Leave" className="text-warning">Personal Leave</option>
                                    </Form.Select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAttendanceModal(false)}>Close</Button>
          <Button variant="primary" onClick={submitAttendance} disabled={students.length === 0}>Submit Attendance</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default TeacherDashboard;
