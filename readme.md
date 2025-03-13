# Visitor Management System for NIT Warangal

## Overview
The Visitor Management System streamlines visitor entry and exit using QR codes. The system allows students and professors to generate entry QR codes for visitors via the ERP website. These QR codes are emailed to the visitor, who presents them at the gate. The security guard verifies and logs the visitor's entry using a Flutter-based mobile application. When the visitor exits, the system updates the record accordingly.

## Tech Stack
- **Backend**: Node.js, MongoDB
- **Frontend**: ERP Web Portal
- **Mobile App**: Flutter (for security guard)
- **Communication**: QR codes via Email

## Workflow

### 1. Generating QR Codes
- A student or professor logs into the ERP system.
- They provide visitor details (name, contact, purpose, date/time of visit).
- The system generates a unique QR code and emails it to the visitor.

### 2. Visitor Entry
- The visitor presents the QR code at the gate.
- The security guard scans the QR code using the Flutter app.
- The app retrieves visitor details.
- If details are valid, the security guard marks the visitor as "Entered."

### 3. Visitor Exit
- When the visitor leaves, the security guard scans the same QR code.
- The system updates the exit time in the database.

## Backend Functionality
### QR Code Generation
- When a QR code is requested, the backend takes the visitor details and generates a unique QR code for the information.
- The backend sends the QR code to the visitor via email.

### Entry & Exit Management
- **Entry Process:**
  - The Flutter app scans the QR code and sends the token to the backend.
  - The backend verifies the token and fetches visitor details.
  - If valid, the visitor's status is updated to "Entered" in MongoDB.

- **Exit Process:**
  - The QR code is scanned again upon exit.
  - The backend verifies the visitor's entry status.
  - The exit time is recorded in MongoDB.

## Setup
### Backend and dummy ERP
deployed at http://43.204.142.131/

### Mobile App (Flutter)
Android apk for the mobile app is availabe at [android-flutter-apk](./App/android-flutter-apk/).


## Conclusion
This system enhances security and efficiency in managing visitor entries and exits by leveraging QR codes, a centralized backend, and a mobile app for real-time verification. and a detailed explanation is attached in [[1]](./media/)



