import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-primary">
      <h1 className="text-6xl font-bold mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-6">Access Denied / Forbidden</h2>
      <p className="text-lg text-center mb-8 max-w-md">
        Sorry, you do not have the necessary permissions to access this page.
      </p>
      <Link to="/" className="btn btn-primary">
        Go to Homepage
      </Link>
    </div>
  );
};

export default Unauthorized;
