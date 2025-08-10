import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
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
  localUsers: User[];
  localTransactions: Transaction[];
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  sendMoney: (amount: number, recipientId: number) => Promise<boolean>;
  upiId: string;
  isOnline: boolean;
  toggleOnline: () => void;
};

const UpiContext = createContext<UpiContextType | undefined>(undefined);

export const useUpi = () => {
  const context = useContext(UpiContext);
  if (!context) {
    throw new Error("useUpi must be used within a UpiProvider");
  }
  return context;
};

export const UpiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUserInternal] = useState<User | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const upiId = currentUser ? `${currentUser.name.toLowerCase()}@payzzle` : "";

  // Use ref to avoid stale closure
  const currentUserRef = useRef<User | null>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  // Restore user only after both clientId and users are available
  useEffect(() => {
    if (clientId && users.length > 0) {
      const storedUser = localStorage.getItem(`currentUser_${clientId}`);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const found = users.find((u) => u.id === parsed.id);
        setCurrentUserInternal(found || users[0]);
      } else {
        setCurrentUserInternal(users[0]);
      }
    }
  }, [clientId, users]);

  // Sync local ledger with online ledger on first load or when toggling online
  useEffect(() => {
    if (isOnline) {
      setLocalUsers(users);
      setLocalTransactions(transactions);
    }
  }, [isOnline, users, transactions]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      ws = new WebSocket("ws://localhost:8081");

      ws.onopen = () => {
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        let message: any;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "clientId") {
          setClientId(message.data);
        } else if (message.type === "users") {
          setUsers(message.data);
        } else if (message.type === "transactions") {
          setTransactions(message.data);
        }
      };

      ws.onclose = () => {
        setSocket(null);
        reconnectTimeout = setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserInternal(user);
    if (clientId) {
      localStorage.setItem(`currentUser_${clientId}`, JSON.stringify(user));
    }
  };

  const toggleOnline = () => setIsOnline((v) => !v);

  const sendMoney = async (
    amount: number,
    recipientId: number
  ): Promise<boolean> => {
    const user = currentUserRef.current;
    if (!user) {
      toast.error("Please select a user");
      return false;
    }
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return false;
    }

    // Use correct ledger
    const ledgerUsers = isOnline ? users : localUsers;
    const senderIdx = ledgerUsers.findIndex((u) => u.id === user.id);
    const receiverIdx = ledgerUsers.findIndex((u) => u.id === recipientId);

    if (
      senderIdx === -1 ||
      receiverIdx === -1 ||
      ledgerUsers[senderIdx].balance < amount
    ) {
      toast.error("Insufficient balance or user not found");
      return false;
    }

    if (!isOnline) {
      // Offline: update local ledger only
      const updatedUsers = [...ledgerUsers];
      updatedUsers[senderIdx] = {
        ...updatedUsers[senderIdx],
        balance: updatedUsers[senderIdx].balance - amount,
      };
      updatedUsers[receiverIdx] = {
        ...updatedUsers[receiverIdx],
        balance: updatedUsers[receiverIdx].balance + amount,
      };
      setLocalUsers(updatedUsers);

      const newTx: Transaction = {
        id: Date.now(),
        sender_id: user.id,
        receiver_id: recipientId,
        amount,
        timestamp: new Date().toISOString(),
      };
      setLocalTransactions([newTx, ...localTransactions]);
      toast.success(`₹${amount} sent offline`);
      return true;
    } else {
      // Online: sync with server
      try {
        const response = await fetch("http://localhost:8081/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: user.id,
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
        toast.error("Failed to send money");
        return false;
      }
    }
  };

  // Context value
  const value = {
    users,
    transactions,
    localUsers,
    localTransactions,
    currentUser,
    setCurrentUser,
    sendMoney,
    upiId,
    isOnline,
    toggleOnline,
  };

  return <UpiContext.Provider value={value}>{children}</UpiContext.Provider>;
};
