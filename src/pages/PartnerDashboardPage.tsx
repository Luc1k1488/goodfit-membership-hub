
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/context/AppContext";
import { Home, Calendar, Users, TrendingUp, Plus, Dumbbell } from "lucide-react";

const PartnerDashboardPage = () => {
  const { user, gyms, addClass } = useApp();
  const navigate = useNavigate();
  
  // Partner's gyms
  const partnerGyms = user ? gyms.filter((gym) => gym.ownerId === user.id) : [];
  
  // Redirect if not a partner
  if (!user || user.role !== "PARTNER") {
    navigate("/");
    return null;
  }
  
  return (
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Partner Dashboard</h1>
      
      {/* Overview Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-blue-100 rounded-full">
              <Home className="w-8 h-8 text-goodfit-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Your Gyms</p>
              <p className="text-2xl font-bold">{partnerGyms.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-green-100 rounded-full">
              <Calendar className="w-8 h-8 text-goodfit-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Classes Today</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-amber-100 rounded-full">
              <Users className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Visits</p>
              <p className="text-2xl font-bold">347</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-purple-100 rounded-full">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold">₽156,400</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="gyms">
        <TabsList>
          <TabsTrigger value="gyms">My Gyms</TabsTrigger>
          <TabsTrigger value="classes">Manage Classes</TabsTrigger>
          <TabsTrigger value="bookings">Class Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gyms" className="pt-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Your Gyms & Studios</h2>
            <Button className="bg-goodfit-primary hover:bg-goodfit-dark">
              <Plus className="w-4 h-4 mr-2" /> Add New Gym
            </Button>
          </div>
          
          {partnerGyms.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {partnerGyms.map((gym) => (
                <Card key={gym.id}>
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={gym.mainImage} 
                      alt={gym.name} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-1 text-lg font-semibold">{gym.name}</h3>
                    <p className="mb-2 text-sm text-gray-500">{gym.address}</p>
                    <div className="flex items-center mb-3 text-sm text-gray-500">
                      <Home className="w-4 h-4 mr-1" />
                      {gym.city}
                    </div>
                    <div className="flex space-x-2">
                      <Button className="flex-1" variant="outline">Edit Details</Button>
                      <Button className="flex-1">Manage Classes</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center p-8 text-center">
                <Dumbbell className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="mb-2 text-lg font-medium">No Gyms Added Yet</h3>
                <p className="mb-6 text-gray-600">
                  You haven't added any gyms or fitness centers to your account.
                </p>
                <Button className="bg-goodfit-primary hover:bg-goodfit-dark">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Gym
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="classes" className="pt-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-semibold">Classes & Schedule</h2>
            <Button className="bg-goodfit-primary hover:bg-goodfit-dark">
              <Plus className="w-4 h-4 mr-2" /> Create New Class
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>All Classes</CardTitle>
              <CardDescription>
                Manage your class schedule and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Class Name</th>
                      <th className="p-3 text-left">Gym</th>
                      <th className="p-3 text-left">Date & Time</th>
                      <th className="p-3 text-left">Capacity</th>
                      <th className="p-3 text-left">Booked</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample class data */}
                    <tr className="border-b">
                      <td className="p-3">Morning HIIT</td>
                      <td className="p-3">PowerFit Gym</td>
                      <td className="p-3">Jul 1, 2023 - 07:00</td>
                      <td className="p-3">15</td>
                      <td className="p-3">8/15</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Evening Yoga</td>
                      <td className="p-3">ZenYoga Studio</td>
                      <td className="p-3">Jul 2, 2023 - 19:00</td>
                      <td className="p-3">20</td>
                      <td className="p-3">15/20</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">Cancel</Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Bookings</CardTitle>
              <CardDescription>
                View and manage bookings for today's classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Member</th>
                      <th className="p-3 text-left">Class</th>
                      <th className="p-3 text-left">Time</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample booking data */}
                    <tr className="border-b">
                      <td className="p-3">John Doe</td>
                      <td className="p-3">Morning HIIT</td>
                      <td className="p-3">07:00 - 08:00</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                          Confirmed
                        </span>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline">Check in</Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Jane Smith</td>
                      <td className="p-3">Morning HIIT</td>
                      <td className="p-3">07:00 - 08:00</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                          Confirmed
                        </span>
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="outline">Check in</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                View detailed analytics about your gyms and classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium">Monthly Visitors</h3>
                <div className="w-full h-64 p-4 bg-gray-100 border rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mr-4" />
                  <p className="text-gray-500">Analytics visualization coming soon</p>
                </div>
              </div>
              
              <div>
                <h3 className="mb-4 text-lg font-medium">Most Popular Classes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-3 text-left">Class Name</th>
                        <th className="p-3 text-left">Gym</th>
                        <th className="p-3 text-left">Bookings</th>
                        <th className="p-3 text-left">Popularity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Sample analytics data */}
                      <tr className="border-b">
                        <td className="p-3">Evening Yoga</td>
                        <td className="p-3">ZenYoga Studio</td>
                        <td className="p-3">89</td>
                        <td className="p-3">
                          <div className="relative w-full h-2 bg-gray-200 rounded">
                            <div className="absolute top-0 left-0 h-2 bg-goodfit-primary rounded" style={{ width: '75%' }}></div>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">Morning HIIT</td>
                        <td className="p-3">PowerFit Gym</td>
                        <td className="p-3">76</td>
                        <td className="p-3">
                          <div className="relative w-full h-2 bg-gray-200 rounded">
                            <div className="absolute top-0 left-0 h-2 bg-goodfit-primary rounded" style={{ width: '65%' }}></div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PartnerDashboardPage;
