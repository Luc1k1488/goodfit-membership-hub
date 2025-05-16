
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-goodfit-primary to-goodfit-dark text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Ccircle cx=\"13\" cy=\"13\" r=\"3\"/%3E%3C/g%3E%3C/svg%3E')",
          backgroundSize: "24px 24px"
        }}></div>
      </div>

      <div className="container relative z-10 px-6 py-16 mx-auto text-center md:py-24 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            One Membership.<br />
            <span className="text-goodfit-secondary">All The Fitness</span> You Need.
          </h1>
          
          <p className="max-w-xl mx-auto mt-6 text-lg">
            Join GoodFit to access hundreds of gyms, studios, and sports centers in your city with a single membership. No contracts, no commitments, just fitness.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 mt-8 sm:flex-row">
            <Button size="lg" className="bg-goodfit-secondary hover:bg-green-600 text-white" asChild>
              <Link to="/subscriptions">
                See Membership Options
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/gyms">
                Browse Partner Gyms
              </Link>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold">500+</p>
              <p className="text-sm">Partner Locations</p>
            </div>
            <div className="h-12 border-l border-white/20"></div>
            <div>
              <p className="text-3xl font-bold">50,000+</p>
              <p className="text-sm">Happy Members</p>
            </div>
            <div className="h-12 border-l border-white/20"></div>
            <div>
              <p className="text-3xl font-bold">10+</p>
              <p className="text-sm">Cities</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
