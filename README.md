# Offline Payment System Simulation

A responsive web application built with React and TypeScript that demonstrates the principles of an offline-first payment system. This project simulates how a digital wallet could handle transactions even without an active internet connection, queuing them up and syncing when connectivity is restored.

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcn-ui&logoColor=white" alt="Shadcn UI"/>
</p>

## ✨ Key Features

*   **Online/Offline Mode Simulation**: Toggle between online and offline states to see how the application behaves.
*   **Ledger vs. Actual Balance**:
    *   **Ledger Balance**: Updates instantly for both online and offline transactions.
    *   **Actual Balance**: Represents the "bank" balance and only syncs with the ledger when online.
*   **Pending Transaction Queue**: Offline transactions are added to a pending queue and are processed automatically when the application comes back online.
*   **Simulated Offline Transfers**: The UI adapts in offline mode to show simulated transfer methods like NFC and Bluetooth.
*   **Send & Receive Money**: Full functionality for sending and receiving payments.
*   **Transaction History**: View a unified list of completed and pending transactions.
*   **Responsive Design**: A clean, modern interface that works on both desktop and mobile devices.

## 🤔 How It Works

The core of the simulation lies in the `UpiContext`. It manages two key balance states:

1.  **`ledgerBalance`**: This is the balance displayed on the user's device. It is updated immediately whenever a transaction (send or receive) is initiated, regardless of network status. This provides instant feedback to the user.
2.  **`actualBalance`**: This represents the "true" balance on the server or in the bank. It is only modified when transactions are completed online.

When the user is **offline**:
*   Transactions are added to a `pendingTransactions` array.
*   The `ledgerBalance` is updated, but the `actualBalance` remains unchanged.

When the user comes back **online**:
*   The system automatically triggers a `syncLedger` function.
*   All transactions in the `pendingTransactions` queue are processed.
*   The `actualBalance` is updated to match the `ledgerBalance`.
*   Pending transactions are moved to the main transaction history.

This model ensures that the user can continue to transact offline with a degree of confidence, and the system self-corrects when connectivity is restored.

## 🛠️ Tech Stack

*   **Framework:** [React](https://react.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **State Management:** React Context
*   **Routing:** [React Router](https://reactrouter.com/)
*   **Linting:** [ESLint](https://eslint.org/)
*   **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

## 🏁 Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Bun](https://bun.sh/) or npm/yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd offline-payment-system
    ```

2.  Install dependencies:
    ```bash
    bun install
    # or
    npm install
    ```

### Running the Development Server

To start the development server, run:

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) (or another port if 5173 is in use) to view it in the browser.

## 📂 Project Structure

```
.
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Shadcn UI components
│   │   └── ...
│   ├── context/         # React context for state management (UpiContext.tsx)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── App.tsx          # Main App component with routing
│   ├── main.tsx         # Application entry point
│   └── ...
├── package.json         # Project metadata and dependencies
└── ...
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details. (Note: You may need to create a `LICENSE` file).

## 🙏 Acknowledgements

*   [Shadcn UI](https://ui.shadcn.com/) for the fantastic component library.
*   The creators of the many great open-source libraries used in this project.

