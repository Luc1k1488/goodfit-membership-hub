
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/context/AppContext";

const SubscriptionsPage = () => {
  const { subscriptions } = useApp();
  
  return (
    <div className="container px-4 py-8 mx-auto sm:px-6">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold">Membership Plans</h1>
        <p className="mt-4 text-gray-600">
          Choose the perfect membership plan for your fitness journey. All plans give you
          unlimited access to all GoodFit partner locations.
        </p>
      </div>
      
      <div className="grid gap-6 mb-16 md:grid-cols-2 lg:grid-cols-4">
        {subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h2 className="mb-6 text-2xl font-bold">Membership Benefits</h2>
        
        <Tabs defaultValue="all_plans">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all_plans">All Plans</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="annual">Annual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all_plans" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Core Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Access to all partner gyms and studios</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Unlimited class bookings</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>No long-term commitments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Mobile app for booking and check-in</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Limitations</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-red-400 rounded-full"></div>
                    <span>Maximum 1 visit per day per location</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-red-400 rounded-full"></div>
                    <span>Some premium classes may have additional fees</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-red-400 rounded-full"></div>
                    <span>Class bookings open 24 hours in advance</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monthly" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Monthly Plan Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>All core benefits</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Perfect for trying out the service</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Cancel anytime</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Ideal For</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>First-time users trying out GoodFit</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Those with changing schedules</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>People who prefer flexibility</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quarterly" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Quarterly Plan Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>All monthly benefits</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>16% savings compared to monthly plan</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Priority booking window (book 48 hours in advance)</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Ideal For</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Regular fitness enthusiasts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Those who want to save some money</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>People who value booking popular classes</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="annual" className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Annual Plan Benefits</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>All quarterly benefits</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>28% savings compared to monthly plan</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Free guest pass each month</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Complimentary fitness consultation</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-secondary rounded-full"></div>
                    <span>Priority booking (72 hours in advance)</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-gray-50">
                <h3 className="mb-4 text-xl font-semibold">Ideal For</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Committed fitness enthusiasts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>Those looking for maximum value</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 mt-2 mr-2 bg-goodfit-primary rounded-full"></div>
                    <span>People who want to bring friends occasionally</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How many times can I visit a gym per day?</AccordionTrigger>
            <AccordionContent>
              You can visit each partner location once per day. However, you can visit multiple different locations in the same day.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I cancel my subscription anytime?</AccordionTrigger>
            <AccordionContent>
              Yes, you can cancel your subscription at any time. For monthly plans, there is no commitment. For quarterly and annual plans, you can still cancel but will not receive a refund for the unused portion.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>How do I book a class?</AccordionTrigger>
            <AccordionContent>
              You can book classes through our mobile app or website. Simply browse the schedule for your preferred gym, select a class, and tap "Book". You can book classes 24-72 hours in advance depending on your membership type.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger>What happens if I miss a booked class?</AccordionTrigger>
            <AccordionContent>
              If you can't attend a class, please cancel your booking at least 2 hours before the class starts. Repeated no-shows may result in booking restrictions.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger>Do you offer corporate memberships?</AccordionTrigger>
            <AccordionContent>
              Yes, we offer special corporate rates for companies. Please contact our corporate sales team at corporate@goodfit.com for more information.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
