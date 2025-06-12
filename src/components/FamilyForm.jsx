// src/components/FamilyForm.jsx
import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

export default function FamilyForm() {
  const [formData, setFormData] = useState({
    familyName: '',
    memberCount: '',
    originCountry: '',
    familyColor: '#000000'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulaire soumis :', formData);
    setSubmitted(true);
  };

  return (
    <Form onSubmit={handleSubmit} className="p-4 shadow-sm bg-white rounded">
      <h4 className="mb-3">Ajouter une Famille</h4>

      {submitted && <Alert variant="success">Famille enregistrée avec succès !</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Nom de famille</Form.Label>
        <Form.Control
          type="text"
          name="familyName"
          placeholder="Entrez le nom"
          value={formData.familyName}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Nombre de membres</Form.Label>
        <Form.Control
          type="number"
          name="memberCount"
          placeholder="Ex: 4"
          value={formData.memberCount}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Pays d'origine</Form.Label>
        <Form.Control
          type="text"
          name="originCountry"
          placeholder="Ex: France"
          value={formData.originCountry}
          onChange={handleChange}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Couleur du groupe familial</Form.Label>
        <Form.Control
          type="color"
          name="familyColor"
          value={formData.familyColor}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="primary" type="submit">
          Enregistrer
        </Button>
      </div>
    </Form>
  );
}
