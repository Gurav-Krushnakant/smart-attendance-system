import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, LogOut } from 'lucide-react';

const TopNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar expand="lg" sticky="top" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <GraduationCap className="me-2 text-primary" size={28} />
          Smart Attendance Pro
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to={`/${user.role}-dashboard`} className="fw-medium me-3">
                  Dashboard
                </Nav.Link>
                <div className="d-flex align-items-center me-3 text-muted">
                    <span className="me-2">{user.name}</span>
                    <span className="badge bg-primary text-capitalize">{user.role}</span>
                </div>
                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center">
                  <LogOut size={16} className="me-1" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="me-2">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
