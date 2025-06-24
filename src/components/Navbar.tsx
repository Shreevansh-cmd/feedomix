
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-green-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-800">
          🐔 Poultry Feed Calculator
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Link to="/ingredients">
                <Button variant="outline" size="sm">
                  Manage Ingredients
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
