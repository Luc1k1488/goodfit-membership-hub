
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-goodfit-primary">
                Good<span className="text-goodfit-secondary">Fit</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Your one subscription for all fitness needs. Access the best gyms, studios and sports centers in your city.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Services</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/gyms" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  Browse Gyms
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link to="/classes" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  Class Schedule
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  Become a Partner
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-goodfit-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-gray-200">
          <p className="text-sm text-center text-gray-500">
            &copy; {new Date().getFullYear()} GoodFit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
