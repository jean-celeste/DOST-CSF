# DOST-CSF (Customer Satisfaction Feedback System)

## Overview
DOST-CSF is a Customer Satisfaction Feedback System developed for the Department of Science and Technology. This system allows customers to provide feedback on various services and activities through a user-friendly interface.

## Project Structure
```
DOST-CSF/
├── next/                  # Next.js application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   └── package.json      # Next.js dependencies
└── README.md             # Project documentation
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

## Features
- Customer feedback collection
- Service evaluation forms
- Real-time data processing
- User-friendly interface

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
