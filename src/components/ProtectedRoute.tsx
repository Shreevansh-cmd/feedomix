
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, UserX } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = async () => {
    try {
      // Check if this is the predefined admin email
      if (user?.email === 'whiteshadow1136@gmail.com') {
        // Automatically set as active admin - no approval needed
        setUserStatus('active');
        setStatusLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('user_status')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user status:', error);
        setUserStatus('pending');
      } else {
        setUserStatus(data?.user_status || 'pending');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserStatus('pending');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (userStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-orange-800">Account Pending Approval</CardTitle>
            <CardDescription>
              Your account registration is currently under review
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for registering! Your account is pending approval by an administrator. 
              You'll receive access once your account has been approved.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-700">
                <strong>What's next?</strong><br />
                Our team will review your registration and approve your account soon. 
                You'll be able to access the feed calculator once approved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userStatus === 'suspended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <UserX className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Account Suspended</CardTitle>
            <CardDescription>
              Your account has been suspended
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Your account access has been temporarily suspended. Please contact the administrator 
              for more information about reactivating your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
