import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { BsHouseDoor, BsPeopleFill, BsDiagram3 } from 'react-icons/bs';

export default function AppNavbar() {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-4">
      <Container>
        <Navbar.Brand href="/">Arbre Généalogique</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/dashboard" className="d-flex align-items-center">
              <BsHouseDoor className="me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link href="/family-list" className="d-flex align-items-center">
              <BsPeopleFill className="me-1" /> Familles
            </Nav.Link>
            <Nav.Link href="/tree-view" className="d-flex align-items-center">
              <BsDiagram3 className="me-1" /> Arbre
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
