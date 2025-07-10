'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

const TrialBatch = () => {
  const podiData = [
    { name: 'Putnalu Podi', costPerKg: 300, totalCost: 7500 },
    { name: 'Palli Podi', costPerKg: 262, totalCost: 6550 },
    { name: 'Karvepaku Podi', costPerKg: 240, totalCost: 6000 },
    { name: 'Kobari Podi', costPerKg: 270, totalCost: 6750 },
    { name: 'Sambar Podi', costPerKg: 269, totalCost: 6725 },
    { name: 'Rasam Podi', costPerKg: 366, totalCost: 9150 },
  ];

  const totalCost = podiData.reduce((sum, podi) => sum + podi.totalCost, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 pb-24">
      <Header currentView={''} setCurrentView={function (view: string): void {
              throw new Error('Function not implemented.');
          } } exportAllData={function (): void {
              throw new Error('Function not implemented.');
          } } />

      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-800 mb-2">Trial Batch Costing – 25 Kg Each Podi</h1>
          <p className="text-sm text-gray-600">Includes Raw Material + ₹90/kg Overheads</p>
        </div>

        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              Trial Batch – Detailed Cost View
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm border border-orange-200">
              <thead className="bg-orange-100">
                <tr>
                  <th className="p-2 text-left font-semibold text-orange-700">Podi Name</th>
                  <th className="p-2 text-right font-semibold text-orange-700">Cost/kg (₹)</th>
                  <th className="p-2 text-right font-semibold text-orange-700">Total Cost for 25 Kg (₹)</th>
                </tr>
              </thead>
              <tbody>
                {podiData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-orange-50">
                    <td className="p-2 font-medium text-gray-800">{item.name}</td>
                    <td className="p-2 text-right">₹{item.costPerKg}</td>
                    <td className="p-2 text-right font-semibold">₹{item.totalCost}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-orange-300 bg-orange-50">
                  <td className="p-2 font-bold text-orange-800">Total Cost (All 6 Podis)</td>
                  <td className="p-2"></td>
                  <td className="p-2 text-right font-bold text-orange-800 text-lg">₹{totalCost}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default TrialBatch;
