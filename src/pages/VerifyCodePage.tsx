
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
import { isEmail } from "@/services/authService";

const VerifyCodePage = () => {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contact, setContact] = useState("");
  const [name, setName] = useState("");
  const [isRegistration, setIsRegistration] = useState(false);
  const [error, setError] = useState("");
  const [contactType, setContactType] = useState<"phone" | "email">("phone");

  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, login, register } = useAuth();

  useEffect(() => {
    // Clear any previous errors
    setError("");
    
    const state = location.state as { contact?: string; name?: string; isRegistration?: boolean } | null;
    console.log("Verify page state:", state);

    if (state?.contact) {
      setContact(state.contact);
      setContactType(isEmail(state.contact) ? "email" : "phone");
      
      if (state.name) {
        setName(state.name);
        setIsRegistration(true);
      }
    } else {
      toast.error("Контактные данные не указаны");
      navigate("/login");
    }
  }, [location, navigate]);

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Пожалуйста, введите полный код подтверждения");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      console.log("Verifying OTP for contact:", contact, "with code:", otp);
      const user = await verifyOTP(contact, otp);
      console.log("Verification successful, user:", user);
      
      toast.success(isRegistration
        ? "Регистрация успешно завершена!"
        : `Добро пожаловать${user.name ? `, ${user.name}` : ""}!`
      );

      // Redirect based on user role
      if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (user.role === "PARTNER") {
        navigate("/partner-dashboard");
      } else {
        navigate("/profile");
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
    setIsSubmitting(true);
    setError("");

    try {
      if (isRegistration) {
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
            <h1 className="text-2xl font-bold">Подтверждение</h1>
            <p className="mt-2 text-muted-foreground">
              {contactType === "phone" 
                ? "Введите код из SMS для подтверждения" 
                : "Введите код из письма для подтверждения"}
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
                          index={i}
                          {...slot}
                        />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Код отправлен на {contactType === "phone" ? "номер" : ""}
                {" "}{contact}
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
