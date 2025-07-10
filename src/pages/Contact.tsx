import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, ShoppingCart, Send, ArrowLeft } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Artisan Delights" className="h-10 w-10" />
              <span className="text-2xl font-bold text-orange-600">Artisan Delights</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors">Home</Link>
              <Link to="/recipes" className="text-gray-700 hover:text-orange-600 transition-colors">Recipes Dashboard</Link>
              <Link to="/investor-pitch" className="text-gray-700 hover:text-orange-600 transition-colors">Investor Pitch</Link>
              <Link to="/contact" className="text-orange-600 font-medium">Contact</Link>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/" className="text-white hover:text-orange-200 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl text-orange-100">
                We'd love to hear from you. Get in touch with us today!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800">Send us a Message</CardTitle>
                <p className="text-gray-600">
                  Have questions about our products or want to place a bulk order? Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What is this regarding?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[120px]"
                  />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Phone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Phone</h3>
                      <p className="text-gray-600">+91 12345 67890</p>
                      <p className="text-gray-600">+91 09876 54321</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Mail className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-600">info@artisandelights.com</p>
                      <p className="text-gray-600">orders@artisandelights.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Address</h3>
                      <p className="text-gray-600">
                        Artisan Delights Production Unit<br />
                        Hitech City, Hyderabad<br />
                        Telangana 500081, India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Business Hours</h3>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 9:00 AM - 2:00 PM</p>
                      <p className="text-gray-600">Sunday: Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Bulk Orders & Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Interested in wholesale pricing or becoming a distributor? We offer special rates for:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>Retail stores and supermarkets</li>
                    <li>Restaurants and food service</li>
                    <li>Export and international distribution</li>
                    <li>Wedding and event catering</li>
                  </ul>
                  <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                    Request Bulk Pricing
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Quality Assurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We maintain the highest standards of quality and hygiene:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>FSSAI certified production facility</li>
                    <li>ISO 22000 food safety standards</li>
                    <li>Regular quality testing</li>
                    <li>100% satisfaction guarantee</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Visit Our Production Facility</h2>
            <p className="text-gray-600">
              Schedule a visit to see how we craft our authentic spice blends
            </p>
          </div>
          <div className="bg-gray-300 h-64 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-600">Interactive Map Coming Soon</p>
              <p className="text-sm text-gray-500">Hitech City, Hyderabad, Telangana</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Artisan Delights" className="h-8 w-8" />
                <span className="text-xl font-bold">Artisan Delights</span>
              </div>
              <p className="text-gray-400">
                Handcrafted South Indian spice blends made with traditional recipes and premium ingredients.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-400">Sambar Powder</span></li>
                <li><span className="text-gray-400">Rasam Powder</span></li>
                <li><span className="text-gray-400">Idly Podi</span></li>
                <li><span className="text-gray-400">Chutney Podi</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-gray-400">+91 12345 67890</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-gray-400">info@artisandelights.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-gray-400">Hyderabad, Telangana, India</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Artisan Delights. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;