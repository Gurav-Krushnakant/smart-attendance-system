import React, { useState, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}-dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5}>
          <Card className="p-4 border-0 shadow-lg" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <div className="text-center mb-4">
                <h3 className="fw-bold text-primary">Welcome Back</h3>
                <p className="text-muted">Sign in to your account</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="fw-medium">Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="name@college.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="p-3 bg-light"
                    style={{ border: 'none' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Enter password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="p-3 bg-light"
                    style={{ border: 'none' }}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 p-3 fw-bold mb-3" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="text-primary text-decoration-none fw-medium">Register here</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
