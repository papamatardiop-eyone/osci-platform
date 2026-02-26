# Projets

Le module Projets permet de structurer vos évaluations de sécurité par périmètre.

## Rôle du module

Un projet de sécurité regroupe un ensemble d'objets et de checklists autour d'un périmètre défini (un projet métier, une campagne d'audit, une initiative de conformité). Il fournit une vue consolidée du score et de l'avancement. Chaque projet a un **lead** (responsable, champ "Owner" dans l'interface) et une **liste de concernés** (personnes impliquées ou à informer). Voir le [glossaire](glossary) pour les définitions.

## Ce que vous pouvez y faire

### Liste des projets

- **Consulter** tous les projets avec leur score, nombre d'objets et état d'avancement
- **Filtrer** par statut ou par propriétaire
- **Filtrer** par **« Projets où je suis concerné »** pour n'afficher que les projets dont vous êtes le lead (owner) ou un des concernés
- **Créer** un nouveau projet

### Détail d'un projet

- **Vue d'ensemble** — Score consolidé, nombre d'objets, progression globale
- **Lead (Owner)** — Consulter et modifier le responsable du projet via le sélecteur d'utilisateur
- **Concernés** — Consulter la liste des personnes concernées, en ajouter ou en retirer (avec les droits de modification du projet)
- **Gérer les objets** — Ajouter ou retirer des objets du projet
- **Voir les checklists** — Checklists appliquées aux objets du projet
- **Suivre les runs** — Historique des exécutions et évolution du score
- **Consulter les tâches** — Tâches de remédiation liées aux objets du projet (assigné, lead et concernés affichés pour chaque tâche)

## Accès

- **Lecture** : permission `read` sur `project`
- **Création** : permission `create` sur `project`
- **Modification** : permission `update` sur `project`
- **Suppression** : permission `delete` sur `project`

Seuls les utilisateurs avec permission de mise à jour peuvent modifier le lead (owner) et la liste des concernés.

## Référence API

Pour les intégrateurs : endpoints et champs de réponse pour l'owner et les concernés sont décrits dans [Référence API assignation et concernés](api-assignment-and-concerned).
