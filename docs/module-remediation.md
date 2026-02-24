# Remédiation

Le module Remédiation offre un Kanban pour suivre et prioriser les actions correctives issues des contrôles non conformes.

## Rôle du module

Chaque contrôle identifié comme non conforme lors d'un run génère une tâche de remédiation. Ce module permet de visualiser, organiser et suivre l'avancement de ces tâches jusqu'à leur résolution. Les tâches ont un **assigné** (exécutant), un **lead** (responsable du suivi) et une liste de **concernés** (personnes impliquées ou à informer). Voir le [glossaire](glossary) pour les définitions.

## Ce que vous pouvez y faire

- **Visualiser le Kanban** — Les tâches sont organisées en colonnes (À faire, En cours, Terminé)
- **Déplacer les tâches** — Faites glisser les cartes entre les colonnes pour refléter l'avancement
- **Prioriser** — Identifiez les tâches les plus critiques à traiter en premier
- **Assigner une tâche** — Choisir l'assigné et le lead via le sélecteur d'utilisateur (liste des utilisateurs de la plateforme)
- **Gérer les concernés** — Ajouter ou retirer des personnes concernées par une tâche (liste affichée dans le détail, boutons ajouter/supprimer)
- **Consulter le détail** — Chaque tâche indique le contrôle d'origine, l'objet concerné, la checklist associée, l'assigné, le lead et les concernés
- **Filtrer** — Par objet, projet, priorité, assignation, ou filtre **« Mes tâches »** (tâches où vous êtes assigné, lead ou concerné)

## Flux de travail

1. Un run de checklist identifie des contrôles non conformes
2. Des tâches de remédiation sont automatiquement créées dans la colonne "À faire"
3. Les équipes assignent les tâches (assigné et éventuellement lead) et les déplacent vers "En cours". Les concernés peuvent suivre la tâche sans être forcément assignés
4. Une fois la correction appliquée et vérifiée, la tâche passe en "Terminé"
5. Un nouveau run peut être lancé pour confirmer la conformité

## Accès

- **Lecture** : permission `read` sur `task`
- **Modification** : permission `update` sur `task`
- **Création manuelle** : permission `create` sur `task`

Les utilisateurs listés comme assigné, lead ou concerné voient la tâche dans le filtre « Mes tâches ».

## Référence API

Pour les intégrateurs : endpoints et champs de réponse pour l'assigné, le lead et les concernés sont décrits dans [Référence API assignation et concernés](api-assignment-and-concerned).
