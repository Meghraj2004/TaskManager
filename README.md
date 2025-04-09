# Task Manager Application

A full-stack Task Manager application using React.js and Firebase, providing a robust task management solution with comprehensive CRUD functionality and seamless user experience.

## Features

- Task Creation, Editing, and Deletion
- Task Filtering and Search
- Task Categories
- Priority Levels
- Due Dates
- Theme Customization (Light/Dark mode)
- Notification Settings

## Tech Stack

- React.js (Frontend)
- Firebase (Authentication & Database)
- Express.js (Backend API)
- Tailwind CSS & Shadcn UI (Styling)

## Running the Application Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

3. Configure Firebase:
   - Copy `client/src/lib/firebase.local.js.example` to `client/src/lib/firebase.local.js`
   - Update `firebase.local.js` with your Firebase credentials
   
   OR
   
   - Add the following variables to your `.env` file:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser to `http://localhost:5000`

## Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database in test mode
4. Add your web app to the Firebase project to get the configuration keys

## Deployment

This application can be easily deployed on Replit by clicking the "Deploy" button.

## License

MIT