import { useState } from "react";

interface NameModalProps {
  initialFirstName?: string;
  initialLastName?: string;
  onSubmit: (firstName: string, lastName: string) => void;
  onClose: () => void;
}

export function NameModal({ initialFirstName = "", initialLastName = "", onSubmit, onClose }: NameModalProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onSubmit(firstName.trim(), lastName.trim());
    }
  };

  const isEditing = initialFirstName || initialLastName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">
          {isEditing ? "Edit Your Name" : "Please Enter Your Name"}
        </h2>
        <p className="text-gray-600 mb-6">
          We need your name to save your date preferences.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              {isEditing ? "Cancel" : "Back"}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
            >
              {isEditing ? "Save Changes" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
