
import React from 'react';
import { Entry } from '../types';

interface FollowUpModalProps {
  entry: Entry;
  onClose: () => void;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ entry, onClose }) => {
  const whatsappUrl = `https://wa.me/${entry.mobileNumber.startsWith('+') ? entry.mobileNumber : '+91' + entry.mobileNumber}`;
  const telUrl = `tel:${entry.mobileNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-phone-alt text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold">Follow-up Call</h3>
          <p className="text-indigo-100 text-sm mt-1">{entry.customerName}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <a 
              href={telUrl}
              className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              <i className="fas fa-phone"></i> Direct Call
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-100"
            >
              <i className="fab fa-whatsapp text-xl"></i> WhatsApp Message
            </a>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-4">Customer Mobile</p>
            <span className="text-lg font-mono font-bold text-gray-800">{entry.mobileNumber}</span>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full py-3 text-gray-500 font-semibold hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;
