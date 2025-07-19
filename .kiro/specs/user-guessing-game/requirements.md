# Requirements Document

## Introduction

The User Guessing Game is an interactive web application where users create profiles and engage in a guessing game to identify other users based on their descriptions. Users sign in with Google, create profiles with personal descriptions, and then participate in chat-based guessing games with other users. The game assigns users randomly to each other, and points are awarded when users correctly guess who they're chatting with. The system continuously assigns new users to guess after successful completions, creating an engaging social experience.

## Requirements

### 1. User Authentication and Profile Creation

**User Story:** As a new user, I want to sign in with Google and create a profile, so that I can participate in the guessing game.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL display a Google sign-in option.
2. WHEN a user completes Google authentication THEN the system SHALL create a new user account if one doesn't exist.
3. WHEN a new user signs in for the first time THEN the system SHALL redirect them to a profile creation page.
4. WHEN a user is on the profile creation page THEN the system SHALL prompt for:
   - Name
   - Answers to predefined questions (all optional):
     * College Name
     * Favourite hobby
     * Favourite dish
     * Favourite sportsperson
     * Best movie you have ever seen
     * Relationship status (Single/Committed dropdown)
   - Additional personal description
   - Gemini API key
5. WHEN a user submits their profile information THEN the system SHALL validate all required fields.
6. WHEN profile creation is successful THEN the system SHALL save the user's information to the database.
7. WHEN profile creation is successful THEN the system SHALL redirect the user to the game interface.
8. IF a returning user signs in THEN the system SHALL redirect them directly to the game interface.

### 2. Game Matching System

**User Story:** As a player, I want the system to assign me another user to guess, so that I can play the game.

#### Acceptance Criteria

1. WHEN a user completes their profile or finishes a previous game THEN the system SHALL assign them a random user to guess.
2. WHEN assigning users THEN the system SHALL ensure users are not assigned to themselves.
3. WHEN assigning users THEN the system SHALL prioritize users who have not been guessed by the current user before.
4. IF no new users are available THEN the system SHALL select from previously guessed users with the oldest guess date first.
5. WHEN a user is assigned THEN the system SHALL record this assignment in the database.

### 3. Chat Interface

**User Story:** As a player, I want to chat with the system using another user's description, so that I can try to guess who they are.

#### Acceptance Criteria

1. WHEN a user enters the game interface THEN the system SHALL display a chat interface.
2. WHEN a chat session begins THEN the system SHALL use the assigned user's description to generate responses.
3. WHEN a user sends a message THEN the system SHALL process it using the Gemini API with the assigned user's description as context.
4. WHEN the Gemini API returns a response THEN the system SHALL display it in the chat interface.
5. WHEN generating responses THEN the system SHALL maintain consistency with the assigned user's description.
6. WHEN a chat is in progress THEN the system SHALL save the conversation history.

### 4. Guessing Mechanism

**User Story:** As a player, I want to guess the identity of the user I'm chatting with, so that I can earn points.

#### Acceptance Criteria

1. WHEN a user is in a chat session THEN the system SHALL provide a "Make a guess" option.
2. WHEN a user selects "Make a guess" THEN the system SHALL display a list of possible users to choose from.
3. WHEN displaying guess options THEN the system SHALL include the correct user and several decoys.
4. WHEN a user submits a guess THEN the system SHALL verify if the guess is correct.
5. IF the guess is correct THEN the system SHALL award one point to both the guesser and the guessed user.
6. IF the guess is incorrect THEN the system SHALL allow the user to continue chatting or make another guess.
7. WHEN a user makes 3 incorrect guesses THEN the system SHALL reveal the correct answer and end the game.

### 5. Points and Progression System

**User Story:** As a player, I want to earn points for correct guesses and be assigned new users to guess, so that I can continue playing.

#### Acceptance Criteria

1. WHEN a user makes a correct guess THEN the system SHALL increment their points by one.
2. WHEN a user is correctly guessed by another user THEN the system SHALL increment their points by one.
3. WHEN a game ends with a correct guess THEN the system SHALL update the points for both users in the database.
4. WHEN a game ends THEN the system SHALL assign a new user to guess.
5. WHEN a user views their profile THEN the system SHALL display their current points.

### 6. User Dashboard

**User Story:** As a player, I want to see my game statistics and history, so that I can track my progress.

#### Acceptance Criteria

1. WHEN a user accesses their dashboard THEN the system SHALL display:
   - Total points earned
   - Number of successful guesses made
   - Number of times they were successfully guessed
   - History of recent games
2. WHEN viewing game history THEN the system SHALL show the date, opponent, and outcome of each game.
3. WHEN a user has been guessed by others THEN the system SHALL show who guessed them correctly.

### 7. Data Management

**User Story:** As a system administrator, I want user data to be properly stored and managed, so that the game functions correctly and securely.

#### Acceptance Criteria

1. WHEN storing user data THEN the system SHALL use Supabase for database management.
2. WHEN storing sensitive information THEN the system SHALL ensure it is properly secured.
3. WHEN storing Gemini API keys THEN the system SHALL encrypt them before saving to the database.
4. WHEN a user deletes their account THEN the system SHALL remove all their personal data.
5. WHEN accessing user descriptions for the game THEN the system SHALL only retrieve necessary information.