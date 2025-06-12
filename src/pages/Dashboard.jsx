// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AppNavbar from '../components/Navbar';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import { BsPeopleFill, BsPlusCircle, BsTree } from 'react-icons/bs';

export default function Dashboard() {
  // Exemple de données statistiques (à connecter plus tard)
  const [stats] = useState({
    familiesCount: 12,
    totalMembers: 48,
    recentActions: [
      'Ajout de la famille Dupont',
      'Modification de la famille Martin',
      'Suppression de la famille Bernard',
    ],
  });

  return (
    <div className="vh-100 d-flex flex-column">
      <AppNavbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4 bg-light overflow-auto">
          <h2 className="mb-4">Bienvenue sur le Dashboard</h2>
          <Container fluid>
            <Row className="mb-4">
              <Col md={4}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Card.Title>
                      <BsPeopleFill className="me-2 text-primary" />
                      Familles enregistrées
                    </Card.Title>
                    <h3>{stats.familiesCount}</h3>
                    <Button href="/family-list" variant="outline-primary" size="sm">
                      Voir les familles
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Card.Title>
                      <BsPeopleFill className="me-2 text-success" />
                      Membres totaux
                    </Card.Title>
                    <h3>{stats.totalMembers}</h3>
                    <Button href="/family-list" variant="outline-success" size="sm">
                      Gérer les membres
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Card.Title>
                      <BsTree className="me-2 text-warning" />
                      Vue Arbre
                    </Card.Title>
                    <Button href="/tree-view" variant="outline-warning" size="sm">
                      Voir l’arbre
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Card className="shadow-sm border-0">
                  <Card.Header>Dernières actions</Card.Header>
                  <ListGroup variant="flush">
                    {stats.recentActions.map((action, i) => (
                      <ListGroup.Item key={i}>{action}</ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card>
              </Col>

              <Col md={6} className="d-flex flex-column justify-content-center">
                <Button
                  href="/family-list"
                  variant="primary"
                  size="lg"
                  className="mb-3 d-flex align-items-center justify-content-center"
                >
                  <BsPlusCircle className="me-2" />
                  Ajouter une nouvelle famille
                </Button>
                <Button
                  href="/tree-view"
                  variant="outline-secondary"
                  size="lg"
                  className="d-flex align-items-center justify-content-center"
                >
                  Voir l’arbre généalogique
                </Button>
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </div>
  );
}
