
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Users, Home, Calendar, DollarSign, TrendingUp, Star } from "lucide-react";

const AdminDashboardPage = () => {
  const { user, gyms, filteredGyms, updateGym } = useApp();
  const navigate = useNavigate();
  
  // Redirect if not an admin
  if (!user || user.role !== "ADMIN") {
    navigate("/");
    return null;
  }
  
  return (
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Overview Stats */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-blue-100 rounded-full">
              <Users className="w-8 h-8 text-goodfit-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">25,420</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-green-100 rounded-full">
              <Home className="w-8 h-8 text-goodfit-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Partner Gyms</p>
              <p className="text-2xl font-bold">{gyms.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-amber-100 rounded-full">
              <Calendar className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Classes Today</p>
              <p className="text-2xl font-bold">184</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex flex-row items-center p-6">
            <div className="p-3 mr-4 bg-purple-100 rounded-full">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
              <p className="text-2xl font-bold">₽1.2M</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Dashboard Content */}
      <Tabs defaultValue="gyms">
        <TabsList>
          <TabsTrigger value="gyms">Manage Gyms</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gyms" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Gyms</CardTitle>
              <CardDescription>
                Manage all partner gyms and studios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">City</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Rating</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gyms.slice(0, 5).map((gym) => (
                      <tr key={gym.id} className="border-b">
                        <td className="p-3">{gym.name}</td>
                        <td className="p-3">{gym.city}</td>
                        <td className="p-3">
                          {gym.category[0]}
                          {gym.category.length > 1 && ", ..."}
                        </td>
                        <td className="p-3">{gym.rating.toFixed(1)}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">View</Button>
                            <Button size="sm" variant="outline">Edit</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-center mt-4">
                <Button variant="outline">View All Gyms</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">User management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>
                Manage subscription plans and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <p className="text-gray-500">Subscription management features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                View detailed analytics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium">Monthly Signups</h3>
                <div className="w-full h-64 p-4 bg-gray-100 border rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mr-4" />
                  <p className="text-gray-500">Analytics visualization coming soon</p>
                </div>
              </div>
              
              <div>
                <h3 className="mb-4 text-lg font-medium">Popular Gyms</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {gyms.slice(0, 3).map((gym) => (
                    <Card key={gym.id}>
                      <CardContent className="p-4">
                        <h4 className="font-medium">{gym.name}</h4>
                        <p className="text-sm text-gray-500">{gym.city}</p>
                        <div className="flex items-center mt-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="ml-1">{gym.rating}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{gym.reviewCount} reviews</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
