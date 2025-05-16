
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import { Subscription } from "@/types";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { user } = useApp();
  const dailyPrice = Math.round(subscription.price / subscription.durationDays);
  
  return (
    <Card className={`relative overflow-hidden transition-transform hover:-translate-y-1 ${
      subscription.isPopular ? 'border-goodfit-secondary shadow-lg' : ''
    }`}>
      {subscription.isPopular && (
        <div className="absolute top-0 right-0 bg-goodfit-secondary text-white px-4 py-1 text-xs font-medium uppercase tracking-wider">
          Most Popular
        </div>
      )}
      
      <CardHeader className="pb-0">
        <h3 className="text-xl font-bold">{subscription.name}</h3>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4 text-center">
          <p className="text-4xl font-bold">
            ₽{(subscription.price / 100).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            ₽{(dailyPrice / 100).toLocaleString()} per day
          </p>
        </div>
        
        <ul className="space-y-2 mb-6">
          {subscription.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="mr-2 h-5 w-5 text-goodfit-secondary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-goodfit-primary hover:bg-goodfit-dark"
          asChild
        >
          <Link to={user ? "/checkout" : "/login"}>
            {user ? "Subscribe Now" : "Log in to Subscribe"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
