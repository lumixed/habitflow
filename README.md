# HabitFlow

HabitFlow is a comprehensive habit tracking and accountability platform designed to help users build consistency through gamification, social interaction, and AI-driven insights. It provides a robust set of tools for monitoring progress, competing with friends, and maintaining long-term routines.

## Key Features

### Advanced Habit Tracking
- Flexible frequency options including daily, weekly, and specific weekdays.
- Dynamic streak tracking to monitor consecutive completions.
- Variable difficulty levels that scale experience point (XP) rewards.
- Detailed habit insights and completion history.

### Gamification System
- Leveling System: Earn XP by completing habits and participating in the community.
- Achievements: Unlock unique badges for hitting major milestones and maintaining consistency.
- Economy: Earn coins for daily activities and use them within the platform.
- Leaderboards: Compare progress against global users and friends.

### Artificial Intelligence Integration
- Success Probability: AI analyzes your history to predict the likelihood of maintaining a habit.
- Contextual Insights: Receive personalized encouragement and advice based on your current progress.
- Smart Suggestions: Discover new habits tailored to your goals and lifestyle.

### Social and Community
- Friends and Groups: Connect with other users to share progress and stay motivated.
- Challenges: Create or join group-based challenges with specific goals and durations.
- Social Feed: View a stream of achievements and milestones from your network.
- Collaborative Accountability: Support your friends with reactions and comments on their progress.

### Customization and Theme
- Consistent Branding: A high-performance interface with a fixed signature yellow accent color.
- Multiple Visual Modes: Choose between Classic, Soft Pastel, and high-contrast Cyberpunk themes.
- Responsive Design: Fully optimized for desktop, tablet, and mobile devices.

### Privacy and Security
- Two-Factor Authentication (2FA): Secure your account using authenticator apps.
- Data Ownership: Export your complete history in machine-readable JSON or CSV formats at any time.
- Retention Controls: Configure automatic data deletion policies to manage your digital footprint.
- Public/Private Profiles: Full control over who can see your activity and statistics.

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL

### Infrastructure
- Docker and Docker Compose
- Progressive Web App (PWA) support for native-like installation

## Getting Started

### Prerequisites
Ensure that Docker Desktop is installed and active on your system.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd habitflow
   ```

2. Launch the services:
   ```bash
   docker compose up --build
   ```

3. Initialize the database:
   In a separate terminal window, execute the Prisma migration:
   ```bash
   docker compose exec backend npx prisma migrate dev --name init
   ```

### Accessing the Application
- Frontend Interface: http://localhost:3000
- Backend API Health Check: http://localhost:3001/api/health

## License
This project is licensed under the MIT License.
