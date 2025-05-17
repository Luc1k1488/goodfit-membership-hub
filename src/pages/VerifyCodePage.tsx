
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Header } from "@/components/Header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";

const VerifyCodePage = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isRegistration, setIsRegistration] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, login, register } = useAuth();
  
  useEffect(() => {
    // Get data from location state
    const state = location.state as { phone?: string; name?: string; isRegistration?: boolean } | null;
    
    if (state?.phone) {
      setPhone(state.phone);
      
      if (state.name) {
        setName(state.name);
        setIsRegistration(true);
      }
    } else {
      // If no phone number was provided, redirect back to login
      toast.error("Номер телефона не указан");
      navigate("/login");
    }
  }, [location, navigate]);
  
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const user = await verifyOTP(phone, otp);
      
      toast.success(isRegistration 
        ? "Регистрация успешно завершена!" 
        : `Добро пожаловать${user.name ? ', ' + user.name : ''}!`
      );
      
      // Redirect based on role
      if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (user.role === "PARTNER") {
        navigate("/partner-dashboard");
      } else {
        navigate("/profile");
      }
      
    } catch (error: any) {
      setError(error.message || "Ошибка проверки кода");
      console.error("OTP verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendCode = async () => {
    setIsSubmitting(true);
    setError("");
    
    try {
      if (isRegistration) {
        await register(name, phone);
      } else {
        await login(phone);
      }
      toast.success("Новый код отправлен");
    } catch (error: any) {
      setError(error.message || "Ошибка отправки кода");
      console.error("Error resending code:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(isRegistration ? "/register" : "/login")}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">
            {isRegistration ? "Регистрация" : "Вход"} в GoodFit
          </h1>
        </div>
      </Header>
      
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Подтверждение номера</h1>
            <p className="mt-2 text-muted-foreground">
              Введите код из SMS для подтверждения
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            <div className="space-y-4">
              <Label htmlFor="otp">Введите код из SMS</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError(""); // Clear error when typing
                  }}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, i) => (
                        <InputOTPSlot key={i} index={i} {...slot} />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Код отправлен на номер {phone}
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6"
              disabled={isSubmitting || otp.length < 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Проверка...
                </>
              ) : "Подтвердить"}
            </Button>
            
            <div className="text-center text-sm">
              <Button
                variant="link"
                type="button"
                onClick={() => navigate(isRegistration ? "/register" : "/login")}
                className="text-blue-500 p-0"
              >
                {isRegistration ? "Изменить данные" : "Изменить номер телефона"}
              </Button>
            </div>
            
            <div className="text-center text-sm mt-4">
              <Button
                variant="link"
                type="button"
                onClick={handleResendCode}
                className="text-blue-500 p-0"
                disabled={isSubmitting}
              >
                Отправить код повторно
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyCodePage;
