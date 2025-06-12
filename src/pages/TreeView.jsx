// src/pages/TreeView.jsx
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import AppNavbar from '../components/Navbar';
import { Card, Spinner, Form, InputGroup } from 'react-bootstrap';
import Tree from 'react-d3-tree';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { BsTreeFill } from 'react-icons/bs';

// Données simulées
const mockFamilies = [
  {
    id: 1,
    name: 'Famille Dupont',
    members: [
      {
        name: 'Famille Dupont',
        attributes: { description: 'Famille fondatrice' },
        children: [
          {
            name: 'Jean Dupont',
            attributes: { description: 'Père', role: 'Chef de famille' },
            children: [
              { name: 'Alice Dupont', attributes: { description: 'Fille aînée', role: 'Étudiante' } },
              { name: 'Marc Dupont', attributes: { description: 'Fils cadet', role: 'Ingénieur' } },
            ],
          },
          {
            name: 'Marie Dupont',
            attributes: { description: 'Mère', role: 'Gestionnaire' },
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Famille Martin',
    members: [
      {
        name: 'Famille Martin',
        attributes: { description: 'Famille secondaire' },
        children: [
          {
            name: 'Paul Martin',
            attributes: { role: 'Grand-père' },
            children: [
              { name: 'Sophie Martin', attributes: { role: 'Mère' } },
              { name: 'Luc Martin', attributes: { role: 'Oncle' } },
            ],
          },
        ],
      },
    ],
  },
];

export default function TreeView() {
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const treeContainerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Simuler chargement API
    setLoading(true);
    setTimeout(() => {
      setFamilies(mockFamilies);
      setSelectedFamilyId(mockFamilies[0].id); // Sélection par défaut
      setTreeData(mockFamilies[0].members);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({ x: dimensions.width / 2, y: 70 });
    }
  }, [loading]);

  useEffect(() => {
    if (selectedFamilyId !== null) {
      const selected = families.find(f => f.id === Number(selectedFamilyId));
      setTreeData(selected ? selected.members : null);
    }
  }, [selectedFamilyId, families]);

  const handleNodeClick = (nodeData) => {
    alert(`Vous avez cliqué sur : ${nodeData.name}`);
  };

  const renderCustomNode = ({ nodeDatum, toggleNode }) => (
    <>
      <circle
        r={nodeDatum.children ? 18 : 14}
        fill={nodeDatum.children ? '#0d6efd' : '#6c757d'}
        stroke="#fff"
        strokeWidth="3"
        style={{ cursor: 'pointer' }}
        onClick={toggleNode}
        data-tooltip-id={`tooltip-${nodeDatum.__rd3t.id}`}
        data-tooltip-html={true}
        data-tooltip-content={`<strong>${nodeDatum.name}</strong><br/>${nodeDatum.attributes?.role || 'Rôle inconnu'}<br/><small>${nodeDatum.attributes?.description || ''}</small>`}
      />
      <text
        fill="#212529"
        fontWeight={nodeDatum.children ? '700' : '500'}
        x={nodeDatum.children ? -20 : -10}
        y={5}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={toggleNode}
      >
        {nodeDatum.name}
      </text>
      <ReactTooltip
        id={`tooltip-${nodeDatum.__rd3t.id}`}
        place="top"
        variant="dark"
        noArrow
        delayShow={200}
      />
    </>
  );

  return (
    <div className="vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
      <AppNavbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main ref={treeContainerRef} className="flex-grow-1 p-4 overflow-auto" style={{ minHeight: '70vh' }}>
          <div className="d-flex align-items-center mb-4">
            <BsTreeFill size={32} color="#0d6efd" className="me-2" />
            <h2 className="fw-bold text-primary mb-0">Vue Arbre Généalogique</h2>
          </div>

          {/* Sélecteur de famille */}
          <Form.Group className="mb-3">
            <Form.Label>Sélectionnez une famille</Form.Label>
            <Form.Select
              value={selectedFamilyId || ''}
              onChange={(e) => setSelectedFamilyId(Number(e.target.value))}
            >
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Barre de recherche */}
          <Form.Group className="mb-3">
            <Form.Label>Rechercher une personne</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Ex: Jean Dupont"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form.Group>

          <Card className="shadow-lg border-0 rounded-4" style={{ height: '100%', minHeight: '600px', backgroundColor: 'white' }}>
            <Card.Body className="position-relative d-flex justify-content-center align-items-center">
              {loading && (
                <Spinner animation="grow" variant="primary" role="status" style={{ width: '4rem', height: '4rem', opacity: 0.7 }} />
              )}
              {!loading && treeData && (
                <Tree
                  data={treeData}
                  translate={translate}
                  orientation="vertical"
                  zoomable
                  collapsible
                  onNodeClick={handleNodeClick}
                  pathFunc="elbow"
                  nodeSize={{ x: 180, y: 80 }}
                  separation={{ siblings: 1.5, nonSiblings: 2 }}
                  renderCustomNodeElement={renderCustomNode}
                  styles={{
                    links: { stroke: '#0d6efd', strokeWidth: 3 },
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </main>
      </div>
    </div>
  );
}
