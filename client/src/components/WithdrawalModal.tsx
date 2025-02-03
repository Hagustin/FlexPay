import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 flex flex-col gap-4">
        {/* Modal Content */}
        <p className="text-sm font-medium text-gray-400 tracking-widest ">
          Withdraw Funds
        </p>
        <p className=" text-3xl sm:text-4xl font-medium text-black font-ivy tracking-widest ">
          $0.00
          <span className="font-inter text-base font-medium tracking-widest">
            AVAILABLE
          </span>
        </p>

        {/* Close Button */}
        <input
          className="w-full p-4 pl-6 mb-3 border rounded-full"
          placeholder="$0.00"
        ></input>
        <button className="w-full py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide">
          Confirm
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 px-6 border-1.25 border-black outline outline-black rounded-full font-inter hover:text-white hover:bg-black text-sm tracking-wide"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
