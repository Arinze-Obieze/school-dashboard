# WACCPS School Dashboard

A modern student dashboard for the West African College of Clinical Physiology Sciences (WACCPS), built with Next.js, Firebase, and Flutterwave. This platform enables students to manage registrations, payments, courses, exams, resources, and more—all in one place.

## Features
- **Student Registration:** Multi-step forms for Primary, Membership, and Fellowship applications, with document uploads and payment integration.
- **Secure Authentication:** Firebase Auth for user login, signup, and protected routes.
- **Online Payments:** Integrated Flutterwave payments. Successful transactions are automatically recorded in Firestore for audit and history.
- **Course Management:** Register, drop, and view courses; access course materials and assignments.
- **Exams & Results:** Take online exams, view timetables, submit scripts, and track GPA/CGPA.
- **Academic Records:** Download admission letters, view registration history, and check graduation eligibility.
- **Resources:** Access eLibrary, lecture notes, videos, and study groups.
- **Payment History:** View fee breakdowns, payment history, receipts, and invoices. 
- **Profile Management:** Update personal details and upload profile photos.
- **Admin Tools:** Superadmin role management and payment oversight.

## Tech Stack
- **Next.js 14+** (App Router, Server Components)
- **Firebase** (Auth, Firestore, Storage)
- **Flutterwave** (Payment Gateway)
- **Cloudflare R2** (File Storage)
- **React & Tailwind CSS** (UI/UX)

## Getting Started
1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in your Firebase, Flutterwave, and R2 credentials.
3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
- `app/` — Next.js app directory (pages, layouts, API routes)
- `components/` — Reusable React components (forms, modals, navigation)
- `context/` — Global context providers (Auth)
- `lib/` — Utility libraries (payment recording, R2 client)
- `public/` — Static assets (images, PDFs)
- `firebase.js` — Firebase client config
- `firebaseAdmin.js` — Firebase Admin SDK config

## Payment Recording
All successful student payments are automatically recorded in Firestore under:
```
payments/{userId}/transactions/{paymentRef}
```
Each payment document includes:
- `userId`: Student ID
- `amount`: Amount paid
- `status`: Payment status ("success")
- `method`: Payment method (e.g., "flutterwave")
- `reference`: Payment reference/transaction ID
- `courseId`: (optional)
- `timestamp`: Server timestamp

## Security & Access
- Students can view only their own payment records.
- Superadmins can view and manage all payments.
- All routes are protected using the `ProtectedRoute` component.

## Contributing


## License


## Contact
For support or inquiries, email: 

---
**Powered by WACCPS**
