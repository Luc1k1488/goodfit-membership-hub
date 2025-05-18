
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription } from "@/types";
import { Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router-dom";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { currentUser: appUser } = useApp();
  const { currentUser: authUser } = useAuth();
  const navigate = useNavigate();
  
  const handleSubscribe = () => {
    if (!authUser && !appUser) {
      navigate("/login");
      return;
    }
    
    // Here would be subscription logic
    console.log("Subscribing to plan:", subscription.id);
  };
  
  return (
    <Card className={`overflow-hidden ${
      subscription.isPopular 
        ? "border-2 border-blue-500" 
        : "border border-border"
    } rounded-xl`}>
      <CardHeader className="px-6 pt-6 pb-4">
        {subscription.isPopular && (
          <Badge className="w-fit mb-2 bg-blue-500 text-white">
            Популярный
          </Badge>
        )}
        <h3 className="text-2xl font-bold">{subscription.name}</h3>
        <div className="flex items-baseline mt-1">
          <span className="text-3xl font-bold">
            {subscription.price} ₽
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            / {subscription.durationDays} дней
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6">
        <ul className="space-y-2">
          {subscription.features?.map((feature, index) => (
            <li key={index} className="flex">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="px-6 pb-6 pt-0">
        <Button 
          onClick={handleSubscribe} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6"
        >
          Купить
        </Button>
      </CardFooter>
    </Card>
  );
}
