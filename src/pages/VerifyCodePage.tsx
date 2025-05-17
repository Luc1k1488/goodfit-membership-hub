
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Header } from "@/components/Header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { isEmail } from "@/services/auth";
import { supabase } from "@/lib/supabaseClient";

const VerifyCodePage = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [isRegistration, setIsRegistration] = useState(false);
  const [error, setError] = useState("");
  const [contactType, setContactType] = useState<"phone" | "email">("phone");
  const [validateInProgress, setValidateInProgress] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, login, register, isLoading } = useAuth();

  useEffect(() => {
    // Clear any previous errors
    setError("");
    setValidateInProgress(true);
    
    const extractContactInfo = async () => {
      try {
        // First try to get user information from Supabase session
        // This is critical for email redirect flows
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email || data?.user?.phone) {
          const contactValue = data.user.email || data.user.phone || "";
          console.log("Retrieved contact from auth session:", contactValue);
          setContact(contactValue);
          setContactType(isEmail(contactValue) ? "email" : "phone");
          
          // Check for pending registration name
          const pendingName = localStorage.getItem('pendingRegistrationName');
          if (pendingName) {
            setName(pendingName);
            setIsRegistration(true);
          }
          
          setValidateInProgress(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching user from auth session:", error);
      }
      
      // If no session info, try location state data
      if (location.state && typeof location.state === 'object') {
        const state = location.state as { contact?: string; name?: string; isRegistration?: boolean };
        console.log("Verify page state from location:", state);
        
        if (state.contact) {
          setContact(state.contact);
          setContactType(isEmail(state.contact) ? "email" : "phone");
          
          if (state.name) {
            setName(state.name);
            setIsRegistration(true);
          } else if (state.isRegistration) {
            setIsRegistration(true);
            // Try to get name from localStorage if coming from email link
            const pendingName = localStorage.getItem('pendingRegistrationName');
            if (pendingName) {
              setName(pendingName);
            }
          }
          
          setValidateInProgress(false);
          return;
        }
      }
      
      // If no valid state in location, check URL parameters
      const params = new URLSearchParams(location.search);
      const email = params.get('email');
      const phone = params.get('phone');
      
      if (email || phone) {
        console.log("Verify page params:", { email, phone });
        const contactValue = email || phone || '';
        setContact(contactValue);
        setContactType(isEmail(contactValue) ? "email" : "phone");
        setIsRegistration(params.get('isRegistration') === 'true');
        
        // Try to get name from localStorage if necessary
        if (params.get('isRegistration') === 'true') {
          const pendingName = localStorage.getItem('pendingRegistrationName');
          if (pendingName) {
            setName(pendingName);
          }
        }
        
        setValidateInProgress(false);
        return;
      }
      
      // If we still don't have contact info, show error and redirect
      console.log("No contact information provided, redirecting to login");
      toast.error("Контактные данные не указаны");
      navigate("/login", { replace: true });
    };
    
    extractContactInfo();
  }, [location, navigate]);

  const handleVerifyOtp = async () => {
    if (validateInProgress) {
      setError("Валидация данных, пожалуйста подождите");
      return;
    }

    if (!contact) {
      setError("Контактные данные не указаны");
      toast.error("Ошибка: контактные данные не указаны");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
      return;
    }
    
    if (!otp || otp.length < 6) {
      setError("Пожалуйста, введите полный код подтверждения");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      console.log("Verifying OTP for contact:", contact, "with code:", otp);
      const user = await verifyOTP(contact, otp);
      
      if (!user) {
        throw new Error("Ошибка верификации: пользователь не найден");
      }
      
      console.log("Verification successful, user:", user);
      
      toast.success(isRegistration
        ? "Регистрация успешно завершена!"
        : `Добро пожаловать${user.name ? `, ${user.name}` : ""}!`
      );

      // Redirect based on user role with replace: true for preventing return back
      if (user.role === "ADMIN") {
        navigate("/admin-dashboard", { replace: true });
      } else if (user.role === "PARTNER") {
        navigate("/partner-dashboard", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(error.message || "Ошибка проверки кода");
      toast.error(error.message || "Ошибка проверки кода");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!contact) {
      setError("Контактные данные не указаны");
      toast.error("Ошибка: контактные данные не указаны");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (isRegistration && name) {
        await register(name, contact);
      } else {
        await login(contact);
      }
      toast.success("Новый код отправлен");
    } catch (error: any) {
      console.error("Error resending code:", error);
      setError(error.message || "Ошибка отправки кода");
      toast.error(error.message || "Ошибка отправки кода");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading if validation is in progress or auth is loading
  if (validateInProgress || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(isRegistration ? "/register" : "/login", { replace: true })}
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
            <h1 className="text-2xl font-bold">Подтверждение</h1>
            <p className="mt-2 text-muted-foreground">
              {contactType === "phone" 
                ? "Введите код из SMS для подтверждения" 
                : "Введите код из письма для подтверждения"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Код отправлен на {contactType === "phone" ? "номер" : ""}
              {" "}{contact}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form 
            className="space-y-6" 
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyOtp();
            }}
          >
            <div className="space-y-4">
              <Label htmlFor="otp">
                {contactType === "phone" 
                  ? "Введите код из SMS" 
                  : "Введите код из письма"}
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setError("");
                    console.log("OTP entered:", value);
                  }}
                  render={({ slots }) => (
                    <InputOTPGroup>
                      {slots.map((slot, i) => (
                        <InputOTPSlot
                          key={i}
                          {...slot}
                        />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
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
                onClick={() => navigate(isRegistration ? "/register" : "/login", { replace: true })}
                className="text-blue-500 p-0"
              >
                {isRegistration ? "Изменить данные" : "Изменить контактные данные"}
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
