
import React from 'react';
import { useCars } from '../../context/CarContext';

const Compare: React.FC = () => {
  const { cars } = useCars();
  const comparisonList = cars.slice(0, 3); // Mocking comparison with first 3 cars

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 uppercase tracking-tighter">Compare Vehicles</h1>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="p-6 border-b border-white/5"></th>
                {comparisonList.map(car => (
                  <th key={car.id} className="p-6 border-b border-white/5 text-left">
                    <img src={car.images[0]} className="w-full aspect-video object-cover rounded-xl mb-4" alt={car.model} />
                    <h3 className="text-xl font-bold">{car.make}</h3>
                    <p className="text-zinc-500 text-sm">{car.model}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <Row label="Price" values={comparisonList.map(c => `$${c.price.toLocaleString()}`)} />
              <Row label="Engine Power" values={comparisonList.map(c => `${c.hp} HP`)} />
              <Row label="0-100 km/h" values={comparisonList.map(c => c.acceleration)} />
              <Row label="Fuel" values={comparisonList.map(c => c.fuel)} />
              <Row label="Mileage" values={comparisonList.map(c => `${c.mileage} mi`)} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; values: string[] }> = ({ label, values }) => (
  <tr className="hover:bg-white/5 transition-colors">
    <td className="p-6 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label}</td>
    {values.map((v, i) => (
      <td key={i} className="p-6 text-sm font-medium">{v}</td>
    ))}
  </tr>
);

export default Compare;
