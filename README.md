# FlashCard – Mobile Flashcard Learning Application

> **Repository:** [G7FlashCard/FlashCard](https://github.com/G7FlashCard/FlashCard)  
> **Application type:** Mobile learning application  
> **Framework:** React Native + Expo  
> **Navigation:** Expo Router  
> **License:** MIT (see `LICENSE`)

> **Documentation note:** This document describes the repository's publicly visible structure and project description. Where a specific implementation detail could not be verified from the repository view, it is described as a conceptual flow rather than a claim about the exact source code. Update the file-by-file sections after reviewing the complete source tree.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Purpose](#2-purpose)
3. [Main Features](#3-main-features)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Repository Structure](#6-repository-structure)
7. [Root Files](#7-root-files)
8. [Application Directory](#8-application-directory)
9. [Assets Directory](#9-assets-directory)
10. [Screens Directory](#10-screens-directory)
11. [Application Startup Flow](#11-application-startup-flow)
12. [Navigation Flow](#12-navigation-flow)
13. [Overall User Flow](#13-overall-user-flow)
14. [Flashcard Management Flow](#14-flashcard-management-flow)
15. [Study Session Flow](#15-study-session-flow)
16. [Quiz Flow](#16-quiz-flow)
17. [Timeline Flow](#17-timeline-flow)
18. [Friends Flow](#18-friends-flow)
19. [Profile Flow](#19-profile-flow)
20. [Progress Tracking](#20-progress-tracking)
21. [Conceptual Data Flow](#21-conceptual-data-flow)
22. [Component Responsibilities](#22-component-responsibilities)
23. [Configuration](#23-configuration)
24. [Installation](#24-installation)
25. [Running the Application](#25-running-the-application)
26. [Development Workflow](#26-development-workflow)
27. [Testing Checklist](#27-testing-checklist)
28. [Troubleshooting](#28-troubleshooting)
29. [Security Considerations](#29-security-considerations)
30. [Possible Future Improvements](#30-possible-future-improvements)
31. [Conclusion](#31-conclusion)

---

## 1. Project Overview

**FlashCard** is a mobile flashcard learning application designed to help learners organize study materials, review concepts, take quizzes, and monitor learning activity.

A typical flashcard contains a prompt on the front and its answer or explanation on the back. Organizing cards into decks allows users to study by subject or topic.

The repository's project description also identifies social and progress-oriented features, including Timeline, Friends, Profile, daily goals, and learning-progress tracking.

## 2. Purpose

The application aims to make studying more organized and interactive by bringing common learning activities into one mobile application.

A learner's general workflow is:

1. Create or select a study deck.
2. Add or review flashcards.
3. Practice recalling answers.
4. Take a quiz based on study material.
5. Review quiz results.
6. Monitor learning activity and progress.

## 3. Main Features

### 3.1 Flashcard decks
Decks group cards by subject, course, or topic. For example:

```text
Science
├── Biology
├── Chemistry
└── Physics

Programming
├── Java
├── JavaScript
└── Python
```

### 3.2 Flashcard study
Users review a prompt, reveal its answer, and move through the deck.

### 3.3 Quizzes
The quiz workflow turns learning material into an assessment. A quiz may involve selecting questions, answering them, submitting responses, and viewing a result.

### 3.4 Timeline
The Timeline is intended to show learning-related activities in chronological order, such as completed study sessions or quiz activity.

### 3.5 Friends
The Friends feature supports social learning and connections between learners.

### 3.6 Profile
The Profile is a personal area for user information and learning-related activity.

### 3.7 Progress tracking
The project description includes daily goals, cards-studied tracking, quiz scores, and learning progress.

---

## 4. Technology Stack

The repository uses the following technologies and packages (refer to `package.json` for the authoritative dependency versions):

| Technology | Role |
|---|---|
| React | Component-based UI |
| React Native | Native mobile interface |
| Expo | Development and runtime tooling |
| Expo Router | File-based navigation |
| TypeScript tooling | Type checking and editor support |
| `@expo/vector-icons` | Icon resources |
| `expo-speech` | Text-to-speech capability |
| `expo-document-picker` | Device document selection |
| `react-native-svg` | SVG rendering support |

The exact versions may change as the project is updated.

---

## 5. System Architecture

At a high level, the application is organized around route/screen presentation and learning features.

```text
                    FlashCard Mobile App
                            |
                            v
                       Expo Runtime
                            |
                            v
                       Expo Router
                            |
           +----------------+----------------+
           |                |                |
           v                v                v
        Decks/Study         Quiz          User Areas
           |                |           /     |     \
           v                v          v      v      v
       Flashcards       Quiz Results  Timeline Friends Profile
           \                |           \      |      /
            +---------------+------------+-----+-----+
                            |
                            v
                    Learning Progress
```

This is a **conceptual feature diagram**, not a claim about the exact component tree or backend implementation.

---

## 6. Repository Structure

The top-level repository structure includes:

```text
FlashCard/
├── .claude/
├── app/
├── assets/
├── screens/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── app.json
├── index.js
├── package-lock.json
├── package.json
└── tsconfig.json
```

### Directory summary

| Path | Purpose |
|---|---|
| `.claude/` | Project resources or instructions for Claude-oriented workflows |
| `app/` | Expo Router routes and layouts |
| `assets/` | Images, icons, fonts, and other static resources |
| `screens/` | Screen-related implementation, as organized by this project |

The exact contents of nested directories should be verified against the current checkout, because file names and structure can change.

---

## 7. Root Files

### `index.js`
The repository's JavaScript entry file. Expo Router is configured as the package entry in `package.json`; check the current `index.js` and package configuration together when investigating startup behavior.

### `package.json`
Defines project metadata, scripts, and dependencies. It is the first place to check when determining which libraries the application uses and how it is started.

Typical project commands are:

```bash
npm start
npm run android
npm run ios
npm run web
```

Use the scripts actually present in the checked-out `package.json` as the source of truth.

### `package-lock.json`
Locks the dependency tree used by npm, helping keep installs consistent across machines.

### `app.json`
Contains Expo application configuration, such as app name, version, orientation, platform settings, assets, and plugins.

### `tsconfig.json`
Configures TypeScript behavior and editor/type-checking support.

### `README.md`
Provides the project's introductory description and feature overview.

### `LICENSE`
Contains the project's license terms. Review this file before redistributing or reusing the code.

### `.gitignore`
Lists local or generated files that Git should ignore.

### `AGENTS.md` and `CLAUDE.md`
Provide project guidance for development assistants or coding workflows. They are not normally part of the mobile app's runtime flow.

---

## 8. Application Directory

The `app/` directory is central to Expo Router. Expo Router uses file-based routing: route files and layout files define navigable parts of the application.

A typical Expo Router project may use files such as `_layout.tsx` for shared layouts and route files for screens. **Treat those names as examples only unless they exist in the current repository.**

When documenting a route, record:

- Its actual path and filename
- What screen it displays
- How a user reaches it
- Where its navigation actions lead
- What data it reads or updates

---

## 9. Assets Directory

The `assets/` directory stores static resources used by the app. The Expo configuration references application icon resources and a web favicon.

Common asset categories include:

- App icons
- Images and illustrations
- Fonts
- Platform-specific icon variants
- Other static files

When adding an asset, use a stable path and update the relevant component or Expo configuration that references it.

---

## 10. Screens Directory

The repository includes a `screens/` directory for screen-related code. Its exact relationship with `app/` should be confirmed by following the imports in the current source.

A common separation is:

- `app/`: route definitions and navigation layouts
- `screens/`: screen UI and behavior

If the project uses this pattern, a route file may render or import a screen implementation. Avoid duplicating route logic in multiple places.

---

## 11. Application Startup Flow

The high-level startup process is:

```text
User launches app
       |
       v
Expo runtime initializes
       |
       v
Configured application entry loads
       |
       v
Expo Router resolves the initial route
       |
       v
Initial layout/screen renders
       |
       v
User begins interacting
```

The exact initial screen is determined by the route configuration and the current source files.

---

## 12. Navigation Flow

The feature-level navigation can be represented as:

```text
                         Main App
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
           Decks          Timeline       Profile
             |
        +----+----+
        |         |
        v         v
      Study      Quiz

Friends is another social feature area.
```

For precise route names and navigation destinations, inspect the actual route files and navigation calls in `app/` and related screen code.

---

## 13. Overall User Flow

```text
Open FlashCard
      |
      v
Enter main application
      |
      v
Choose a feature
      |
      +------> Decks
      |          |
      |          +----> Create/select deck
      |          |           |
      |          |           +----> Study cards
      |          |           |
      |          |           +----> Take quiz
      |          |
      +------> Timeline
      |
      +------> Friends
      |
      +------> Profile
```

After a study or quiz activity, the application may update progress-related information according to its implemented data logic.

---

## 14. Flashcard Management Flow

### Creating a deck

```text
Choose create-deck action
          |
          v
Enter deck details
          |
          v
Validate input
          |
          v
Save deck
          |
          v
Deck appears in deck list
```

### Adding a flashcard

```text
Open a deck
    |
    v
Add card
    |
    v
Enter prompt and answer
    |
    v
Validate and save
    |
    v
Card becomes available for study
```

### Reviewing a deck

```text
Select deck
    |
    v
Start study
    |
    v
Show prompt
    |
    v
Reveal answer
    |
    v
Move to next card
    |
    v
Repeat until finished
```

These diagrams describe the expected feature flow. Confirm the exact fields, validation rules, and save behavior in the source code.

---

## 15. Study Session Flow

A study session commonly follows this sequence:

1. The learner selects a deck.
2. The app obtains the deck's cards.
3. The current card's prompt is displayed.
4. The learner attempts to recall the answer.
5. The answer is revealed.
6. The learner proceeds to another card.
7. The session ends when the cards are completed or the learner exits.

```text
Load deck
   |
   v
Display current card
   |
   v
Reveal answer
   |
   v
Advance card index
   |
   v
More cards?
  /      \
Yes      No
 |        |
 v        v
Repeat  Finish session
```

---

## 16. Quiz Flow

### Quiz setup

```text
Choose deck/material
        |
        v
Configure quiz
        |
        v
Start quiz
```

### Quiz session

```text
Display question
       |
       v
Record answer
       |
       v
Move to next question
       |
       v
All questions answered?
       |
       v
Submit quiz
       |
       v
Evaluate answers
       |
       v
Display result
```

A simple percentage calculation is:

```text
percentage = (correctAnswers / totalQuestions) * 100
```

The actual question types, scoring rules, and result persistence must be taken from the implementation.

---

## 17. Timeline Flow

The Timeline is intended to present learning activities in time order.

```text
User completes an activity
          |
          v
Activity information is produced
          |
          v
Timeline obtains activity data
          |
          v
Activity item is displayed
```

Possible activity types include study sessions, quiz results, or deck-related actions, depending on what the current code records.

---

## 18. Friends Flow

The Friends feature supports connections between learners.

A conceptual flow is:

```text
Open Friends
     |
     v
Find or select a learner
     |
     v
Initiate friend action
     |
     v
Relationship is reflected in UI
     |
     v
View friend information/activity
```

The repository's implementation should be consulted to determine whether friend requests, search, activity sharing, or other social operations are fully implemented.

---

## 19. Profile Flow

The Profile provides a user-focused view.

It may bring together:

- User information
- Deck-related activity
- Study statistics
- Quiz activity
- Learning progress

To document the exact profile fields, follow the data source and rendering code used by the profile screen.

---

## 20. Progress Tracking

The project description mentions daily goals, cards studied, quiz scores, and learning progress.

A conceptual relationship is:

```text
Study activity ----> Cards-studied count
Quiz submission ---> Quiz score
Daily activity ----> Goal progress
                         |
                         v
                  Progress display
```

The actual calculation, reset period, and storage behavior should be verified in the code before being treated as implementation facts.

---

## 21. Conceptual Data Flow

```text
User action
    |
    v
Screen/component event handler
    |
    v
Application logic
    |
    v
Data updated or retrieved
    |
    v
UI re-renders with resulting state
```

The repository should be checked to identify the actual data source—for example, component state, local storage, a database, or a remote API. This document does not assume a backend or persistence mechanism that has not been verified.

When documenting data flow for a specific feature, identify:

1. Where the data originates.
2. Which component or function reads it.
3. How user input changes it.
4. Where the updated data is stored.
5. Which screens display the result.

---

## 22. Component Responsibilities

A maintainable component-based app typically separates these concerns:

| Concern | Responsibility |
|---|---|
| Routes/layouts | Navigation and shared screen structure |
| Screens | Compose the UI for a complete view |
| Reusable components | Render repeated UI patterns |
| Event handlers | Respond to taps, input, and gestures |
| Data logic | Read, validate, calculate, or update information |
| Assets | Provide static images, icons, and fonts |

Potential reusable UI patterns include deck cards, flashcards, quiz questions, progress indicators, profile headers, and activity items. These are examples, not a verified inventory of current component filenames.

---

## 23. Configuration

Review `app.json` and `package.json` for the current configuration.

Important items to document when they change:

- App name and slug
- App version
- Orientation
- URL scheme
- iOS configuration
- Android configuration
- Web configuration
- Expo plugins
- Application icon paths
- Router entry
- Dependency versions

---

## 24. Installation

### Prerequisites

Install:

- Node.js (a version compatible with the project's Expo SDK)
- npm
- Git
- Android Studio, if developing for Android
- Xcode, if developing for iOS (macOS required)

### Clone the repository

```bash
git clone https://github.com/G7FlashCard/FlashCard.git
cd FlashCard
```

### Install dependencies

```bash
npm install
```

---

## 25. Running the Application

Start the Expo development server:

```bash
npm start
```

Depending on the scripts and local environment, the following commands may also be available:

```bash
npm run android
npm run ios
npm run web
```

If a command is not defined in the current `package.json`, use the corresponding Expo CLI command or update this section to match the repository.

---

## 26. Development Workflow

A typical team workflow is:

```text
Pull latest changes
       |
       v
Create feature branch
       |
       v
Implement change
       |
       v
Run app and test
       |
       v
Review changes
       |
       v
Commit and push
       |
       v
Open pull request
```

Example:

```bash
git checkout -b feature/quiz-improvements
git add .
git commit -m "Improve quiz flow"
git push origin feature/quiz-improvements
```

---

## 27. Testing Checklist

### Flashcards
- [ ] A deck can be created.
- [ ] A card can be added.
- [ ] Prompt and answer display correctly.
- [ ] Answer reveal works.
- [ ] Next/previous behavior works as intended.
- [ ] Empty decks are handled gracefully.

### Quizzes
- [ ] Quiz setup works.
- [ ] Questions display correctly.
- [ ] Answers are recorded.
- [ ] Submission works.
- [ ] Score calculation is correct.
- [ ] Result screen handles edge cases.

### Navigation
- [ ] Main routes open.
- [ ] Back navigation behaves correctly.
- [ ] No route produces an unexpected blank screen.
- [ ] Navigation actions point to valid routes.

### UI and accessibility
- [ ] Layout works on different screen sizes.
- [ ] Text does not overflow.
- [ ] Buttons are easy to tap.
- [ ] Keyboard does not obscure important fields.
- [ ] Contrast and accessibility labels are appropriate.

---

## 28. Troubleshooting

### Dependencies are missing

```bash
npm install
```

### Clear Expo's cache

```bash
npx expo start -c
```

### Route does not open

Check the route filename and navigation destination in `app/`. Expo Router derives routes from files, so path mismatches can cause navigation issues.

### App fails to start

1. Check the Node.js version.
2. Review the terminal error.
3. Confirm dependencies are installed.
4. Check `package.json` and `app.json`.
5. Restart Expo after correcting the issue.

On Windows Command Prompt, if a clean dependency install is necessary:

```cmd
rmdir /s /q node_modules
npm install
```

Only remove `node_modules`; do not delete project source files or the lockfile unless you intentionally mean to change dependency resolution.

---

## 29. Security Considerations

- Do not commit passwords, tokens, or private API keys.
- Validate user-provided text and other inputs.
- Avoid exposing private user information in public activity.
- If authentication is used, protect authenticated routes and data.
- If a backend is used, enforce authorization on the server as well as in the UI.
- Keep `.env` files containing secrets out of version control.

---

## 30. Possible Future Improvements

Potential enhancements, depending on project goals:

### Authentication and accounts
- Registration and login
- Password recovery
- Session management

### Data synchronization
- Cloud backup
- Multi-device synchronization
- Import/export of decks

### Learning tools
- Spaced repetition
- Study reminders
- More quiz formats
- Weak-topic analytics

### Accessibility
- Text-to-speech study mode
- Screen-reader labels
- Adjustable text sizes
- Improved contrast

### Engagement
- Study streaks
- Achievements
- Optional learning challenges

These are suggestions, not statements that the features already exist.

---

## 31. Conclusion

FlashCard is a mobile learning application centered on digital flashcards and supported by quizzes, learning progress, Timeline, Friends, and Profile features.

The project uses React Native and Expo, with Expo Router providing file-based navigation. The repository's root configuration files define the application setup and dependencies, while `app/`, `assets/`, and `screens/` organize the application routes, resources, and screen-related code.

The core learning cycle is:

```text
Create/select deck
       |
       v
Review flashcards
       |
       v
Take a quiz
       |
       v
Review result
       |
       v
Track learning progress
       |
       v
Continue studying
```

For the most accurate maintenance documentation, keep this file synchronized with the actual route files, screen components, data models, and persistence logic as the repository evolves.
