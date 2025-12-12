# GuideNest - Server ⚙️


**GuideNest** is a premium travel platform connecting curious travelers with passionate local experts. This repository contains the **Backend API**, a robust and scalable Node.js application that powers the GuideNest ecosystem.

It features a modular architecture, advanced data querying capabilities, and secure role-based access control to ensure a seamless experience for Tourists, Guides, and Administrators.

## ✨ Key Features

### 🔐 Authentication & Authorization
* **Secure Auth:** JWT-based authentication with Access and Refresh tokens.
* **RBAC:** Distinct permissions for `SUPER_ADMIN`, `ADMIN`, `GUIDE`, and `TOURIST`.
* **Password Security:** Bcrypt hashing and secure password change/reset flows.

### 🛠️ Core Functionality
* **Advanced Search Engine:**
    * Global search across Titles, Cities, and Countries simultaneously.
    * Dynamic filtering by Price Range, Duration, and Availability.
* **Transactional Workflows:**
    * **"Become a Guide":** Atomic transactions to handle user role upgrades and profile creation safely.
    * **Booking System:** Concurrency-safe booking management preventing double-bookings.
* **Data Management:**
    * Soft delete implementation for safety.
    * Pagination, Sorting, and Field Selection helper utilities.

### 🛡️ Architecture & Quality
* **Modular Pattern:** Code organized by feature modules (User, Tour, Booking, Auth) for scalability.
* **Type Safety:** Built with **TypeScript** and **Zod** for strict request validation.
* **ORM:** **Prisma** with PostgreSQL for type-safe database queries and schema management.
* **Global Error Handling:** Centralized error processing for consistent API responses.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Validation:** Zod
* **Authentication:** JSON Web Tokens (JWT)
* **Package Manager:** Bun (Recommended) or NPM/Yarn
* **Deployment:** Render / Railway

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (Local or Cloud instance like Neon/Supabase)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone [https://github.com/rafirabby13/tour-guide-server.git](https://github.com/rafirabby13/tour-guide-server.git)
cd tour-guide-server

# Using Bun (Recommended)
bun install

# Or using NPM
npm install
## 📁 Project Structure


```
src/
├─ app/
│  ├─ errors/
│  │  └─ AppError.ts
│  ├─ helpers/
│  │  ├─ fileUploader.ts
│  │  ├─ jwtHelper.ts
│  │  ├─ paginationHelper.ts
│  │  ├─ pick.ts
│  │  ├─ transactionId.ts
│  │  └─ validatePricing.ts
│  ├─ middlewares/
│  │  ├─ auth.ts
│  │  ├─ globalErrorHandlers.ts
│  │  └─ validateRequest.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ auth.controller.ts
│  │  │  ├─ auth.routes.ts
│  │  │  └─ auth.service.ts
│  │  ├─ booking/
│  │  │  ├─ booking.constant.ts
│  │  │  ├─ booking.controller.ts
│  │  │  ├─ booking.interface.ts
│  │  │  ├─ booking.lib.ts
│  │  │  ├─ booking.routes.ts
│  │  │  ├─ booking.service.ts
│  │  │  └─ booking.validation.ts
│  │  ├─ payment/
│  │  │  ├─ payment.controller.ts
│  │  │  ├─ payment.lib.ts
│  │  │  ├─ payment.routes.ts
│  │  │  └─ payment.service.ts
│  │  ├─ review/
│  │  │  ├─ review.constant.ts
│  │  │  ├─ review.controller.ts
│  │  │  ├─ review.interface.ts
│  │  │  ├─ review.routes.ts
│  │  │  ├─ review.service.ts
│  │  │  └─ review.validation.ts
│  │  ├─ stats/
│  │  │  ├─ stats.controller.ts
│  │  │  ├─ stats.interface.ts
│  │  │  ├─ stats.routes.ts
│  │  │  └─ stats.service.ts
│  │  ├─ tour/
│  │  │  ├─ tour.constant.ts
│  │  │  ├─ tour.controller.ts
│  │  │  ├─ tour.interface.ts
│  │  │  ├─ tour.lib.ts
│  │  │  ├─ tour.routes.ts
│  │  │  ├─ tour.service.ts
│  │  │  └─ tour.validation.ts
│  │  └─ user/
│  │     ├─ user.constant.ts
│  │     ├─ user.controller.ts
│  │     ├─ user.interface.ts
│  │     ├─ user.routes.ts
│  │     ├─ user.service.ts
│  │     └─ user.validation.ts
│  ├─ routes/
│  │  └─ index.ts
│  └─ shared/
│     ├─ catchAsync.ts
│     ├─ prisma.ts
│     ├─ seedSuperAdmin.ts
│     └─ sendResponse.ts
├─ config/
│  └─ index.env.ts
├─ app.ts
└─ server.ts



```

## Contact Information
- Email: rafiahmedrabby282@gmail.com
- Phone: +880 1894 356001
- Location: Dhaka, Bangladesh
- LinkedIn: Rafi Ahmed Rabby
- GitHub: rafirabby13
## Built with passion by Rafi Ahmed | TypeScript Expert & Full-Stack Developer




<!-- ![Logo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/th5xamgrr6se0x5ro4g6.png) -->

