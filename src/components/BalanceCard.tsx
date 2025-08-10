import React from 'react';
import { useUpi } from '@/context/UpiContext';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BalanceCard: React.FC = () => {
  const { users, currentUser, setCurrentUser, transactions } = useUpi();

  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === parseInt(userId, 10));
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <Card className="w-full p-6 bg-gradient-to-br from-upi-blue to-blue-700 text-white relative overflow-hidden rounded-lg shadow-md">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-upi-yellow via-upi-green to-upi-blue"></div>
      
      <div className="mb-6">
        <p className="text-sm opacity-80">Current User</p>
        <Select onValueChange={handleUserChange} value={currentUser?.id.toString()}>
          <SelectTrigger className="w-[180px] text-white">
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <p className="text-sm opacity-80">Balance</p>
        <p className="text-3xl font-bold mb-2">₹{currentUser?.balance.toLocaleString()}</p>
      </div>
    </Card>
  );
};

export default BalanceCard;