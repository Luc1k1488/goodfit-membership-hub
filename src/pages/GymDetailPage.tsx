
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClassCard } from "@/components/ClassCard";
import { useApp } from "@/context/AppContext";
import { Star, Clock, MapPin } from "lucide-react";

const GymDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getGymById, getGymClasses } = useApp();
  const [activeTab, setActiveTab] = useState<string>("classes");
  
  const gym = getGymById(id || "");
  const classes = id ? getGymClasses(id) : [];
  
  if (!gym) {
    return (
      <div className="container px-4 py-16 mx-auto text-center sm:px-6">
        <h1 className="text-2xl font-bold">Gym not found</h1>
        <p className="mt-4 text-gray-600">The gym you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-6" asChild>
          <Link to="/gyms">Back to Gyms</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <div className="mb-6">
        <Link to="/gyms" className="text-goodfit-primary hover:underline">
          &larr; Back to Gyms
        </Link>
      </div>
      
      {/* Gym Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">{gym.name}</h1>
            <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {gym.address}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {gym.workingHours.open} - {gym.workingHours.close}
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                {gym.rating} ({gym.reviewCount} reviews)
              </div>
            </div>
          </div>
          <Button className="bg-goodfit-primary hover:bg-goodfit-dark">
            Book a Class
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {gym.category.map((category, index) => (
            <Badge key={index} variant="outline" className="capitalize">
              {category}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Gym Images */}
      <div className="grid gap-4 mb-8 md:grid-cols-2">
        <img 
          src={gym.mainImage} 
          alt={gym.name} 
          className="object-cover w-full h-64 rounded-lg"
        />
        <div className="grid grid-cols-2 gap-4">
          {gym.images.slice(0, 2).map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt={`${gym.name} ${index + 1}`}
              className="object-cover w-full h-full rounded-lg"
            />
          ))}
        </div>
      </div>
      
      {/* Gym Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classes" className="pt-6">
          <h2 className="mb-4 text-xl font-semibold">Upcoming Classes</h2>
          {classes.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((fitnessClass) => (
                <ClassCard 
                  key={fitnessClass.id} 
                  fitnessClass={fitnessClass} 
                  showBookButton={true}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg">
              <p>No upcoming classes scheduled. Check back soon!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="pt-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold">About {gym.name}</h2>
              <p className="text-gray-700">{gym.description}</p>
              <h3 className="mt-6 mb-3 text-lg font-medium">Features</h3>
              <ul className="grid grid-cols-2 gap-2">
                {gym.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h2 className="mb-4 text-xl font-semibold">Location</h2>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center mb-4">
                <p className="text-gray-500">Map placeholder</p>
              </div>
              <p className="text-gray-700">{gym.address}</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="pt-6">
          <h2 className="mb-4 text-xl font-semibold">Member Reviews</h2>
          <div className="flex items-center mb-6">
            <div className="flex items-center mr-4">
              <Star className="w-6 h-6 text-yellow-400 mr-1 fill-current" />
              <span className="text-2xl font-bold">{gym.rating}</span>
            </div>
            <span className="text-gray-600">Based on {gym.reviewCount} reviews</span>
          </div>
          
          <div className="space-y-6">
            {/* Sample reviews - would come from API in a real app */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="font-medium">Maria S.</p>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-500">2 months ago</span>
              </div>
              <p className="text-gray-700">
                Great facilities and friendly staff! The equipment is always clean and well-maintained.
              </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4" />
                </div>
                <p className="font-medium">Alex T.</p>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-gray-500">3 weeks ago</span>
              </div>
              <p className="text-gray-700">
                The classes here are amazing! The instructors are knowledgeable and motivating.
                Only giving 4 stars because the changing rooms can get crowded during peak hours.
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Button className="bg-goodfit-primary hover:bg-goodfit-dark">
              Write a Review
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GymDetailPage;
