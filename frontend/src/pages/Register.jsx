import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    department: '',
    classId: '',
    contactDetails: ''
  });
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);

  useEffect(() => {
    // In a real app, this would be a public endpoint or admin route without auth for reg
    // For demo, we assume the API allows fetching classes/depts without token or we mock it
    // Using dummy data if API is protected, ideally create public endpoints for registration form
    setDepartments([
        { _id: 'dept1', name: 'Computer Science' },
        { _id: 'dept2', name: 'Information Technology' }
    ]);
    setClasses([
        { _id: 'class1', name: 'TY CSE', department: 'dept1' },
        { _id: 'class2', name: 'FY CSE', department: 'dept1' }
    ]);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(formData);
      setSuccess('Registration successful! Please wait for admin approval before logging in.');
      setTimeout(() => {
          // Could navigate to login or stay
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-4 border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">Student Registration</h3>
                <p className="text-muted">Create your account to track attendance</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required className="bg-light border-0 p-2" />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required className="bg-light border-0 p-2" />
                        </Form.Group>
                    </Col>
                </Row>
                
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required className="bg-light border-0 p-2" />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                        <Form.Label>Roll Number</Form.Label>
                        <Form.Control type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required className="bg-light border-0 p-2" />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Contact Details (Phone)</Form.Label>
                  <Form.Control type="text" name="contactDetails" value={formData.contactDetails} onChange={handleChange} required className="bg-light border-0 p-2" />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 p-3 fw-bold mb-3" disabled={loading}>
                  {loading ? 'Registering...' : 'Register Account'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-primary text-decoration-none fw-medium">Sign in</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
