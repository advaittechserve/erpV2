// BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-black hover:text-yellow-600 my-5"
    >
      <ArrowBackIcon className="w-4 h-4 mr-2" />
      
    </button>
  );
};

export default BackButton;
