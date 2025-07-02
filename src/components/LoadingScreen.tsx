
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoadingScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogoClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div 
        className="text-center cursor-pointer transition-transform hover:scale-105"
        onClick={handleLogoClick}
      >
        <img 
          src="/lovable-uploads/33295f66-b6a1-4b81-a804-9c5bfd049adb.png" 
          alt="Feedomix Logo" 
          className="h-24 w-auto mx-auto mb-4"
        />
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="text-green-600 text-lg">Loading...</span>
        </div>
      </div>
    </div>
  );
};
