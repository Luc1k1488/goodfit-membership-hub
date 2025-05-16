
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/context/AppContext";

const LoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(phone, password);
      if (success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container px-4 py-16 mx-auto sm:px-6">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Log in to GoodFit</CardTitle>
            <CardDescription>
              Enter your phone number and password to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-goodfit-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex-col">
              <Button 
                type="submit" 
                className="w-full bg-goodfit-primary hover:bg-goodfit-dark"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
              
              <p className="mt-4 text-sm text-center text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-goodfit-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* Demo credentials */}
      <div className="max-w-md p-4 mx-auto mt-8 bg-gray-50 rounded-lg">
        <h3 className="mb-2 font-medium">Demo Credentials</h3>
        <p className="mb-1 text-sm text-gray-600">User: 9001234567</p>
        <p className="mb-1 text-sm text-gray-600">Partner: 9007654321</p>
        <p className="mb-1 text-sm text-gray-600">Admin: 9000000000</p>
        <p className="mt-2 text-sm text-gray-500">
          (Use any password for demonstration)
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
