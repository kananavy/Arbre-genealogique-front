import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AppNavbar from '../components/Navbar';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';

export default function FamilyList() {
  const [families, setFamilies] = useState([]);

  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [familyForm, setFamilyForm] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    origin: '',
    color: '#000000',
  });

  const [editingFamily, setEditingFamily] = useState(null);

  const [memberForm, setMemberForm] = useState({
    name: '',
    fatherId: '',
    motherId: '',
    isDeceased: false,
  });

  const [editingMember, setEditingMember] = useState(null);
  const [currentFamilyId, setCurrentFamilyId] = useState(null);

  const [alert, setAlert] = useState(null);

  const handleAddFamily = () => {
    setFamilyForm({
      name: '',
      fatherName: '',
      motherName: '',
      origin: '',
      color: '#000000',
    });
    setEditingFamily(null);
    setShowFamilyModal(true);
  };

  const handleSubmitFamily = (e) => {
    e.preventDefault();
    if (!familyForm.name) {
      setAlert({ type: 'warning', message: 'Le nom de famille est obligatoire.' });
      return;
    }

    if (editingFamily) {
      setFamilies(families.map(f =>
        f.id === editingFamily.id ? { ...f, ...familyForm } : f
      ));
      setAlert({ type: 'success', message: 'Famille mise à jour.' });
    } else {
      const newFamily = {
        id: Date.now(),
        name: familyForm.name,
        fatherName: familyForm.fatherName,
        motherName: familyForm.motherName,
        origin: familyForm.origin,
        color: familyForm.color,
        members: [],
      };
      setFamilies([...families, newFamily]);
      setAlert({ type: 'success', message: 'Famille ajoutée.' });
    }

    setShowFamilyModal(false);
  };

  const handleDeleteFamily = (id) => {
    if (window.confirm('Supprimer cette famille ?')) {
      setFamilies(families.filter(f => f.id !== id));
      setAlert({ type: 'danger', message: 'Famille supprimée.' });
    }
  };

  const handleAddMember = (familyId) => {
    setMemberForm({ name: '', fatherId: '', motherId: '', isDeceased: false });
    setEditingMember(null);
    setCurrentFamilyId(familyId);
    setShowMemberModal(true);
  };

  const handleEditMember = (familyId, member) => {
    const updatedFamily = families.find(f => f.id === familyId);
    if (!updatedFamily) return;
  
    setCurrentFamilyId(familyId);
    setEditingMember(member);
    setMemberForm({
      name: member.name,
      fatherId: member.fatherId || '',
      motherId: member.motherId || '',
      isDeceased: member.isDeceased || false,
    });
    setShowMemberModal(true);
  };
  
  const handleSubmitMember = (e) => {
    e.preventDefault();
  
    console.log('Soumission du formulaire membre:', memberForm);
  
    if (!memberForm.name) {
      setAlert({ type: 'warning', message: 'Le nom du membre est obligatoire.' });
      console.warn('Nom du membre manquant');
      return;
    }
  
    setFamilies(families.map(f => {
      if (f.id !== currentFamilyId) {
        return f;
      }
  
      if (editingMember) {
        console.log('Modification du membre:', editingMember);
        const updatedMembers = f.members.map(m =>
          m.id === editingMember.id
            ? {
                ...m,
                name: memberForm.name,
                fatherId: memberForm.fatherId || null,
                motherId: memberForm.motherId || null,
                isDeceased: memberForm.isDeceased,
              }
            : m
        );
        console.log('Membres mis à jour:', updatedMembers);
        return { ...f, members: updatedMembers };
      } else {
        const newMember = {
          id: Date.now(),
          name: memberForm.name,
          fatherId: memberForm.fatherId || null,
          motherId: memberForm.motherId || null,
          isDeceased: memberForm.isDeceased,
        };
        console.log('Ajout d’un nouveau membre:', newMember);
        return { ...f, members: [...f.members, newMember] };
      }
    }));
  
    console.log('Familles après mise à jour:', families);
  
    setShowMemberModal(false);
    setAlert({ type: 'success', message: editingMember ? 'Membre mis à jour.' : 'Membre ajouté.' });
  };
  

  const handleDeleteMember = (familyId, memberId) => {
    if (window.confirm('Supprimer ce membre ?')) {
      setFamilies(families.map(f => {
        if (f.id !== familyId) return f;
        return { ...f, members: f.members.filter(m => m.id !== memberId) };
      }));
      setAlert({ type: 'danger', message: 'Membre supprimé.' });
    }
  };

  const handleFamilyFormChange = (e) => {
    const { name, value } = e.target;
    setFamilyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMemberForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getMemberName = (family, member) => {
    const father = family.members.find(m => m.id === member.fatherId);
    const mother = family.members.find(m => m.id === member.motherId);
    return (
      <>
        {member.name} {member.isDeceased && <span className="text-muted">(†)</span>}
        <br />
        <small className="text-muted">
          Père: {father ? father.name : '-'} | Mère: {mother ? mother.name : '-'}
        </small>
      </>
    );
  };

  return (
    <div className="vh-100 d-flex flex-column">
  <AppNavbar />
  <div className="d-flex flex-grow-1">
    <Sidebar />
    <main className="p-4 flex-grow-1 bg-light overflow-auto">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Liste des Familles</h2>
        <Button variant="primary" onClick={handleAddFamily}>
          + Ajouter une famille
        </Button>
      </div>

      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      {families.length === 0 && <p>Aucune famille enregistrée.</p>}

      {families.map(family => (
        <div key={family.id} className="mb-4 p-3 border rounded" style={{ borderColor: family.color }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h4 style={{ color: family.color }}>{family.name} ({family.origin || '-'})</h4>
              <p className="mb-1 text-muted">
                Père: {family.fatherName || '-'} | Mère: {family.motherName || '-'}
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div
                style={{
                  backgroundColor: family.color,
                  width: '20px',
                  height: '20px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
                title="Couleur"
              />
              <Button variant="outline-success" size="sm" onClick={() => handleAddMember(family.id)}>
                + Ajouter membre
              </Button>
              <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFamily(family.id)}>
                Supprimer famille
              </Button>
            </div>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Décédé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {family.members.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">Aucun membre.</td>
                </tr>
              ) : (
                family.members.map(member => (
                  <tr key={member.id}>
                    <td>{getMemberName(family, member)}</td>
                    <td>{member.isDeceased ? 'Oui' : 'Non'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditMember(family.id, member)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDeleteMember(family.id, member.id)}
                      >
                        Supprimer
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => {
                          const isFather = member.gender === 'male'; // adapte selon ta donnée sexe
                          setCurrentFamilyId(family.id);
                          setMemberForm({
                            name: '',
                            fatherId: isFather ? member.id : '',
                            motherId: isFather ? '' : member.id,
                            isDeceased: false,
                          });
                          setEditingMember(null); // mode ajout
                          setShowMemberModal(true);
                        }}
                        title={`Ajouter un enfant de ${member.name}`}
                      >
                        + Enfant
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      ))}

      {/* Modal Famille */}
      <Modal show={showFamilyModal} onHide={() => setShowFamilyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingFamily ? 'Modifier une famille' : 'Ajouter une famille'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitFamily}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="familyName">
              <Form.Label>Nom de famille</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={familyForm.name}
                onChange={handleFamilyFormChange}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="fatherName">
              <Form.Label>Nom du père</Form.Label>
              <Form.Control
                type="text"
                name="fatherName"
                value={familyForm.fatherName}
                onChange={handleFamilyFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="motherName">
              <Form.Label>Nom de la mère</Form.Label>
              <Form.Control
                type="text"
                name="motherName"
                value={familyForm.motherName}
                onChange={handleFamilyFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="familyOrigin">
              <Form.Label>Pays d'origine</Form.Label>
              <Form.Control
                type="text"
                name="origin"
                value={familyForm.origin}
                onChange={handleFamilyFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="familyColor">
              <Form.Label>Couleur</Form.Label>
              <Form.Control
                type="color"
                name="color"
                value={familyForm.color}
                onChange={handleFamilyFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowFamilyModal(false)}>Annuler</Button>
            <Button variant="primary" type="submit">{editingFamily ? 'Modifier' : 'Ajouter'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Membre */}
      <Modal show={showMemberModal} onHide={() => setShowMemberModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingMember ? 'Modifier un membre' : 'Ajouter un membre'}</Modal.Title>
          {currentFamilyId && (
            <div
              style={{
                width: 30,
                height: 30,
                backgroundColor: families.find(f => f.id === currentFamilyId)?.color || '#000',
                marginLeft: 10,
                borderRadius: 4,
                border: '1px solid #333',
              }}
            />
          )}
        </Modal.Header>
        <Form onSubmit={handleSubmitMember}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="memberName">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={memberForm.name}
                onChange={handleMemberFormChange}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="memberFather">
              <Form.Label>Père</Form.Label>
              <Form.Select name="fatherId" value={memberForm.fatherId} onChange={handleMemberFormChange}>
                <option value="">-- Aucun --</option>
                {families.find(f => f.id === currentFamilyId)?.members
                  .filter(m => !editingMember || m.id !== editingMember.id)
                  .map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="memberMother">
              <Form.Label>Mère</Form.Label>
              <Form.Select name="motherId" value={memberForm.motherId} onChange={handleMemberFormChange}>
                <option value="">-- Aucun --</option>
                {families.find(f => f.id === currentFamilyId)?.members
                  .filter(m => !editingMember || m.id !== editingMember.id)
                  .map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="memberIsDeceased">
              <Form.Check
                type="checkbox"
                label="Décédé"
                name="isDeceased"
                checked={memberForm.isDeceased}
                onChange={handleMemberFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMemberModal(false)}>Annuler</Button>
            <Button variant="primary" type="submit">{editingMember ? 'Modifier' : 'Ajouter'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </main>
  </div>
</div>

  );
}
