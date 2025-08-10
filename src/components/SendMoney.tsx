import React, { useState } from 'react';
import { useUpi } from '@/context/UpiContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SendMoney: React.FC = () => {
  const { users, currentUser, sendMoney } = useUpi();
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!recipientId) {
        return;
    }
    const success = await sendMoney(Number(amount), recipientId);
    if (success) {
      setAmount('');
      setRecipientId(null);
      setIsOpen(false);
    }
  };

  const otherUsers = users.filter(u => u.id !== currentUser?.id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-upi-blue hover:bg-blue-700">
          <ArrowUpIcon size={18} className="mr-2" /> Send Money
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
              <Input 
                value={amount} 
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} 
                placeholder="0"
                type="text"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To</label>
              <Select onValueChange={(value) => setRecipientId(Number(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a recipient" />
                </SelectTrigger>
                <SelectContent>
                  {otherUsers.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!amount || !recipientId}
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SendMoney;