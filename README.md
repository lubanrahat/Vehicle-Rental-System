# Vehicle Rental System

**Live URL:** https://vehicle-rental-system-beta.vercel.app

---

## 🚀 Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (Admin & Customer)
- Secure password hashing with bcryptjs

### Vehicle Management
- Create, read, update, and delete vehicles
- Support for multiple vehicle types (Car, Bike, Van, SUV)
- Track vehicle availability status
- Manage daily rental prices
- Unique registration number validation

### Booking Management
- Create new bookings with date range validation
- View all bookings (admin) or personal bookings (customer)
- Cancel bookings (customers can cancel before start date)
- Mark bookings as returned (admin only)
- Automatic price calculation based on rental duration
- Automatic vehicle availability updates

### User Management
- Admin can view all users
- Users can update their own profile
- Admin can delete users

### Data Integrity
- Foreign key constraints for data consistency
- Transaction support for critical operations
- Validation for booking dates and vehicle availability
- Prevents deletion of vehicles with active bookings

---

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL

### Authentication & Security
- **JWT:** jsonwebtoken
- **Password Hashing:** bcryptjs

### Development Tools
- **TypeScript Compiler:** tsc
- **Development Server:** tsx 
- **Environment Variables:** dotenv

### Deployment
- **Platform:** Vercel (configured)

---

## 🔧 Setup & Usage Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** 
- **PostgreSQL**
- **Git**

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/lubanrahat/Vehicle-Rental-System.git
   cd Vehicle-Rental-System
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/vehicle_rental_db
   JWT_SECRET=your-secret-key-here
   ```

4. **Database Setup**
   
   The application automatically creates the necessary tables on first run. Ensure your PostgreSQL database is running and accessible via the `DATABASE_URL` connection string.
   
   The following tables will be created automatically:
   - `users` - User accounts with roles
   - `vehicles` - Vehicle inventory
   - `bookings` - Rental bookings

5. **Build the Project**
   ```bash
   npm run build
   ```
   
   This compiles TypeScript files to JavaScript in the `dist` directory.

6. **Run the Application**
   
   **Development Mode (with hot reload):**
   ```bash
   npm run dev
   ```
   
   **Production Mode:**
   ```bash
   npm run build
   node dist/server.js
   ```
  
