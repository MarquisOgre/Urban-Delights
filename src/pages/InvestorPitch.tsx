'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Package,
  Globe,
  TrendingUp,
  DollarSign,
  Target,
  Building,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const InvestorPitch = () => {
  const [currentView, setCurrentView] = useState('investor-pitch');

  const exportAllData = () => {
    alert('Export All Data triggered!');
  };

  const products = [
    'Putnalu Podi', 'Palli Podi', 'Karvepaku Podi', 'Kobari Powder',
    'Sambar Powder', 'Rasam Powder', 'Chutney Podi', 'Idly Podi',
    'Polihora Podi', 'Vangibhat Powder', 'Kura Podi', 'Bisibellebath Powder'
  ];

  const investmentBreakdown = [
    { category: 'Shed Construction', details: '400–500 sq.ft hygienic food-grade shed', cost: '₹2,50,000' },
    { category: 'Electrical & Plumbing Setup', details: 'Water tank, motor, wiring, plumbing', cost: '₹50,000' },
    { category: 'Machinery', details: 'Grinder, Roaster, Sealer, Weighing scale', cost: '₹60,000' },
    { category: 'Packaging & Labels', details: 'Initial printed pouches + label design', cost: '₹20,000' },
    { category: 'Raw Material (2 months stock)', details: 'Bulk purchase of ingredients', cost: '₹1,00,000' },
    { category: 'Labor (Initial Setup + 2 months)', details: 'Packing, roasting, grinding (1–2 staff)', cost: '₹50,000' },
    { category: 'Licensing (FSSAI, GST, etc.)', details: 'Legal & registration costs', cost: '₹10,000' },
    { category: 'Marketing & Website', details: 'Branding, Shopify/D2C site, social ads', cost: '₹30,000' },
    { category: 'Contingency & Miscellaneous', details: 'Buffer for unforeseen expenses', cost: '₹30,000' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-24">
      <Header currentView={currentView} setCurrentView={setCurrentView} exportAllData={exportAllData} />

      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-orange-800 mb-2">
            Artisan Delights – Investor Pitch Summary
          </h1>
          <p className="text-lg text-gray-600">Handcrafted South Indian Spice Blends for Global Markets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brand Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                Brand Introduction & Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-orange-700">Brand:</h3>
                <p>Artisan Delights</p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-700">Concept:</h3>
                <p>Handcrafted South Indian spice blends (podis) made using traditional recipes and small-batch production.</p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-700">Vision:</h3>
                <p>To make authentic South Indian spice blends a global household essential.</p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-700">Mission:</h3>
                <p>To preserve and popularize traditional podi recipes using premium ingredients and sustainable packaging.</p>
              </div>
            </CardContent>
          </Card>

          {/* Product Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                Product Line Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-orange-700 mb-2">12 Podis:</h3>
              <div className="grid grid-cols-2 gap-1">
                {products.map((product, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {product}
                  </Badge>
                ))}
              </div>
              <div>
                <h3 className="font-semibold text-orange-700">Highlights:</h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>No preservatives or colors</li>
                  <li>Dry-roasted for long shelf life</li>
                  <li>100% vegetarian, high protein/fiber content</li>
                  <li>Rich regional flavor appeal</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Production */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="text-purple-600" size={20} />
                Production, Packaging & Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-orange-700">Initial Capacity:</h3>
                <p>300 kg/month</p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-700">Production:</h3>
                <p>Small batch, hygienic manual & machine blend</p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-700">Packaging:</h3>
                <p>Premium food-grade pouches (500g / 1kg), QR coded</p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-700">Distribution:</h3>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Amazon, Flipkart (E-commerce)</li>
                  <li>D2C via brand website</li>
                  <li>Retail shops & ethnic stores</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Market Opportunity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-green-600" size={20} />
                Market Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-orange-700">India:</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>Urban foodies & health-conscious consumers</li>
                <li>Rural regions with traditional taste demand</li>
              </ul>
              <h3 className="font-semibold text-orange-700">Global:</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>NRI markets (USA, UK, UAE, AUS)</li>
                <li>Growing demand for Indian ready-to-use spice blends</li>
                <li>Gifting & bulk demand in wedding/ethnic markets</li>
              </ul>
            </CardContent>
          </Card>

          {/* Revenue Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="text-yellow-600" size={20} />
                Revenue Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-1">
                <li>Direct to Consumer (D2C): Website, marketplaces</li>
                <li>Wholesale/B2B: Grocery chains, restaurants</li>
                <li>Subscription Boxes & Gift Packs</li>
                <li>Export Distribution: via Amazon Global & food distributors</li>
              </ul>
            </CardContent>
          </Card>

          {/* Financial Projections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={20} />
                Financial Projections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-orange-700">Monthly Production:</span> <p>300 kg</p></div>
                <div><span className="font-semibold text-orange-700">Avg Cost per kg:</span> <p>₹250–₹300</p></div>
                <div><span className="font-semibold text-orange-700">Avg Selling Price:</span> <p>₹500–₹600</p></div>
                <div><span className="font-semibold text-orange-700">Year 1 Revenue:</span> <p>₹18–20 Lakhs</p></div>
                <div><span className="font-semibold text-orange-700">Break-even:</span> <p>Year 2</p></div>
                <div><span className="font-semibold text-orange-700">5-Year Growth:</span> <p>₹1 Cr+ revenue</p></div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Strategy */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="text-red-600" size={20} />
                Growth & Export Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div><h3 className="font-semibold text-orange-700">Scale Up:</h3><p>300 kg → 1 ton/month</p></div>
              <div><h3 className="font-semibold text-orange-700">Export Compliance:</h3><p>Multilingual labels, FSSAI + export-ready certifications</p></div>
              <div><h3 className="font-semibold text-orange-700">Distribution Tie-ups:</h3><p>Indian stores in US, UAE, UK</p></div>
              <div><h3 className="font-semibold text-orange-700">Brand Building:</h3><p>Food bloggers, influencers, chefs</p></div>
            </CardContent>
          </Card>

          {/* Investment Ask */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="text-green-600" size={20} />
                Investment Ask
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold text-orange-700">Category</th>
                      <th className="text-left p-2 font-semibold text-orange-700">Details</th>
                      <th className="text-right p-2 font-semibold text-orange-700">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentBreakdown.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-orange-50">
                        <td className="p-2 font-medium">{item.category}</td>
                        <td className="p-2">{item.details}</td>
                        <td className="p-2 text-right font-semibold">{item.cost}</td>
                      </tr>
                    ))}
                    <tr className="border-b-2 border-orange-200 bg-orange-100">
                      <td className="p-2 font-bold">Total Investment Required</td>
                      <td></td>
                      <td className="p-2 text-right font-bold text-lg">₹6,00,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer showTopButton />
    </div>
  );
};

export default InvestorPitch;
