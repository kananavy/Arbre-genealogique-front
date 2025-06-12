import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import AppNavbar from '../components/Navbar';
import { Card, Spinner, Form, InputGroup, Alert, Badge } from 'react-bootstrap';
import Tree from 'react-d3-tree';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { BsTreeFill, BsHeart } from 'react-icons/bs';
import { api } from '../config';

export default function TreeView() {
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const treeContainerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  // Charger les familles au montage
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        const response = await api.get('/families');
        setFamilies(response.data);
        if (response.data.length > 0) {
          setSelectedFamilyId(response.data[0].id);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  // Charger l'arbre généalogique quand une famille est sélectionnée
  useEffect(() => {
    const fetchFamilyTree = async () => {
      if (selectedFamilyId === null) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/members/families/${selectedFamilyId}/tree`);
        setTreeData(formatTreeData(response.data));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyTree();
  }, [selectedFamilyId]);

  // Centrer l'arbre
  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({ x: dimensions.width / 2, y: 70 });
    }
  }, [loading, treeData]);

  // Formater les données pour inclure les mariages et relations
  const formatTreeData = (familyData) => {
    // Fonction pour créer un nœud "couple" quand il y a deux parents
    const createCoupleNode = (parent1, parent2, children) => {
      return {
        name: `${parent1.name} ♥ ${parent2.name}`,
        attributes: {
          id: `couple-${parent1.id}-${parent2.id}`,
          role: 'Couple',
          isCouple: true,
          parent1: parent1,
          parent2: parent2,
          marriageDate: parent1.marriageDate || parent2.marriageDate || 'Date inconnue'
        },
        children: children.map(child => buildNode(child, false))
      };
    };

    // Fonction pour analyser et regrouper les enfants par parents
    const groupChildrenByParents = (members) => {
      const parentGroups = new Map();
      const orphans = [];

      members.forEach(member => {
        if (member.fatherId && member.motherId) {
          // Enfant avec deux parents
          const key = `${member.fatherId}-${member.motherId}`;
          if (!parentGroups.has(key)) {
            parentGroups.set(key, {
              father: members.find(m => m.id === member.fatherId),
              mother: members.find(m => m.id === member.motherId),
              children: []
            });
          }
          parentGroups.get(key).children.push(member);
        } else if (member.fatherId || member.motherId) {
          // Enfant avec un seul parent
          const parentId = member.fatherId || member.motherId;
          const parent = members.find(m => m.id === parentId);
          if (parent) {
            orphans.push({
              parent: parent,
              child: member,
              isSingleParent: true
            });
          }
        } else {
          // Personne sans parents (racine)
          orphans.push({
            child: member,
            isRoot: true
          });
        }
      });

      return { parentGroups, orphans };
    };

    const buildNode = (member, isRoot = false) => {
      return {
        name: member.name,
        attributes: {
          id: member.id,
          role: member.isDeceased ? 'Décédé(e)' : 'En vie',
          birthDate: member.birthDate || 'Non spécifié',
          deathDate: member.isDeceased ? (member.deathDate || 'Date inconnue') : null,
          color: member.color,
          isRoot: isRoot,
          isDeceased: member.isDeceased,
          age: member.age,
          spouse: member.spouse
        },
        children: member.children && member.children.length > 0 
          ? member.children.map(child => buildNode(child, false))
          : []
      };
    };

    // Si les données incluent des informations de parenté (fatherId, motherId)
    if (familyData.members && Array.isArray(familyData.members)) {
      const { parentGroups, orphans } = groupChildrenByParents(familyData.members);
      const rootNodes = [];

      // Créer des nœuds couples
      parentGroups.forEach((group) => {
        if (group.father && group.mother) {
          rootNodes.push(createCoupleNode(group.father, group.mother, group.children));
        }
      });

      // Ajouter les parents célibataires et les racines
      orphans.forEach(item => {
        if (item.isRoot) {
          rootNodes.push(buildNode(item.child, true));
        } else if (item.isSingleParent) {
          const parentNode = buildNode(item.parent, false);
          parentNode.children = [buildNode(item.child, false)];
          rootNodes.push(parentNode);
        }
      });

      return {
        name: familyData.name,
        attributes: {
          id: familyData.id,
          role: 'Famille',
          color: familyData.color,
          isFamily: true
        },
        children: rootNodes
      };
    }

    // Structure simple avec children (comme vos données actuelles)
    const buildSimpleNode = (member, isRoot = false) => {
      return {
        name: member.name,
        attributes: {
          id: member.id,
          role: member.isDeceased ? 'Décédé(e)' : 'En vie',
          birthDate: member.birthDate || 'Non spécifié',
          deathDate: member.isDeceased ? (member.deathDate || 'Date inconnue') : null,
          color: member.color,
          isRoot: isRoot,
          isDeceased: member.isDeceased,
          generation: isRoot ? 0 : 1
        },
        children: member.children && member.children.length > 0 
          ? member.children.map((child, index) => {
              // Simuler des couples si plusieurs enfants au même niveau
              const childNode = buildSimpleNode(child, false);
              childNode.attributes.generation = (isRoot ? 1 : 2);
              return childNode;
            })
          : []
      };
    };

    return {
      name: familyData.name,
      attributes: {
        id: familyData.id,
        role: 'Famille',
        color: familyData.color,
        isFamily: true
      },
      children: familyData.children ? familyData.children.map(child => buildSimpleNode(child, false)) : []
    };
  };

  const handleNodeClick = (nodeData) => {
    console.log('Node clicked:', nodeData);
    // Vous pourriez ouvrir un modal avec plus d'informations ici
  };

  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    const isFamily = nodeDatum.attributes?.isFamily;
    const isCouple = nodeDatum.attributes?.isCouple;
    const isDeceased = nodeDatum.attributes?.isDeceased;
    const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
    
    // Déterminer la couleur et la forme du nœud
    let fillColor = '#6c757d';
    let radius = 14;
    let shape = 'circle';
    
    if (isFamily) {
      fillColor = '#0d6efd';
      radius = 25;
    } else if (isCouple) {
      fillColor = '#e91e63';
      radius = 20;
      shape = 'heart';
    } else if (isDeceased) {
      fillColor = '#dc3545';
      radius = hasChildren ? 18 : 14;
    } else if (hasChildren) {
      fillColor = '#20c997';
      radius = 18;
    }

    const tooltipContent = isCouple 
      ? `
        <div style="max-width: 250px">
          <strong>${nodeDatum.attributes.parent1?.name} ♥ ${nodeDatum.attributes.parent2?.name}</strong><br/>
          <small>Mariage: ${nodeDatum.attributes.marriageDate}</small><br/>
          ${hasChildren ? `<small>Enfants: ${nodeDatum.children.length}</small>` : ''}
        </div>
      `
      : `
        <div style="max-width: 200px">
          <strong>${nodeDatum.name}</strong><br/>
          ${nodeDatum.attributes?.role || ''}<br/>
          ${nodeDatum.attributes?.birthDate ? `<small>Naissance: ${nodeDatum.attributes.birthDate}</small><br/>` : ''}
          ${nodeDatum.attributes?.deathDate ? `<small>Décès: ${nodeDatum.attributes.deathDate}</small><br/>` : ''}
          ${nodeDatum.attributes?.age ? `<small>Âge: ${nodeDatum.attributes.age} ans</small><br/>` : ''}
          ${hasChildren ? `<small>Enfants: ${nodeDatum.children.length}</small>` : ''}
        </div>
      `;
    
    return (
      <>
        {shape === 'heart' ? (
          // Nœud en forme de cœur pour les couples
          <g transform="scale(1.5)">
            <path
              d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z"
              fill={fillColor}
              stroke="#fff"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={toggleNode}
              data-tooltip-id={`tooltip-${nodeDatum.attributes?.id || 'node'}`}
              data-tooltip-html={true}
              data-tooltip-content={tooltipContent}
            />
          </g>
        ) : (
          // Nœud circulaire classique
          <circle
            r={radius}
            fill={fillColor}
            stroke="#fff"
            strokeWidth="3"
            style={{ cursor: 'pointer' }}
            onClick={toggleNode}
            data-tooltip-id={`tooltip-${nodeDatum.attributes?.id || 'node'}`}
            data-tooltip-html={true}
            data-tooltip-content={tooltipContent}
          />
        )}
        
        <text
          fill={isFamily || isCouple ? '#fff' : '#212529'}
          fontWeight={isFamily ? '700' : (isCouple ? '600' : (hasChildren ? '600' : '500'))}
          x={0}
          y={radius + 20}
          textAnchor="middle"
          style={{ cursor: 'pointer', userSelect: 'none', fontSize: isCouple ? '10px' : '12px' }}
          onClick={toggleNode}
        >
          {isCouple ? 
            `${nodeDatum.attributes.parent1?.name} & ${nodeDatum.attributes.parent2?.name}` :
            nodeDatum.name
          }
        </text>

        {/* Badge pour indiquer le nombre d'enfants */}
        {hasChildren && (
          <circle
            cx={radius - 5}
            cy={-radius + 5}
            r="8"
            fill="#ffc107"
            stroke="#fff"
            strokeWidth="2"
          />
        )}
        {hasChildren && (
          <text
            x={radius - 5}
            y={-radius + 9}
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
            fill="#000"
          >
            {nodeDatum.children.length}
          </text>
        )}

        <ReactTooltip
          id={`tooltip-${nodeDatum.attributes?.id || 'node'}`}
          place="top"
          variant="dark"
          noArrow
          delayShow={200}
        />
      </>
    );
  };

  // Fonction de recherche dans l'arbre
  const searchInTree = (node, term) => {
    if (!term) return true;
    
    const searchTerm = term.toLowerCase();
    const nodeName = node.name.toLowerCase();
    
    if (nodeName.includes(searchTerm)) {
      return true;
    }
    
    // Recherche dans les informations de couple
    if (node.attributes?.isCouple) {
      const parent1Name = node.attributes.parent1?.name?.toLowerCase() || '';
      const parent2Name = node.attributes.parent2?.name?.toLowerCase() || '';
      if (parent1Name.includes(searchTerm) || parent2Name.includes(searchTerm)) {
        return true;
      }
    }
    
    if (node.children) {
      return node.children.some(child => searchInTree(child, term));
    }
    
    return false;
  };

  // Filtrer les données de l'arbre selon le terme de recherche
  const getFilteredTreeData = () => {
    if (!treeData || !searchTerm) return treeData;
    
    const filterNode = (node) => {
      const shouldInclude = searchInTree(node, searchTerm);
      
      if (!shouldInclude) return null;
      
      return {
        ...node,
        children: node.children 
          ? node.children.map(child => filterNode(child)).filter(Boolean)
          : []
      };
    };
    
    return filterNode(treeData);
  };

  const filteredTreeData = getFilteredTreeData();

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

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {/* Sélecteur de famille */}
          <Form.Group className="mb-3">
            <Form.Label>Sélectionnez une famille</Form.Label>
            <Form.Select
              value={selectedFamilyId || ''}
              onChange={(e) => setSelectedFamilyId(Number(e.target.value))}
              disabled={loading}
            >
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.origin || 'origine inconnue'})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Barre de recherche */}
          <Form.Group className="mb-3">
            <Form.Label>Rechercher une personne ou un couple</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Ex: Jean Dupont ou Marie & Pierre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </InputGroup>
          </Form.Group>

          <Card className="shadow-lg border-0 rounded-4" style={{ height: '100%', minHeight: '600px', backgroundColor: 'white' }}>
            <Card.Body className="position-relative d-flex justify-content-center align-items-center">
              {loading && (
                <div className="text-center">
                  <Spinner animation="grow" variant="primary" role="status" style={{ width: '4rem', height: '4rem', opacity: 0.7 }} />
                  <p className="mt-3 text-muted">Chargement de l'arbre généalogique...</p>
                </div>
              )}
              
              {!loading && error && (
                <Alert variant="danger">
                  Impossible de charger l'arbre généalogique: {error}
                </Alert>
              )}

              {!loading && !error && filteredTreeData && (
                <>
                  <Tree
                    data={filteredTreeData}
                    translate={translate}
                    orientation="vertical"
                    zoomable
                    collapsible
                    onNodeClick={handleNodeClick}
                    pathFunc="elbow"
                    nodeSize={{ x: 220, y: 120 }}
                    separation={{ siblings: 1.5, nonSiblings: 2 }}
                    renderCustomNodeElement={renderCustomNode}
                    styles={{
                      links: { stroke: '#adb5bd', strokeWidth: 2 },
                    }}
                    initialDepth={2}
                  />
                  <div className="position-absolute bottom-0 start-0 m-3">
                    <div className="d-flex align-items-center mb-1">
                      <div className="color-legend me-2" style={{ backgroundColor: '#0d6efd', width: '12px', height: '12px', borderRadius: '50%' }}></div>
                      <small>Famille</small>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <BsHeart className="me-2" color="#e91e63" size={12} />
                      <small>Couple/Mariage</small>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <div className="color-legend me-2" style={{ backgroundColor: '#20c997', width: '12px', height: '12px', borderRadius: '50%' }}></div>
                      <small>Parent</small>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <div className="color-legend me-2" style={{ backgroundColor: '#6c757d', width: '12px', height: '12px', borderRadius: '50%' }}></div>
                      <small>Enfant</small>
                    </div>
                    <div className="d-flex align-items-center mb-1">
                      <div className="color-legend me-2" style={{ backgroundColor: '#dc3545', width: '12px', height: '12px', borderRadius: '50%' }}></div>
                      <small>Décédé</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="color-legend me-2" style={{ backgroundColor: '#ffc107', width: '12px', height: '12px', borderRadius: '50%' }}></div>
                      <small>Nombre d'enfants</small>
                    </div>
                  </div>
                </>
              )}

              {!loading && !error && !treeData && families.length === 0 && (
                <div className="text-center text-muted">
                  <p>Aucune famille disponible.</p>
                  <p>Commencez par créer une famille dans la section "Liste des familles".</p>
                </div>
              )}

              {!loading && !error && filteredTreeData && searchTerm && (
                <div className="position-absolute top-0 end-0 m-3">
                  <Badge bg="info">
                    Résultats pour: "{searchTerm}"
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </main>
      </div>
    </div>
  );
}