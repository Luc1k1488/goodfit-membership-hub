
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassCard } from "@/components/ClassCard";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { User, Calendar, CreditCard, Settings } from "lucide-react";

const ProfilePage = () => {
  const { user, bookings, getClassById, getGymById } = useApp();
  const [activeTab, setActiveTab] = useState<string>("bookings");
  
  // Redirect if not logged in (handled by router)
  if (!user) {
    return (
      <div className="container px-4 py-16 mx-auto text-center sm:px-6">
        <h1 className="text-2xl font-bold">You must be logged in</h1>
        <p className="mt-4 text-gray-600">Please log in to view your profile</p>
        <Button className="mt-6" asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    );
  }
  
  // Filter bookings by status
  const userBookings = bookings.filter(booking => booking.userId === user.id);
  const activeBookings = userBookings.filter(booking => booking.status === 'BOOKED');
  const completedBookings = userBookings.filter(booking => booking.status === 'COMPLETED');
  const cancelledBookings = userBookings.filter(booking => booking.status === 'CANCELLED');
  
  // Get the classes for active bookings
  const activeClasses = activeBookings.map(booking => {
    const fitnessClass = getClassById(booking.classId);
    return fitnessClass;
  }).filter(Boolean);
  
  return (
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <div className="grid gap-6 md:grid-cols-[300px,1fr]">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 overflow-hidden rounded-full w-28 h-28 bg-gray-100">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <User className="w-16 h-16 m-6 text-gray-400" />
                )}
              </div>
              <CardTitle>{user.name}</CardTitle>
              {user.role !== 'USER' && (
                <Badge className="mt-2">{user.role}</Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p>{user.phone}</p>
                </div>
                {user.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p>{user.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/profile/edit">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Membership</CardTitle>
            </CardHeader>
            <CardContent>
              {user.subscriptionId ? (
                <div className="space-y-4">
                  <div>
                    <Badge className="bg-goodfit-primary">Active</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p>90-Day Pass</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expires</p>
                    <p>September 15, 2023</p>
                  </div>
                  <Button className="w-full" asChild>
                    <Link to="/subscriptions">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline">No active plan</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Subscribe to a membership plan to start booking classes.
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/subscriptions">
                      View Plans
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div>
          <h1 className="mb-6 text-2xl font-bold">My Profile</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bookings">
                <Calendar className="w-4 h-4 mr-2" />
                My Bookings
              </TabsTrigger>
              <TabsTrigger value="history">
                History
              </TabsTrigger>
              <TabsTrigger value="favorites">
                Favorites
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings" className="pt-6">
              <h2 className="mb-4 text-xl font-semibold">Upcoming Classes</h2>
              
              {activeBookings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {activeClasses.map((fitnessClass) => 
                    fitnessClass && (
                      <ClassCard 
                        key={fitnessClass.id} 
                        fitnessClass={fitnessClass} 
                        gym={
                          {
                            id: fitnessClass.gymId,
                            name: getGymById(fitnessClass.gymId)?.name || ""
                          }
                        }
                        showBookButton={false}
                      />
                    )
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium">No upcoming bookings</h3>
                  <p className="mb-4 text-gray-600">
                    You don't have any classes booked yet.
                  </p>
                  <Button asChild>
                    <Link to="/gyms">Browse Gyms</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="pt-6">
              <h2 className="mb-4 text-xl font-semibold">Completed Classes</h2>
              
              {completedBookings.length > 0 ? (
                <div className="space-y-4">
                  {completedBookings.map(booking => (
                    <Card key={booking.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-medium">{booking.className}</h3>
                          <p className="text-sm text-gray-500">{booking.gymName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.dateTime).toLocaleDateString()} at {new Date(booking.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Leave Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <h3 className="mb-2 text-lg font-medium">No completed classes</h3>
                  <p className="text-gray-600">
                    You haven't attended any classes yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="favorites" className="pt-6">
              <h2 className="mb-4 text-xl font-semibold">Favorite Gyms</h2>
              
              <div className="p-8 text-center bg-gray-50 rounded-lg">
                <h3 className="mb-2 text-lg font-medium">No favorite gyms yet</h3>
                <p className="mb-4 text-gray-600">
                  You haven't added any gyms to your favorites.
                </p>
                <Button asChild>
                  <Link to="/gyms">Browse Gyms</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
