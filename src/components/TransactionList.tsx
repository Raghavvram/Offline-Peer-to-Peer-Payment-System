import React from 'react';
import { useUpi } from '@/context/UpiContext';
import {
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionList: React.FC = () => {
  const { users, transactions, currentUser } = useUpi();

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-upi-darkGray">
        <p>No transactions yet</p>
      </div>
    );
  }

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  return (
    <div className="space-y-1">
      {transactions.map((tx) => {
        const isSender = tx.sender_id === currentUser?.id;
        const type = isSender ? 'send' : 'receive';
        const otherPartyId = isSender ? tx.receiver_id : tx.sender_id;
        const otherPartyName = getUserName(otherPartyId);

        return (
          <div
            key={tx.id}
            className="p-4 border-b flex items-center justify-between"
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                type === "send" ? "bg-red-100" : "bg-green-100"
              }`}>
                {type === "send" ? (
                  <ArrowUpIcon className="text-upi-red" size={20} />
                ) : (
                  <ArrowDownIcon className="text-upi-green" size={20} />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {otherPartyName}
                </p>
                <p className="text-xs text-upi-darkGray flex items-center">
                  {format(new Date(tx.timestamp), 'dd MMM, hh:mm a')}
                </p>
              </div>
            </div>
            <div className={`text-right ${
              type === "send" ? "text-upi-red" : "text-upi-green"
            }`}>
              <p className="font-medium">
                {type === "send" ? "-" : "+"}₹{tx.amount}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;