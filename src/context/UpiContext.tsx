import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

// Define our types
type Transaction = {
  id: number;
  sender_id: number;
  receiver_id: number;
  amount: number;
  timestamp: string;
};

type User = {
  id: number;
  name: string;
  balance: number;
};

type UpiContextType = {
  users: User[];
  transactions: Transaction[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  sendMoney: (amount: number, recipientId: number) => Promise<boolean>;
  upiId: string;
};

const UpiContext = createContext<UpiContextType | undefined>(undefined);

export const useUpi = () => {
  const context = useContext(UpiContext);
  if (!context) {
    throw new Error("useUpi must be used within a UpiProvider");
  }
  return context;
};

export const UpiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const upiId = currentUser ? `${currentUser.name.toLowerCase()}@payzzle` : "";

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'users') {
        setUsers(message.data);
        if (!currentUser) {
            setCurrentUser(message.data[0]);
        }
      } else if (message.type === 'transactions') {
        setTransactions(message.data);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [currentUser]);

  const sendMoney = async (amount: number, recipientId: number): Promise<boolean> => {
    if (!currentUser) {
      toast.error("Please select a user");
      return false;
    }

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }

    if (currentUser.balance < amount) {
      toast.error("Insufficient balance");
      return false;
    }

    try {
      const response = await fetch("http://localhost:8080/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: recipientId,
          amount,
        }),
      });

      if (response.ok) {
        toast.success(`₹${amount} sent successfully`);
        return true;
      } else {
        const errorText = await response.text();
        toast.error(errorText);
        return false;
      }
    } catch (error) {
      console.error("Error sending money:", error);
      toast.error("Failed to send money");
      return false;
    }
  };

  // Context value
  const value = {
    users,
    transactions,
    currentUser,
    setCurrentUser,
    sendMoney,
    upiId,
  };

  return <UpiContext.Provider value={value}>{children}</UpiContext.Provider>;
};