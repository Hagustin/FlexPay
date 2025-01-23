# FlexPay - Digital Payment Solution

## Overview
FlexPay is a fintech application designed to modernize transactions in rural areas, islands, and underserved communities. By introducing mobile-based payments, QR codes, and banking integration, FlexPay empowers local businesses and individuals with a seamless digital payment experience.

## 🚀 Deployment Goal
FlexPay aims to be **fully deployed on Render by January 30th**. The backend is transitioning to **GraphQL**, ensuring efficient data access and API management, while the frontend is built with **React, TypeScript, and Chakra UI** for a seamless user experience.

---

## 📍 Project Timeline
### **Backend Development**
✅ **January 24-25 (Today & Tomorrow)**
- Finalize **GraphQL schema** (types, queries, and mutations)
- Convert all **existing REST routes** to **GraphQL**
- Set up **Apollo Server** for seamless integration

✅ **January 26-27 (Weekend)**
- Test and debug all **GraphQL queries/mutations** in Insomnia/Postman
- Add **error handling, security checks, and authentication**
- Deploy **backend to Render** (initial test)

✅ **January 28**
- Conduct final **backend testing**
- Provide frontend team with **GraphQL API documentation**
- Ensure proper **CORS handling** for frontend integration

✅ **January 29**
- Backend **ready for full integration**
- Standby for any **last-minute fixes**

✅ **January 30 (Deployment)**
- Backend **fully deployed on Render**
- Verify **GraphQL API accessibility** for frontend

---

### **Frontend Development**
✅ **January 24-25 (Today & Tomorrow)**
- Set up **React + TypeScript + Chakra UI** environment
- Design **wireframes** for each route
- Start implementing **Landing Page & Authentication**

✅ **January 26-27 (Weekend)**
- Implement **Dashboard & Wallet pages**
- Integrate **GraphQL with Apollo Client**
- Work on **QR Code Scanner & Generator** UI

✅ **January 28**
- Connect **frontend to GraphQL backend**
- Implement **transaction history UI**
- Ensure **form validation & authentication flow**

✅ **January 29**
- Complete **styling & responsiveness**
- Conduct **full frontend testing**
- Fix **UI bugs & finalize components**

✅ **January 30 (Deployment)**
- Deploy frontend to **Render**
- Final integration test with backend
- **Go Live! 🚀**

---

## 🛠️ Technologies Used
- **Frontend**: React, TypeScript, Chakra UI, Apollo Client
- **Backend**: Node.js, Express.js, GraphQL (Apollo Server), MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Integration**: QR Code Payments
- **Deployment**: Render

## 📌 Features
- **User Registration & Authentication**
- **Digital Wallet (Add & Withdraw Funds)**
- **QR Code Payments & Transfers**
- **Transaction History Tracking**
- **GraphQL API for Efficient Data Management**

## 📄 Setup Instructions
### **Backend**
1. Clone the repository
   ```sh
   git clone <repo-link>
   cd server
   npm install
   npm run dev
   ```
2. Ensure **MongoDB** is running locally or provide a cloud connection string.
3. Create a `.env` file and configure the following:
   ```sh
   PORT=3001
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET_KEY=your_secret_key
   ```
4. Start the backend server:
   ```sh
   npm run dev
   ```

### **Frontend**
1. Navigate to the `client` directory.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Ensure the frontend is properly fetching data from the **GraphQL API**.

## 📢 Contributions
We welcome contributions! Please follow the Git branching workflow and submit pull requests for review.

---

## 📌 Final Notes
- Keep the **backend fully accessible via GraphQL**.
- Ensure the **frontend consumes GraphQL efficiently**.
- Deploy both **backend & frontend to Render by January 30th**.

🎉 **Let’s make FlexPay a success!** 🚀

