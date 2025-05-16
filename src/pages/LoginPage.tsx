
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleQuickLogin = (role: "USER" | "PARTNER" | "ADMIN") => {
    let testEmail = "";
    
    switch (role) {
      case "USER":
        testEmail = "john@example.com";
        break;
      case "PARTNER":
        testEmail = "alex@fitgym.com";
        break;
      case "ADMIN":
        testEmail = "admin@goodfit.com";
        break;
    }
    
    setEmail(testEmail);
    setPassword("password123"); // In real app, you wouldn't do this
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const user = await login(email, password);
      
      toast({
        title: "Login successful!",
        description: `Welcome back, ${user.name}!`,
      });
      
      // Redirect based on role
      if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (user.role === "PARTNER") {
        navigate("/partner-dashboard");
      } else {
        navigate("/profile");
      }
      
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Log in to GoodFit</h1>
          <p className="mt-2 text-gray-600">
            Access your account and manage your fitness journey
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-sm text-goodfit-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-goodfit-primary hover:bg-goodfit-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
          
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-goodfit-primary hover:underline">
              Register now
            </Link>
          </div>

          {/* Quick login options for development */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-2">Quick login for testing</p>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin("USER")}
              >
                Client
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin("PARTNER")}
              >
                Partner
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickLogin("ADMIN")}
              >
                Admin
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
