import React from 'react';
import { Nav } from 'react-bootstrap';
import { BsHouseDoor, BsPeopleFill, BsDiagram3 } from 'react-icons/bs';

export default function Sidebar() {
  return (
    <div className="bg-light p-3 vh-100 shadow-sm d-flex flex-column">
      <h5 className="mb-4">Navigation</h5>
      <Nav defaultActiveKey="/dashboard" className="flex-column">
        <Nav.Link href="/dashboard" className="d-flex align-items-center mb-2">
          <BsHouseDoor className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link href="/family-list" className="d-flex align-items-center mb-2">
          <BsPeopleFill className="me-2" /> Liste des familles
        </Nav.Link>
        <Nav.Link href="/tree-view" className="d-flex align-items-center">
          <BsDiagram3 className="me-2" /> Vue Arbre
        </Nav.Link>
      </Nav>
    </div>
  );
}
