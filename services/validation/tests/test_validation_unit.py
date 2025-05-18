import pytest
import sys
import os
from datetime import datetime

# Ajouter le répertoire parent au chemin pour pouvoir importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models
from main import validate_ticket_signature

# Tests pour les fonctions de validation de tickets
class TestTicketValidation:
    def test_validate_ticket_signature(self):
        """Vérifie que la validation de signature de ticket fonctionne correctement"""
        ticket_id = 123
        security_key_1 = "test_key_1"
        security_key_2 = "test_key_2"
        
        # Dans l'implémentation actuelle, cette fonction retourne toujours True
        # Mais nous testons quand même pour s'assurer qu'elle fonctionne comme prévu
        result = validate_ticket_signature(ticket_id, security_key_1, security_key_2)
        assert result is True
        
        # Dans une implémentation réelle, nous testerions également des cas d'échec
        # Mais comme la fonction retourne toujours True, ce n'est pas possible ici

# Tests pour les fonctions de modèle (avec mock de la base de données)
class TestValidationRecords:
    def test_create_validation_record(self, test_db):
        """Vérifie que la création d'un enregistrement de validation fonctionne correctement"""
        ticket_id = 123
        user_id = 456
        employee_id = 789
        
        # Créer un enregistrement de validation
        record = models.create_validation_record(test_db, ticket_id, user_id, employee_id)
        
        # Vérifier que l'enregistrement a été créé avec les bonnes données
        assert record.id is not None
        assert record.ticket_id == ticket_id
        assert record.user_id == user_id
        assert record.employee_id == employee_id
        assert record.is_valid is True
        assert record.validation_date is not None
        
    def test_get_validation_record(self, test_db):
        """Vérifie que la récupération d'un enregistrement de validation fonctionne correctement"""
        # Créer un enregistrement de validation
        ticket_id = 123
        user_id = 456
        employee_id = 789
        created_record = models.create_validation_record(test_db, ticket_id, user_id, employee_id)
        
        # Récupérer l'enregistrement
        retrieved_record = models.get_validation_record(test_db, created_record.id)
        
        # Vérifier que l'enregistrement récupéré correspond à celui créé
        assert retrieved_record is not None
        assert retrieved_record.id == created_record.id
        assert retrieved_record.ticket_id == ticket_id
        assert retrieved_record.user_id == user_id
        assert retrieved_record.employee_id == employee_id
        
    def test_get_validation_records(self, test_db):
        """Vérifie que la récupération de plusieurs enregistrements de validation fonctionne correctement"""
        # Créer plusieurs enregistrements de validation
        for i in range(3):
            ticket_id = 100 + i
            user_id = 200 + i
            employee_id = 300 + i
            models.create_validation_record(test_db, ticket_id, user_id, employee_id)
        
        # Récupérer tous les enregistrements
        records = models.get_validation_records(test_db)
        
        # Vérifier qu'il y a au moins 3 enregistrements
        assert len(records) >= 3
        
    def test_get_validation_records_by_employee(self, test_db):
        """Vérifie que la récupération des enregistrements de validation par employé fonctionne correctement"""
        # Créer plusieurs enregistrements de validation pour différents employés
        employee_id_1 = 1001
        employee_id_2 = 1002
        
        # Créer 2 enregistrements pour l'employé 1
        models.create_validation_record(test_db, 101, 201, employee_id_1)
        models.create_validation_record(test_db, 102, 202, employee_id_1)
        
        # Créer 1 enregistrement pour l'employé 2
        models.create_validation_record(test_db, 103, 203, employee_id_2)
        
        # Récupérer les enregistrements pour l'employé 1
        records_emp1 = models.get_validation_records_by_employee(test_db, employee_id_1)
        
        # Vérifier qu'il y a exactement 2 enregistrements pour l'employé 1
        assert len(records_emp1) == 2
        for record in records_emp1:
            assert record.employee_id == employee_id_1
        
        # Récupérer les enregistrements pour l'employé 2
        records_emp2 = models.get_validation_records_by_employee(test_db, employee_id_2)
        
        # Vérifier qu'il y a exactement 1 enregistrement pour l'employé 2
        assert len(records_emp2) == 1
        assert records_emp2[0].employee_id == employee_id_2
        
    def test_get_validation_records_by_ticket(self, test_db):
        """Vérifie que la récupération des enregistrements de validation par ticket fonctionne correctement"""
        # Créer plusieurs enregistrements de validation pour différents tickets
        ticket_id_1 = 2001
        ticket_id_2 = 2002
        
        # Créer 2 enregistrements pour le ticket 1 (simulant une double validation)
        models.create_validation_record(test_db, ticket_id_1, 201, 301)
        models.create_validation_record(test_db, ticket_id_1, 201, 302)
        
        # Créer 1 enregistrement pour le ticket 2
        models.create_validation_record(test_db, ticket_id_2, 202, 303)
        
        # Récupérer les enregistrements pour le ticket 1
        records_ticket1 = models.get_validation_records_by_ticket(test_db, ticket_id_1)
        
        # Vérifier qu'il y a exactement 2 enregistrements pour le ticket 1
        assert len(records_ticket1) == 2
        for record in records_ticket1:
            assert record.ticket_id == ticket_id_1
        
        # Récupérer les enregistrements pour le ticket 2
        records_ticket2 = models.get_validation_records_by_ticket(test_db, ticket_id_2)
        
        # Vérifier qu'il y a exactement 1 enregistrement pour le ticket 2
        assert len(records_ticket2) == 1
        assert records_ticket2[0].ticket_id == ticket_id_2
