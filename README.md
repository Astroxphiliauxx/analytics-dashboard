# Analytics Dashboard

A full-stack analytics dashboard for transaction monitoring and payment analytics, built with a Spring Boot backend and a React (Vite) frontend. It provides GTV/volume trends, transaction success metrics, payment method distribution, hourly peak traffic, and a toucan-themed UI.

## Features

- **Dashboard overview**
  - Total GTV, total transactions, active users, success rate
  - Average ticket size and operational health indicators
- **Advanced Date Filtering**
  - Modern, ocean-themed calendar picker
  - Persistent date filtering across pages (via Context API)
- **Data Export**
  - Export filtered dashboard data and transactions
  - Support for JSON and CSV formats
  - Client-side export logic (no extra API calls)
- **Volume vs Value trend**
  - Daily transaction counts and total amounts over a selected date range
  - Status breakdown (SUCCESS / FAILED / PENDING) per day
- **Payment methods analytics**
  - Distribution of transactions by payment method
  - Percentage share and counts per method
- **Hourly peak traffic**
  - Hour-of-day traffic visualization across the dataset
  - Success / failed / pending counts per hour
- **Transactions table**
  - Paginated list of transactions with filters
  - Detailed exports (JSON/CSV) for current view
  - Status, amount, user, method, and timestamp columns
- **Toucan dark theme**
  - Dark UI with black background and emerald/orange accents
  - Responsive layout with bordered navigation

## Tech Stack

### Backend

- Java 21
- Spring Boot 3 (Web, Data JPA, Validation)
- PostgreSQL (relational database)
- Maven (build tool)

Backend root: `backend/`

### Frontend

- React + Vite
- Recharts (data visualization)
- Tailwind CSS (utility-first styling)
- Axios (HTTP client)

Frontend root: `frontend/`

## Project Structure

- `backend/` – Spring Boot application (REST API, domain, persistence)
- `frontend/` – React SPA (dashboard UI, charts, tables)
- `LICENSE` – Project license

## Backend Overview

### Main entry point

- `backend/src/main/java/com/toucanus/analytics_dashboard/AnalyticsDashboardApplication.java`

### Key packages

- `controller` – REST controllers (e.g. `/api/dashboard`, `/api/transactions`)
- `service` – Business logic for dashboard stats and graph analytics
- `service/graph` – Chart-specific aggregations (daily status, hourly traffic, payment methods)
- `repository` – Spring Data JPA repositories for `Transaction` and `User`
- `dto` – Data transfer objects for dashboard and graph responses
- `entity` – JPA entities (`Transaction`, `User`)
- `enums` – Domain enums (payment method, status, etc.)

### Notable endpoints (high level)

_All endpoints are served under `/api` by the backend._

- `GET /api/dashboard/stats` – Overall dashboard KPIs
- `GET /api/dashboard/stats/filtered` – KPIs filtered by `startDate` and `endDate`
- `GET /api/dashboard/analytics/daily` – Daily status and amount stats (date range)
- `GET /api/dashboard/analytics/payment-methods` – Payment method distribution (optional date range)
- `GET /api/dashboard/analytics/hourly-traffic` – Hourly traffic stats (optional date range)
- `GET /api/transactions` – Paginated, filterable transaction list

> Note: Exact request/response shapes are defined in the DTO classes under `backend/src/main/java/com/toucanus/analytics_dashboard/dto`.

### Backend configuration

Configuration file:

- `backend/src/main/resources/application.properties`

Typical properties you will need to set (values are examples):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/analytics_db
spring.datasource.username=analytics
spring.datasource.password=analytics
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

## Frontend Overview

The frontend is a single-page application that consumes the backend REST API and renders dashboards and tables.

### Entry points

- `frontend/index.html` – HTML shell
- `frontend/src/main.jsx` – React entry point
- `frontend/src/App.jsx` – Top-level routing/layout wrapper

### Main pages

- `frontend/src/pages/Overview.jsx`
  - Dashboard overview, daily trend, payment methods, hourly peak traffic
- `frontend/src/pages/Analytics.jsx`
  - Advanced analytics with date-range filters
- `frontend/src/pages/Transactions.jsx`
  - Transactions table with filters, pagination, and status badges

### API client

- `frontend/src/lib/api.js`
  - Wraps Axios calls to the backend:
    - `getDashboardStats`, `getFilteredDashboardStats`
    - `getDailyAnalytics`, `getPaymentStats`, `getHourlyTraffic`
    - `getTransactions`

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Java 21
- Maven 3.9+
- PostgreSQL (or compatible database) running locally

### 1. Clone the repository

```bash
git clone https://github.com/your-org/analytics-dashboard.git
cd analytics-dashboard
```

### 2. Configure the backend

1. Create a PostgreSQL database (for example `analytics_db`).
2. Create a user with privileges on that database.
3. Update `backend/src/main/resources/application.properties` with your DB credentials.

### 3. Run the backend

From the `backend/` directory:

```bash
cd backend
./mvnw spring-boot:run         # Unix/macOS
# or
mvnw.cmd spring-boot:run       # Windows
```

The backend will start on `http://localhost:8080` by default.

### 4. Run the frontend

In a separate terminal, from the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start (by default) on `http://localhost:5173` and will proxy API calls to the backend base URL defined in `frontend/src/lib/api.js`.

## Development

- The frontend uses Vite with hot module replacement (HMR) for a fast feedback loop.
- The backend is a typical Spring Boot app; you can run it via your IDE or Maven.
- Charts (Recharts) and Tailwind-based components are structured by page under `frontend/src/pages`.

### Running tests

_Backend_

```bash
cd backend
./mvnw test
```

_Frontend_

If you add tests (e.g. with Vitest), document the commands here.

## Contributing

Contributions are welcome! To propose changes:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes with clear messages.
4. Open a pull request describing the motivation and changes.

Please run the backend and frontend locally, and ensure there are no lint or test failures before submitting a PR.

## License

This project is licensed under the terms described in the [LICENSE](LICENSE) file.
