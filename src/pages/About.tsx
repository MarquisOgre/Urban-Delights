import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Award, Users, Heart, Target, Star, Leaf, ShoppingCart } from "lucide-react";
import heroSpices from "@/assets/hero-spices.jpg";

const About = () => {
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
              <Link to="/" className="text-gray-700 hover:text-orange-600 transition-colors">Home</Link>
              <Link to="/about" className="text-orange-600 font-medium">About Us</Link>
              <Link to="/recipes" className="text-gray-700 hover:text-orange-600 transition-colors">Recipes Dashboard</Link>
              <Link to="/investor-pitch" className="text-gray-700 hover:text-orange-600 transition-colors">Investor Pitch</Link>
              <Link to="/contact" className="text-gray-700 hover:text-orange-600 transition-colors">Contact</Link>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroSpices})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Us</h1>
          <p className="text-xl md:text-2xl font-light">
            Preserving Tradition, Creating Excellence
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Artisan Delights was born from a deep love for authentic South Indian flavors and a mission to preserve traditional recipes that have been cherished for generations. Our journey began in the heart of Hyderabad, where the rich culinary heritage of Andhra Pradesh and Telangana comes alive.
              </p>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                What started as a passion project to recreate our grandmother's authentic podi recipes has evolved into a mission to bring these pure, natural flavors to kitchens worldwide. We believe that food is more than nutrition—it's culture, heritage, and love served on a plate.
              </p>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Every spice blend we create tells a story of tradition, quality, and authenticity. We source the finest ingredients, use time-tested preparation methods, and package our products with the same care you would find in a traditional Indian home.
              </p>
            </div>
            <div className="relative">
              <img 
                src={heroSpices} 
                alt="Traditional spice preparation"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Mission & Vision</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Driving our passion for authentic flavors and quality
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Our Mission</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To preserve and popularize traditional South Indian spice blends using premium ingredients, sustainable practices, and authentic preparation methods. We aim to make healthy, natural, and flavorful cooking accessible to families worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Our Vision</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  To become the global leader in authentic South Indian spice blends, making our traditional flavors a household essential in kitchens around the world while maintaining the highest standards of quality and authenticity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Quality First</h3>
              <p className="text-gray-600">
                We never compromise on the quality of our ingredients or our preparation process. Every batch is crafted to perfection.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Natural & Pure</h3>
              <p className="text-gray-600">
                100% natural ingredients with no preservatives, artificial colors, or harmful additives. Pure goodness in every packet.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Made with Love</h3>
              <p className="text-gray-600">
                Every product is handcrafted with care, attention to detail, and the same love you'd find in a traditional home kitchen.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Focus</h3>
              <p className="text-gray-600">
                Our customers are at the heart of everything we do. We listen, learn, and continuously improve to serve you better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Process */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Production Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Traditional methods meet modern hygiene standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Sourcing</h3>
                <p className="text-gray-600">
                  We carefully select premium ingredients from trusted suppliers, ensuring freshness and quality at every step.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Preparation</h3>
                <p className="text-gray-600">
                  Traditional dry-roasting and grinding methods are used in our hygienic, food-grade production facility.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-4">Packaging</h3>
                <p className="text-gray-600">
                  Small batch production ensures freshness, with each package sealed for maximum shelf life and quality preservation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Culinary Journey</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the authentic taste of South Indian cuisine with our handcrafted spice blends.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Explore Our Products
            </Button>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg">
                Get In Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;