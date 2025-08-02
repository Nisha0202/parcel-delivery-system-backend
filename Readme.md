# Parcel Delivery API

**Inspiration:** Pathao Courier, Sundarban, etc.

## 🎯 Project Overview

A secure, modular Express.js and Mongoose backend for a parcel delivery system with role-based access (admin, sender, receiver), robust parcel tracking, and status history.

---

## 📦 Features

- **Authentication:** JWT login, bcrypt-hashed passwords.
- **Roles:** Admin, Sender, Receiver.
- **Parcels:** Creation, tracking, status logs, cancellation, delivery confirmation.
- **Status Logs:** Embedded inside parcel as array of events.
- **Admin Controls:** Block/unblock users/parcels, update status, manage users/parcels.
- **Role-based Authorization:** Middleware protects endpoints.
- **Endpoints:** RESTful, error-handled, modular.

---

## 🗂 Folder Structure

```
src/
├── app.ts
├── config/
│   └── db.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── role.middleware.ts
│   └── error.middleware.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.routes.ts
│   ├── user/
│   │   ├── user.model.ts
│   │   ├── user.controller.ts
│   │   └── user.routes.ts
│   ├── parcel/
│   │   ├── parcel.model.ts
│   │   ├── parcel.controller.ts
│   │   └── parcel.routes.ts
├── utils/
│   ├── generateTrackingId.ts
│   └── hashPassword.ts
```

---

## 🧱 API Endpoints

### Auth
- `POST /api/auth/register` – Register (role: sender, receiver)
- `POST /api/auth/login` – Login (returns JWT)

### Users (Admin only)
- `GET /api/users` – List all users
- `PATCH /api/users/:id/block` – Block user
- `PATCH /api/users/:id/unblock` – Unblock user

### Parcels

#### Sender
- `POST /api/parcels` – Create parcel request
- `GET /api/parcels/me` – List my parcels
- `PATCH /api/parcels/:id/cancel` – Cancel parcel (if not dispatched)

#### Receiver
- `GET /api/parcels/received` – View incoming parcels
- `PATCH /api/parcels/:id/confirm` – Confirm delivery

#### Admin
- `GET /api/parcels` – List all parcels (filterable)
- `PATCH /api/parcels/:id/block` – Block parcel
- `PATCH /api/parcels/:id/status` – Update parcel status

#### Shared
- `GET /api/parcels/:id` – View parcel details (sender, receiver, admin)
- `GET /api/parcels/:id/status-log` – Parcel status history
- `GET /api/track/YOUR_TRACKING_ID` - Tracking parcel with unique tracing id

---

## 📦 Parcel Model Design

- **trackingId:** `TRK-YYYYMMDD-xxxxxx` (auto-generated)
- **type:** e.g., 'document', 'package', etc.
- **weight:** number (kg)
- **sender:** User ref
- **receiver:** User ref
- **pickupAddress:** string
- **deliveryAddress:** string
- **fee:** number
- **couponCode:** string
- **deliveryDate:** Date
- **status:** string (`Requested`, `Approved`, `Dispatched`, `In Transit`, `Delivered`, `Canceled`, `Blocked`)
- **isBlocked:** boolean
- **trackingEvents:** Array of:
    - status: string
    - timestamp: Date
    - location: string (optional)
    - updatedBy: User ref or 'system'
    - note: string

---

## 🔐 Role-Based Middleware

- Protects routes based on JWT and required role.
- Checks blocked status for users/parcels.

---

## 🧠 Business Rules & Validations

- Only sender can cancel parcel (before `Dispatched`).
- Only receiver can confirm delivery (when status is `In Transit`).
- Only receiver can view the parcels sent to them.
- Blocked users/parcels cannot access features.
- Admin can view all users/parcels and can use filters. 
- Admin can block/unblock users and can block parcels, update statuses.
- Only sender can view their sent parcels.
- Unique tracking ID for tracking each parcel.
- Fee calculation according 80tk/weight.
- Fee discounted by 50tk if "Save50" coupon code used.

---

## 📝 Setup

1. Clone repo.
2. `npm install`
3. Configure `.env` (MongoDB URI, JWT secret).
4. `npm run dev`

---

## 📄 API Documentation

- All endpoints documented in `/postman_collection.json`
- Each endpoint returns:
    - Success: `{ success: true, data: ... }`
    - Error: `{ success: false, message: ... }`
    - Proper status codes (`200`, `201`, `403`, `404`, `422`, `500`)

---

## 🧪 Testing

- Used included Postman collection.
- Register, login, create parcels, cancel, confirm, block/unblock.

---

## 👩🏻‍💻 Test Accounts

- **Admin**  
  Email: admin@example.com  
  Password: 123456

- **Sender**  
  Email: sender@example.com  
  Password: 123456

- **Receiver**  
  Email: receiver@example.com  
  Password: SecurePass123

---

## 🎥 Demo Video

- See `demo.mp4` for full walkthrough.

---

## 💡 Design Decisions

- **Parcel creation:** Only sender can create.
- **Tracking ID:** Auto-generated, unique.
- **Status log:** Embedded in parcel for easy history.
- **Fee:** Flat rate (extendable).
- **Blocked logic:** Checked on user and parcel access.
- **Status flow:** `Requested → Approved → Dispatched → In Transit → Delivered`, admin can update status.
- **No delete:** Parcels can't be deleted, only canceled/blocked.
- **Search/filter:** Admin can filter by status/date.
- **Tracking public:** Optionally, can add endpoint for tracking by ID.

---

## 📊 Evaluation Rubric Mapping

- **Authentication:** JWT + bcrypt 
- **Role-Based Auth:** Custom middlewares 
- **Sender/Receiver Logic:** Ownership, validation 
- **Parcel & Status Design:** Schema, status log 
- **Status History/Filter:** Embedded, filterable 
- **Code Structure/Error Handling:** Modular, error middleware 
- **Creativity/Design:** Thoughtful schema, tracking, blocking 
- **README/API Testing/Video:** Provided 

