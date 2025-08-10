import React, { useState } from 'react';
import { useUpi } from '@/context/UpiContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, QrCodeIcon, CopyIcon, CheckIcon } from 'lucide-react';

const ReceiveMoney: React.FC = () => {
  const { upiId } = useUpi();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-upi-blue text-upi-blue hover:bg-upi-lightBlue">
          <ArrowDownIcon size={18} className="mr-2" /> Receive Money
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive Money</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-upi-gray p-4 rounded-lg text-center">
            <div className="bg-white mx-auto w-48 h-48 flex items-center justify-center rounded-lg shadow-sm mb-3">
              <QrCodeIcon size={120} className="text-upi-blue" />
            </div>
            <div className="flex items-center justify-center mt-2">
              <p className="text-sm font-medium">{upiId}</p>
              <button onClick={copyUpiId} className="ml-2 p-1">
                {copied ? <CheckIcon size={14} className="text-upi-green" /> : <CopyIcon size={14} />}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveMoney;