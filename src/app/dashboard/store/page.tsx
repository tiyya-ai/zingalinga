'use client';

export default function StorePage() {
  const packages = [
    {
      id: 'explorer-pack',
      name: 'Explorer Pack',
      description: 'Where Letters Come to Life!',
      price: 30,
      icon: '🎒',
      features: [
        'Letter Safari with playful letter recognition games',
        'Magic Word Builder to create fun words',
        'Phonics party - sing along to catchy letter sounds',
        '15 Learning Quests - colorful lessons'
      ]
    },
    {
      id: 'adventurer-pack',
      name: 'Adventurer Pack',
      description: 'Reading Superpowers Unlocked!',
      price: 45,
      icon: '🚀',
      features: [
        'Everything in Explorer Pack PLUS:',
        'Word Architect: Build bigger words!',
        '25 Learning Quests with more adventures',
        '25 Gold Star Challenges'
      ]
    },
    {
      id: 'bookie-pack',
      name: 'Zingalinga Bookie Pack',
      description: 'Interactive Learning Device',
      price: 60,
      icon: '📚',
      features: [
        'PP1 and PP2 equivalent literacy product',
        'Learn through stories anywhere',
        'Battery lasts 8 hours',
        '20+ interactive lessons'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🛍️ Store</h1>
          <p className="text-purple-200 text-lg">Discover bundled content packages with special pricing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-4xl mb-4">
                  {pkg.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                <p className="text-purple-200 text-sm">{pkg.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-yellow-400 mb-2">${pkg.price}</div>
                <div className="text-purple-200 text-sm">Per year</div>
              </div>

              <div className="mb-8">
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-white text-sm">
                      <span className="text-green-400 mr-2 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-purple-900 font-bold py-3 px-6 rounded-xl transition-all duration-200">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}