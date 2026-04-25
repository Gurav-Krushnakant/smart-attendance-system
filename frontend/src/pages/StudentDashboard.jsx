import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, ProgressBar, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const StudentDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  // Leave Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const attRes = await axios.get('http://localhost:5000/api/student/attendance');
      setAttendanceData(attRes.data.data);

      const leaveRes = await axios.get('http://localhost:5000/api/student/leave-requests');
      setLeaveRequests(leaveRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 75) return 'success';
    if (pct >= 60) return 'warning';
    return 'danger';
  };

  const handleLeaveSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.post('http://localhost:5000/api/student/leave-requests', leaveForm);
          setShowLeaveModal(false);
          setLeaveForm({ startDate: '', endDate: '', reason: '' });
          fetchData(); // Refresh list
          alert("Leave request submitted successfully!");
      } catch (err) {
          alert(err.response?.data?.message || 'Error submitting leave request');
      }
  };

  return (
    <Container className="dashboard-container">
      <h2 className="fw-bold mb-4">Student Dashboard</h2>
      
      {attendanceData && (
        <Row className="mb-4">
          <Col md={12} lg={4}>
            <Card className="p-4 text-center h-100 d-flex justify-content-center border-0 shadow-sm">
                <h4 className="text-muted mb-3">Overall Attendance</h4>
                <div className="display-4 fw-bold mb-3" style={{ color: `var(--bs-${getPercentageColor(attendanceData.percentage)})`}}>
                    {attendanceData.percentage}%
                </div>
                <ProgressBar 
                    now={attendanceData.percentage} 
                    variant={getPercentageColor(attendanceData.percentage)} 
                    style={{ height: '10px', borderRadius: '5px' }} 
                />
                <p className="mt-3 text-muted small">Target: 75% minimum required</p>
            </Card>
          </Col>
          <Col md={12} lg={8}>
            <Row>
              <Col sm={6} className="mb-3">
                <Card className="p-3 border-0 shadow-sm bg-light">
                    <h6 className="text-muted mb-1">Total Classes</h6>
                    <h3 className="fw-bold mb-0">{attendanceData.summary.totalClasses}</h3>
                </Card>
              </Col>
              <Col sm={6} className="mb-3">
                <Card className="p-3 border-0 shadow-sm bg-light">
                    <h6 className="text-muted mb-1">Present</h6>
                    <h3 className="fw-bold text-success mb-0">{attendanceData.summary.presentCount}</h3>
                </Card>
              </Col>
              <Col sm={6} className="mb-3">
                <Card className="p-3 border-0 shadow-sm bg-light">
                    <h6 className="text-muted mb-1">Official Leaves (Counted as Present)</h6>
                    <h3 className="fw-bold text-primary mb-0">{attendanceData.summary.officialLeaveCount}</h3>
                </Card>
              </Col>
              <Col sm={6} className="mb-3">
                <Card className="p-3 border-0 shadow-sm bg-light">
                    <h6 className="text-muted mb-1">Absent (Includes Personal Leaves)</h6>
                    <h3 className="fw-bold text-danger mb-0">{attendanceData.summary.absentCount + attendanceData.summary.personalLeaveCount}</h3>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={12}>
            <Card className="p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">My Leave Requests</h5>
                    <Button variant="primary" size="sm" onClick={() => setShowLeaveModal(true)}>Apply for Leave</Button>
                </div>
                
                <Table responsive hover className="table-custom">
                    <thead>
                        <tr>
                            <th>Dates</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Approved As</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveRequests.map(req => (
                            <tr key={req._id}>
                                <td>{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                                <td>{req.reason}</td>
                                <td>
                                    <Badge bg={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'} className="badge-custom">
                                        {req.status}
                                    </Badge>
                                </td>
                                <td>
                                    {req.approvedAs ? (
                                        <Badge bg={req.approvedAs === 'Official Leave' ? 'primary' : 'secondary'} className="badge-custom">
                                            {req.approvedAs === 'Official Leave' ? 'OL' : 'PL'}
                                        </Badge>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </Col>
      </Row>

      {/* Apply Leave Modal */}
      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLeaveSubmit}>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} required />
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control as="textarea" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} required placeholder="Please explain why you need leave..." />
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-4">
                <Button variant="secondary" className="me-2" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Submit Request</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default StudentDashboard;
