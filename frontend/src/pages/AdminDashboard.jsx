import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { Users, CheckCircle, Clock, BookOpen } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalStudents: 0, pendingStudents: 0, totalTeachers: 0, totalClasses: 0 });
  const [pendingStudents, setPendingStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Modal state
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', department: '', contactDetails: '', subjectName: '', subjectCode: '', classId: '' });

  useEffect(() => {
    fetchData();
    fetchDepartments();
    fetchClasses();
  }, []);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get('http://localhost:5000/api/admin/dashboard');
      setStats(statsRes.data.data);

      const pendingRes = await axios.get('http://localhost:5000/api/admin/users?role=student&status=Pending');
      setPendingStudents(pendingRes.data.data);

      const teachersRes = await axios.get('http://localhost:5000/api/admin/users?role=teacher');
      setTeachers(teachersRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/admin/departments');
          setDepartments(res.data.data);
      } catch (err) {
          console.error(err);
      }
  };

  const fetchClasses = async () => {
      try {
          const res = await axios.get('http://localhost:5000/api/admin/classes');
          setClasses(res.data.data);
      } catch (err) {
          console.error(err);
      }
  };

  const handleStudentApproval = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${id}/status`, { status });
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
    }
  };

  const handleTeacherSubmit = async (e) => {
      e.preventDefault();
      try {
          await axios.post('http://localhost:5000/api/admin/users/teacher', teacherForm);
          setShowTeacherModal(false);
          setTeacherForm({ name: '', email: '', password: '', department: '', contactDetails: '', subjectName: '', subjectCode: '', classId: '' });
          fetchData(); // Refresh list
      } catch (err) {
          alert(err.response?.data?.message || 'Error adding teacher');
      }
  };

  const handleAssignClassTeacher = async (classId, teacherId) => {
      if (!teacherId) return;
      try {
          await axios.put(`http://localhost:5000/api/admin/classes/${classId}/teacher`, { teacherId });
          fetchClasses(); // Refresh class list
      } catch (err) {
          alert(err.response?.data?.message || 'Error assigning class teacher');
      }
  };

  return (
    <Container className="dashboard-container">
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-5">
        <Col md={3}>
          <Card className="stat-card">
            <Users className="icon" />
            <div className="value">{stats.totalStudents}</div>
            <div className="text-muted">Total Students</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Clock className="icon text-warning" />
            <div className="value">{stats.pendingStudents}</div>
            <div className="text-muted">Pending Approvals</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <CheckCircle className="icon text-success" />
            <div className="value">{stats.totalTeachers}</div>
            <div className="text-muted">Total Teachers</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <BookOpen className="icon text-info" />
            <div className="value">{stats.totalClasses}</div>
            <div className="text-muted">Total Classes</div>
          </Card>
        </Col>
      </Row>

      <Card className="p-4">
        <Tabs defaultActiveKey="pending" id="admin-tabs" className="mb-4">
          <Tab eventKey="pending" title={`Pending Students (${pendingStudents.length})`}>
            {pendingStudents.length === 0 ? (
                <p className="text-center text-muted my-4">No pending student approvals.</p>
            ) : (
                <Table hover responsive className="table-custom">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Roll Number</th>
                    <th>Department</th>
                    <th>Class</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingStudents.map(student => (
                    <tr key={student._id} className="align-middle">
                        <td>{student.name}</td>
                        <td>{student.rollNumber}</td>
                        <td>{student.department?.name || 'N/A'}</td>
                        <td>{student.class?.name || 'N/A'}</td>
                        <td>
                        <Button variant="success" size="sm" className="me-2" onClick={() => handleStudentApproval(student._id, 'Approved')}>Approve</Button>
                        <Button variant="danger" size="sm" onClick={() => handleStudentApproval(student._id, 'Rejected')}>Reject</Button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            )}
          </Tab>
          <Tab eventKey="teachers" title={`Manage Teachers (${teachers.length})`}>
              <div className="d-flex justify-content-end mb-3">
                  <Button variant="primary" onClick={() => setShowTeacherModal(true)}>Add New Teacher</Button>
              </div>
              <Table hover responsive className="table-custom">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map(teacher => (
                    <tr key={teacher._id} className="align-middle">
                        <td>{teacher.name}</td>
                        <td>{teacher.email}</td>
                        <td>{teacher.department?.name || 'N/A'}</td>
                        <td><Badge bg="success" className="badge-custom">Active</Badge></td>
                    </tr>
                    ))}
                </tbody>
                </Table>
          </Tab>
          <Tab eventKey="classes" title={`Manage Classes (${classes.length})`}>
              <Table hover responsive className="table-custom">
                <thead>
                    <tr>
                    <th>Class Name</th>
                    <th>Department</th>
                    <th>Current Class Teacher</th>
                    <th>Assign / Change Class Teacher</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map(cls => (
                    <tr key={cls._id} className="align-middle">
                        <td>{cls.name}</td>
                        <td>{cls.department?.name || 'N/A'}</td>
                        <td>
                            {cls.classTeacher ? (
                                <Badge bg="info" className="badge-custom">{cls.classTeacher.name}</Badge>
                            ) : (
                                <Badge bg="secondary" className="badge-custom">Unassigned</Badge>
                            )}
                        </td>
                        <td>
                            <Form.Select 
                                size="sm" 
                                value={cls.classTeacher?._id || ''} 
                                onChange={(e) => handleAssignClassTeacher(cls._id, e.target.value)}
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t._id} value={t._id}>{t.name}</option>
                                ))}
                            </Form.Select>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
          </Tab>
        </Tabs>
      </Card>

      {/* Add Teacher Modal */}
      <Modal show={showTeacherModal} onHide={() => setShowTeacherModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Teacher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleTeacherSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" value={teacherForm.name} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={teacherForm.email} onChange={e => setTeacherForm({...teacherForm, email: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={teacherForm.password} onChange={e => setTeacherForm({...teacherForm, password: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Department</Form.Label>
              <Form.Select value={teacherForm.department} onChange={e => setTeacherForm({...teacherForm, department: e.target.value})} required>
                <option value="">Select Department</option>
                {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Assign Class</Form.Label>
              <Form.Select value={teacherForm.classId} onChange={e => setTeacherForm({...teacherForm, classId: e.target.value})} required>
                <option value="">Select Class</option>
                {classes.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject Name</Form.Label>
                  <Form.Control type="text" value={teacherForm.subjectName} onChange={e => setTeacherForm({...teacherForm, subjectName: e.target.value})} required placeholder="e.g. Data Structures" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject Code</Form.Label>
                  <Form.Control type="text" value={teacherForm.subjectCode} onChange={e => setTeacherForm({...teacherForm, subjectCode: e.target.value})} required placeholder="e.g. CS201" />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Contact Details</Form.Label>
              <Form.Control type="text" value={teacherForm.contactDetails} onChange={e => setTeacherForm({...teacherForm, contactDetails: e.target.value})} required />
            </Form.Group>
            <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowTeacherModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Create Teacher</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default AdminDashboard;
