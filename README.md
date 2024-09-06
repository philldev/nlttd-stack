# Next.js Starter Template

This is a starter template for a Next.js project, pre-configured with tRPC, Drizzle, Lucia, Tailwind CSS, and ShadCN. It provides a solid foundation for building full-stack web applications with authentication, styling, and database management.

## Features

- **Next.js**: The React framework for production.
- **tRPC**: Type-safe APIs with zero boilerplate.
- **Drizzle**: Modern SQL ORM for TypeScript.
- **Lucia**: Lightweight and flexible authentication for TypeScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **ShadCN**: A collection of ready-made components for use with Tailwind CSS.

## Getting Started

### Project Structure

The project is structured as follows:

- `/app` : Contains the pages of the application.
- `/lib` : Contains utility functions.
- `/lucia` : Contains the Lucia Configuration.
- `/drizzle` : Contains the Drizzle Configuration.
- `/trpc` : Contains the tRPC Configuration.
- `/api/routers` : Contains the routes used by the tRPC instance.
- `/api/context` : Contains the context used by the tRPC instance.
- `/api/@client` : Contains the tRPC client instance.
- `/api/@server` : Contains the tRPC server instance.

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [bun](https://bun.sh/) or any other package manager supported by Next.js

### Installation

1. Clone the repository:

```bash
git clone https://github.com/philldev/nlttd-stack.git your-project-name
```

2. Navigate to the project directory:

```bash
cd your-project-name
```

3. Install dependencies:

```bash
bun install
```

4. Create a `.env.local` file in the root directory and add the following environment variables:

```bash
DATABASE_URL=your_database_url
DATABASE_AUTH_TOKEN=your_database_auth_token
```

5. Run drizzle database migrations:

```bash
bun run db:generate && bun run db:migrate
```

6. Run the development server:

```bash
bun dev
```

Your application should be running at [http://localhost:3000](http://localhost:3000).

## Deployment

To deploy the application, you can use any of the following methods:

- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b <branch-name>`.
3. Make your changes and commit them: `git commit -m '<commit-message>'`.
4. Push to the branch: `git push origin <branch-name>`.
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
