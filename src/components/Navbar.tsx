
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      // Check if this is the predefined admin email
      if (user?.email === 'whiteshadow1136@gmail.com') {
        setIsAdmin(true);
        return;
      }

      // Check admin_users table for other admins
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      // User is not admin, which is fine
      setIsAdmin(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-green-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/33295f66-b6a1-4b81-a804-9c5bfd049adb.png" 
            alt="Feedomix Logo" 
            className="h-10 w-auto"
          />
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
                {isAdmin && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-2">
                    Admin
                  </span>
                )}
              </div>
              <Link to="/ingredients">
                <Button variant="outline" size="sm">
                  Manage Ingredients
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
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
