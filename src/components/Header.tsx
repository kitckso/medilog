// components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-sky-600 text-white p-4 shadow-md sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-center">MediLog</h1>
    </header>
  );
};

export default Header;