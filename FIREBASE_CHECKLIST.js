#!/usr/bin/env node
/**
 * Firebase Setup Checklist
 * Follow these steps to get your chat app running with Firebase
 */

const steps = [
  {
    step: 1,
    title: "Create Firebase Project",
    action: "Visit https://console.firebase.google.com",
    details: [
      "Click 'Create a new project'",
      "Name it 'Mohona-Abrar'",
      "Click 'Create project'"
    ]
  },
  {
    step: 2,
    title: "Create Realtime Database",
    action: "In Firebase Console",
    details: [
      "Go to Realtime Database",
      "Click 'Create Database'",
      "Choose US region",
      "Start in test mode",
      "Copy the database URL"
    ]
  },
  {
    step: 3,
    title: "Generate Service Account",
    action: "In Firebase Console",
    details: [
      "Go to Project Settings (gear icon)",
      "Click 'Service accounts'",
      "Click 'Generate new private key'",
      "Save the JSON file safely"
    ]
  },
  {
    step: 4,
    title: "Update .env.local",
    action: "Edit .env.local in project root",
    details: [
      "Add FIREBASE_DATABASE_URL='https://your-project.firebaseio.com'",
      "Add FIREBASE_SERVICE_ACCOUNT='{...full JSON...}'",
      "Save the file"
    ]
  },
  {
    step: 5,
    title: "Start the App",
    action: "Run in terminal",
    command: "npm run dev",
    details: [
      "Visit http://localhost:3000",
      "Login with test accounts:",
      "  Boy: Abrar / Abrarasif",
      "  Girl: Mohona / Mohona2024"
    ]
  }
];

console.log("\\n📋 Firebase Setup Checklist\\n");
console.log("================================\\n");

steps.forEach(s => {
  console.log(`Step ${s.step}: ${s.title}`);
  console.log(`   Action: ${s.action}`);
  if (s.command) console.log(`   Command: \${s.command}`);
  s.details.forEach(d => console.log(`   • ${d}`));
  console.log();
});

console.log("================================");
console.log("✅ For detailed guide, see FIREBASE_SETUP_GUIDE.md");
console.log("🚀 Happy chatting!\\n");
