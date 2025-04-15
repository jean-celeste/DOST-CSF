# DOST-CSF (Customer Satisfaction Feedback System)

## Overview
DOST-CSF is a Customer Satisfaction Feedback System developed for the Department of Science and Technology. This system allows customers to provide feedback on various services and activities through a user-friendly interface. The system includes multiple feedback forms such as CSM-ARTA and QMS, each with specific rating and checkmark components.

## Project Structure
```
DOST-CSF/
├── next/                  # Next.js application
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   │   ├── forms/    # Form components (CSM-ARTA, QMS)
│   │   │   └── ui/       # Reusable UI components
│   │   ├── lib/          # Utility functions and configurations
│   │   │   ├── db/       # Database utilities
│   │   │   ├── options/  # Form options and configurations
│   │   │   └── questions/# Question fetching and grouping
│   │   └── public/       # Static assets (images, emojis)
│   └── package.json      # Next.js dependencies
└── README.md             # Project documentation
```

## Features
- **Multiple Feedback Forms**
  - CSM-ARTA (Citizen Satisfaction Measurement - Anti-Red Tape Act)
  - QMS (Quality Management System)
- **Dynamic Question Loading**
  - Questions fetched from database
  - Grouped into checkmark and rating questions
- **Interactive UI Components**
  - Rating questions with emoji reactions
  - Checkmark questions for multiple selections
  - Progress indicators
  - Responsive design
- **Form Management**
  - Multi-step forms
  - Review mode
  - Data validation
  - Form state management
- **Data Storage**
  - Clean JSON structure for responses
  - Question IDs as keys for ratings
  - Automatic customer data management
  - Transaction-based submissions

## Recent Updates
- **Form Submission Improvements**
  - Removed UI state data (currentPage) from stored responses
  - Transformed question numbers to question IDs in stored data
  - Implemented cleaner JSON structure for responses
  - Added transaction support for data consistency

## Data Structure
### Response Format
```json
{
  "csmARTACheckmark": {
    "selectedOption": "string",
    "additionalAnswers": {
      "question_id": "answer"
    }
  },
  "csmARTARatings": {
    "ratings": {
      "question_id": "rating_value"
    }
  },
  "qmsCheckmark": {
    "selections": {
      "question_text": boolean
    }
  },
  "qmsRatings": {
    "ratings": {
      "question_id": "rating_value"
    }
  },
  "suggestion": {
    "generalComments": "string",
    "reasonForLowScore": "string"
  }
}
```

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (for database)

## Getting Started

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd DOST-CSF
   ```

2. Install dependencies:
   ```bash
   cd next
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `next` directory with the following variables:
   ```
   DATABASE_URL=your_database_url
   ```

### Database Setup
1. Create a PostgreSQL database
2. Run the database migrations
3. Seed the database with initial questions and options

### Development
To start the development server:
```bash
cd next
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production
```bash
cd next
npm run build
npm start
```

## Form Types

### CSM-ARTA Form
- Form ID: 1
- Checkmark questions (IDs 1-3)
- Rating questions (IDs 4-12)
- Includes N/A option for ratings

### QMS Form
- Form ID: 3
- Checkmark questions (IDs 31-35)
- Rating questions (IDs 26-30)
- Standard rating options

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## User Story
For detailed user stories and requirements, please refer to:
[User Story Document](https://docs.google.com/document/d/1_NKkEVwhmUwQ5fSW3OPrTJYN5gfwMXq5lQCq2le8lLg/edit?tab=t.0)

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For any questions or concerns, please contact the development team.
