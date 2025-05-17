
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Loader2, AlertCircle, Mail, Phone } from "lucide-react";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [activeTab, setActiveTab] = useState<"phone" | "email">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const validateInput = (): boolean => {
    setError("");
    
    if (!name.trim()) {
      setError("Пожалуйста, введите имя");
      return false;
    }
    
    if (!contact.trim()) {
      setError(activeTab === "phone" ? 
        "Пожалуйста, введите номер телефона" : 
        "Пожалуйста, введите email");
      return false;
    }
    
    if (activeTab === "phone") {
      // Проверяем, что номер содержит только цифры (после удаления спец. символов)
      const digits = contact.replace(/\D/g, '');
      if (digits.length !== 11) {
        setError("Номер телефона должен содержать 11 цифр");
        return false;
      }
    } else {
      // Проверка формата email
      if (!contact.includes('@')) {
        setError("Неверный формат email, должен содержать @");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateInput()) return;
    
    setIsSubmitting(true);
    
    try {
      await register(name, contact);
      
      // Navigate to verify code page with contact info
      navigate("/verify-code", { state: { contact, name, isRegistration: true } });
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "Ошибка регистрации");
      toast.error(error.message || "Ошибка регистрации");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as "phone" | "email");
    setContact("");
    setError("");
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
          <h1 className="text-lg font-medium">Регистрация в GoodFit</h1>
        </div>
      </Header>
      
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Создайте аккаунт</h1>
            <p className="mt-2 text-muted-foreground">
              Выберите способ регистрации
            </p>
          </div>
          
          <Tabs 
            defaultValue="phone" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Телефон</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  required
                  className="rounded-xl text-base py-6"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact">
                  {activeTab === "phone" ? "Номер телефона" : "Email"}
                </Label>
                <Input
                  id="contact"
                  type={activeTab === "phone" ? "tel" : "email"}
                  placeholder={activeTab === "phone" 
                    ? "+7 (___) ___-__-__" 
                    : "email@example.com"
                  }
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    setError("");
                  }}
                  required
                  className="rounded-xl text-base py-6"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : "Зарегистрироваться"}
              </Button>
              
              <div className="text-center text-sm">
                Уже есть аккаунт?{" "}
                <Link to="/login" className="text-blue-500 hover:underline">
                  Войти
                </Link>
              </div>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
