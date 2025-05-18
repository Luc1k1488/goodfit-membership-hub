import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HeroSection } from "@/components/HeroSection";
import { GymCard } from "@/components/GymCard";
import { ClassCard } from "@/components/ClassCard";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Star, Map, Dumbbell, Calendar, ArrowRight } from "lucide-react";
import { parseISO } from 'date-fns';

const HomePage = () => {
  const { gyms, classes, subscriptions, getGymById } = useApp();
  
  // Get featured gyms (top rated)
  const featuredGyms = [...gyms]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);
    
  // Get upcoming classes
  const upcomingClasses = [...classes]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);
    
  // Get classes with gym info
  const classesWithGym = upcomingClasses.map(cls => ({
    ...cls,
    gym: getGymById(cls.gymId)
  }));
  
  // Sort by date
  const sorted = [...classes].sort((a, b) => 
    parseISO(a.starttime).getTime() - parseISO(b.starttime).getTime()
  );
  
  // Get top classes
  const topClasses = sorted.slice(0, 3);
  
  // Get top gyms
  const gymIds = topClasses.map(cls => cls.gymid);
  const topGymsData = gyms.filter(gym => gymIds.includes(gym.id));
  
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      
      {/* Featured Gyms Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 mx-auto sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Gyms</h2>
            <Button variant="ghost" asChild>
              <Link to="/gyms" className="flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredGyms.map((gym) => (
              <GymCard key={gym.id} gym={gym} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Upcoming Classes Section */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Upcoming Classes</h2>
            <Button variant="ghost" asChild>
              <Link to="/classes" className="flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classesWithGym.map((cls) => (
              <ClassCard 
                key={cls.id} 
                fitnessClass={cls} 
                gym={cls.gym ? { id: cls.gym.id, name: cls.gym.name } : undefined}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 mx-auto sm:px-6">
          <h2 className="mb-12 text-2xl font-bold text-center">How GoodFit Works</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-goodfit-light text-goodfit-primary">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">1. Find Gyms</h3>
              <p className="text-gray-600">
                Browse our network of partner gyms, studios, and sports centers in your city.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-goodfit-light text-goodfit-primary">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">2. Choose a Plan</h3>
              <p className="text-gray-600">
                Select a subscription that fits your lifestyle. No contracts, cancel anytime.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-goodfit-light text-goodfit-primary">
                <Dumbbell className="w-8 h-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">3. Start Working Out</h3>
              <p className="text-gray-600">
                Book classes, check in at gyms, and enjoy unlimited fitness options.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Subscription Plans */}
      <section className="py-12 bg-gray-50">
        <div className="container px-4 mx-auto sm:px-6">
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-2xl font-bold">Choose Your Membership</h2>
            <p className="mt-4 text-gray-600">
              Join GoodFit with a plan that works for you. All memberships include unlimited access to partner locations.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button size="lg" className="bg-goodfit-primary hover:bg-goodfit-dark" asChild>
              <Link to="/subscriptions">
                View All Membership Details
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="container px-4 mx-auto sm:px-6">
          <h2 className="mb-12 text-2xl font-bold text-center">What Our Members Say</h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-4 text-goodfit-primary">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="mb-4 italic text-gray-600">
                "GoodFit completely changed how I approach fitness. With one subscription I can now try different workouts and find what works best for me."
              </p>
              <p className="font-medium">Anna K., Member since 2023</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-4 text-goodfit-primary">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="mb-4 italic text-gray-600">
                "I travel across the city for work and GoodFit lets me work out wherever I am. The variety of gyms and classes is amazing!"
              </p>
              <p className="font-medium">Mikhail T., Member since 2022</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-4 text-goodfit-primary">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="mb-4 italic text-gray-600">
                "The ability to book classes through the app and try different fitness studios has kept me motivated. Best fitness investment I've made."
              </p>
              <p className="font-medium">Olga V., Member since 2022</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 text-white bg-goodfit-primary">
        <div className="container px-4 mx-auto text-center sm:px-6">
          <h2 className="text-3xl font-bold">Ready to Transform Your Fitness Journey?</h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg">
            Join GoodFit today and get access to hundreds of fitness facilities with a single membership.
          </p>
          <div className="mt-8">
            <Button size="lg" className="bg-white text-goodfit-primary hover:bg-gray-100" asChild>
              <Link to="/register">
                Sign Up Now
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
