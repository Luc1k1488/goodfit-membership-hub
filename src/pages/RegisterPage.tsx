
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Header } from "@/components/Header";
import { ChevronLeft } from "lucide-react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const navigate = useNavigate();
  const { register, verifyOTP } = useAuth();

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await register(name, phone);
      setShowOtpInput(true);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const user = await verifyOTP(phone, otp);
      
      // Update user's name if needed
      if (!user.name && name) {
        const { error } = await supabase
          .from('users')
          .update({ name })
          .eq('id', user.id);
          
        if (error) {
          console.error("Error updating user name:", error);
        }
      }
      
      toast.success("Регистрация успешна!");
      navigate("/profile");
    } catch (error) {
      console.error("OTP verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header>
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-medium">Регистрация</h1>
        </div>
      </Header>
      
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Создайте аккаунт</h1>
            <p className="mt-2 text-muted-foreground">
              {showOtpInput ? "Введите код из SMS" : "Введите ваши данные для регистрации"}
            </p>
          </div>
          
          {!showOtpInput ? (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="space-y-2">
                <Label htmlFor="name">Ваше имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl text-base py-6"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="rounded-xl text-base py-6"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-goodfit-primary hover:bg-goodfit-dark rounded-xl py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Отправка..." : "Получить код"}
              </Button>
              
              <div className="text-center text-sm">
                Уже есть аккаунт?{" "}
                <Link to="/login" className="text-goodfit-primary hover:underline">
                  Войти
                </Link>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="space-y-4">
                <Label htmlFor="otp">Введите код из SMS</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    render={({ slots }) => (
                      <InputOTPGroup>
                        {slots.map((slot, index) => (
                          <InputOTPSlot key={index} {...slot} />
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
                className="w-full bg-goodfit-primary hover:bg-goodfit-dark rounded-xl py-6"
                disabled={isSubmitting || otp.length < 6}
              >
                {isSubmitting ? "Проверка..." : "Зарегистрироваться"}
              </Button>
              
              <div className="text-center text-sm">
                <Button
                  variant="link"
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="text-goodfit-primary p-0"
                >
                  Изменить данные
                </Button>
              </div>
              
              <div className="text-center text-sm mt-4">
                <Button
                  variant="link"
                  type="button"
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      await register(name, phone);
                      toast.success("Новый код отправлен");
                    } catch (error) {
                      console.error("Error resending code:", error);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="text-goodfit-primary p-0"
                  disabled={isSubmitting}
                >
                  Отправить код повторно
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
