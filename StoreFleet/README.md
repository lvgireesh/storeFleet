# StoreFleet Capstone Project

StoreFleet is an Express, MongoDB and Mongoose backend for a small e-commerce application.

## 1. Requirements

- Node.js 18 or later
- MongoDB running locally, or a MongoDB connection string
- A Gmail app password (only if you want welcome and password-reset emails to be delivered)

## 2. Install

From the project root:

```bash
npm install
```

## 3. Configure environment variables

Copy `backend/config/uat.env.example` to `backend/config/uat.env` and fill in your own values. Never commit or share the real `uat.env` file.

```bash
# Windows PowerShell
Copy-Item backend/config/uat.env.example backend/config/uat.env

# macOS / Linux
cp backend/config/uat.env.example backend/config/uat.env
```

Set a long, random `JWT_Secret`. For Gmail, create an app password for the sender account and place it in `STORFLEET_SMPT_MAIL_PASSWORD`. Do not use your normal Gmail password.

`FRONTEND_URL` is the base URL used to build the password-reset link. The default in code is `http://localhost:3000` if it is not configured.

## 4. Start the server

```bash
npm run dev
```

or:

```bash
npm start
```

The API listens on `http://localhost:3000` by default.

## 5. Main API routes

Base URL: `http://localhost:3000/api/storefleet`

### Users

| Method | Endpoint | Access |
|---|---|---|
| POST | `/user/signup` | Public |
| POST | `/user/login` | Public |
| POST | `/user/password/forget` | Public |
| PUT | `/user/password/reset/:token` | Public |
| PUT | `/user/password/update` | Logged-in user |
| PUT | `/user/profile/update` | Logged-in user |
| GET | `/user/details` | Logged-in user |
| GET | `/user/logout` | Logged-in user |
| GET | `/user/admin/allusers` | Admin |
| GET | `/user/admin/details/:id` | Admin |
| DELETE | `/user/admin/delete/:id` | Admin |
| PUT | `/user/admin/update/:id` | Admin |

### Products

| Method | Endpoint | Access |
|---|---|---|
| GET | `/product/products` | Public |
| GET | `/product/details/:id` | Public |
| GET | `/product/reviews/:id` | Public |
| POST | `/product/add` | Admin |
| PUT | `/product/update/:id` | Admin |
| DELETE | `/product/delete/:id` | Admin |
| PUT | `/product/rate/:id` | Logged-in user |
| DELETE | `/product/review/delete?productId=...&reviewId=...` | Logged-in review owner |

Product listing accepts `keyword` (or `search`), `category`, `minPrice`, `maxPrice`, `page`, and `limit`. It also accepts `price[gte]` and `price[lte]` for price bounds.

### Orders

| Method | Endpoint | Access |
|---|---|---|
| POST | `/order/new` | Logged-in user |

The order request body contains `shippingInfo`, `orderedItems`, `paymentInfo`, `itemsPrice`, `taxPrice`, `shippingPrice`, and `totalPrice`. The authenticated user's ID is assigned by the server.

## 6. Important notes

- Authentication uses a JWT stored in an HTTP-only cookie named `token`. When testing with Postman, keep cookies enabled between login and protected requests.
- The password is hashed by the Mongoose `pre("save")` hook. Do not hash it again in controllers.
- Password-reset tokens are stored as SHA-256 hashes and expire after 10 minutes.
- Email delivery is best-effort during signup: an SMTP failure is logged but does not prevent account creation.
- This project does not process card payments. `paymentInfo` is accepted from the caller as the assignment's order schema specifies; a real application must verify payment with its payment provider on the server before marking an order paid.
