import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Star, Award, Leaf, Heart, ShoppingCart, Phone, Mail, MapPin } from "lucide-react";

// Import product images
import heroSpices from "@/assets/hero-spices.jpg";
import putnalu from "@/assets/putnalu-podi.jpg";
import palli from "@/assets/palli-podi.jpg";
import karvepaku from "@/assets/karvepaku-podi.jpg";
import kobari from "@/assets/kobari-powder.jpg";
import sambar from "@/assets/sambar-powder.jpg";
import rasam from "@/assets/rasam-powder.jpg";
import chutney from "@/assets/chutney-podi.jpg";
import idly from "@/assets/idly-podi.jpg";
import polihora from "@/assets/polihora-podi.jpg";
import vangibhat from "@/assets/vangibhat-powder.jpg";
import kura from "@/assets/kura-podi.jpg";
import bisibellebath from "@/assets/bisibellebath-powder.jpg";

const products = [
  { name: "Putnalu Podi", image: putnalu, description: "Roasted gram dal powder - Perfect with rice & ghee" },
  { name: "Palli Podi", image: palli, description: "Traditional groundnut powder - Rich in protein & flavor" },
  { name: "Karvepaku Podi", image: karvepaku, description: "Curry leaves powder - Aromatic & healthy seasoning" },
  { name: "Kobari Powder", image: kobari, description: "Fresh coconut powder - Pure & natural sweetness" },
  { name: "Sambar Powder", image: sambar, description: "Authentic sambar spice blend - Traditional recipe" },
  { name: "Rasam Powder", image: rasam, description: "Tangy rasam spice mix - Perfect for South Indian cuisine" },
  { name: "Chutney Podi", image: chutney, description: "Versatile chutney powder - Instant flavor enhancer" },
  { name: "Idly Podi", image: idly, description: "Classic idli powder - Traditional breakfast companion" },
  { name: "Polihora Podi", image: polihora, description: "Special poha powder - Unique family recipe" },
  { name: "Vangibhat Powder", image: vangibhat, description: "Brinjal rice spice - Authentic Andhra flavor" },
  { name: "Kura Podi", image: kura, description: "Vegetable curry powder - Perfect spice blend" },
  { name: "Bisibellebath Powder", image: bisibellebath, description: "Karnataka special - Lentil curry powder" }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Artisan Delights" className="h-10 w-10" />
              <span className="text-2xl font-bold text-orange-600">Artisan Delights</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-orange-600 font-medium">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-orange-600 transition-colors">About Us</Link>
              <Link to="/recipes" className="text-gray-700 hover:text-orange-600 transition-colors">Recipes Dashboard</Link>
              <Link to="/investor-pitch" className="text-gray-700 hover:text-orange-600 transition-colors">Investor Pitch</Link>
              <Link to="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">Contact</Link>
              <Link to="/about">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroSpices})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Artisan <span className="text-orange-400">Delights</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Handcrafted South Indian Spice Blends Made with Love & Tradition
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/about">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shop Our Products
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="bg-white/20 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg">
                Learn Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Natural</h3>
              <p className="text-gray-600">No preservatives or artificial colors</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Traditional Recipes</h3>
              <p className="text-gray-600">Authentic family recipes passed down generations</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Small batch production for freshness</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Made with Love</h3>
              <p className="text-gray-600">Handcrafted with care and attention</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Signature Spice Blends</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our collection of 12 authentic South Indian spice blends, each crafted using traditional recipes and premium ingredients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-600 text-white">
                      Traditional
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-bold text-lg">₹250-300</span>
                    <Link to="/contact">
                      <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                        Add to Cart
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Artisan Delights was born from a passion to preserve and share the authentic flavors of South Indian cuisine. 
                Our journey began with traditional family recipes that have been passed down through generations.
              </p>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                We believe that food should be pure, natural, and full of flavor. That's why we use only the finest ingredients, 
                dry-roast them to perfection, and blend them in small batches to ensure maximum freshness and authenticity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/about">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Read Our Full Story
                  </Button>
                </Link>
                <Link to="/investor-pitch">
                  <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
                    Investor Information
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroSpices} 
                alt="Traditional spice grinding"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-orange-600 text-white p-6 rounded-lg shadow-xl">
                <div className="text-3xl font-bold">300kg</div>
                <div className="text-sm">Monthly Production</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Experience Authentic Flavors?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made our spice blends a part of their daily cooking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/about">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg">
                <Phone className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Artisan Delights" className="h-8 w-8" />
                <span className="text-xl font-bold">Artisan Delights</span>
              </Link>
              <p className="text-gray-400">
                Handcrafted South Indian spice blends made with traditional recipes and premium ingredients.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/recipes" className="text-gray-400 hover:text-white transition-colors">Recipes</Link></li>
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

export default Home;