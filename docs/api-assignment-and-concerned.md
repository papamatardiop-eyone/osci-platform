# Référence API : assignation et concernés

Ce document décrit les conventions et endpoints liés à l'assignation (owner, assigné, lead) et à la liste des concernés pour les projets et les tâches. Il s'adresse aux intégrateurs et développeurs.

## Convention d'identifiants

Tous les champs "utilisateur" (owner, assigné, lead, concernés) utilisent l'**UUID interne** de l'utilisateur dans OSCI (`User.id`), et non le subject OIDC (Keycloak). Les réponses API peuvent inclure des objets utilisateur résolus (id, email, firstName, lastName) pour éviter des appels supplémentaires.

---

## Projets

### Champs de réponse

Lors d'un `GET /projects/:id` (détail), la réponse peut inclure :

- `ownerId` — UUID du lead (owner) du projet
- `owner` — Objet utilisateur résolu : `{ id, email, firstName, lastName }`
- `concerned` — Liste d'objets utilisateur : `[{ id, email, firstName, lastName }, ...]`

### Endpoints concernés

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:id/concerned` | Liste des concernés (avec résolution utilisateur) |
| POST | `/projects/:id/concerned` | Ajouter un ou des concernés. Body : `{ userId: string }` ou `{ userIds: string[] }`. Les userId doivent exister (User.id). |
| DELETE | `/projects/:id/concerned/:userId` | Retirer un concerné |

Les appels POST et DELETE nécessitent la permission `update` ou `manage` sur le projet.

---

## Tâches

### Champs de réponse

Lors d'un `GET /tasks` ou `GET /tasks/:id`, les réponses peuvent inclure :

- `assignedToId` — UUID de l'assigné (exécutant)
- `assignedTo` — Objet utilisateur résolu : `{ id, email, firstName, lastName }`
- `leadId` — UUID du lead (responsable du suivi), optionnel
- `lead` — Objet utilisateur résolu pour le lead
- `concerned` — Liste d'objets utilisateur concernés

### Endpoints concernés

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/:id/concerned` | Liste des concernés (avec résolution utilisateur) |
| POST | `/tasks/:id/concerned` | Ajouter un ou des concernés. Body : `{ userId: string }` ou `{ userIds: string[] }`. |
| DELETE | `/tasks/:id/concerned/:userId` | Retirer un concerné |

Les appels POST et DELETE nécessitent la permission `update` ou `manage` sur la tâche.

---

## Filtres

### Mes tâches

`GET /tasks?concernedUserId=<userId>` retourne les tâches où l'utilisateur identifié par `userId` (User.id) est :

- l'assigné (`assignedToId`), ou
- le lead (`leadId`), ou
- présent dans la liste des concernés de la tâche.

Utilisez l'identifiant de l'utilisateur connecté pour afficher "Mes tâches".

### Projets où je suis concerné

`GET /projects?concernedUserId=<userId>` retourne les projets où l'utilisateur identifié par `userId` (User.id) est :

- le lead (owner) du projet (`ownerId`), ou
- présent dans la liste des concernés du projet.

Utilisez l'identifiant de l'utilisateur connecté pour afficher "Projets où je suis concerné".

---

## Voir aussi

- [Module Projets](module-projects) — Guide utilisateur
- [Module Remédiation](module-remediation) — Guide utilisateur
- [Glossaire](glossary) — Définitions de Assigné, Lead, Concernés, User.id
