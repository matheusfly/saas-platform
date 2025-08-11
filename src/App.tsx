import React from 'react';
import mainLogo from '/img/light_logo.png';

const App: React.FC = () => {
  const handleNavigation = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-camo-bg bg-cover bg-center p-4">
      <div className="absolute inset-0 bg-camo-pattern opacity-10"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <header className="mb-12">
          <div className="glass-card p-8">
            <img src={mainLogo} alt="Main Logo" className="h-32" />
            <h2 className="text-gray-200 text-lg font-semibold mt-4">Business Intelligence</h2>
          </div>
        </header>
        <main>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <button
              onClick={() => handleNavigation('http://localhost:5175')}
              className="bg-brand-accent text-brand-neutral-dark font-bold text-xl py-6 px-12 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 border-2 border-brand-accent hover:bg-brand-neutral-dark hover:text-brand-accent"
            >
              Controle de Ponto
            </button>
            <button
              onClick={() => handleNavigation('http://localhost:5176')}
              className="bg-brand-accent text-brand-neutral-dark font-bold text-xl py-6 px-12 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 border-2 border-brand-accent hover:bg-brand-neutral-dark hover:text-brand-accent"
            >
              Dashboard Gerencial
            </button>
            <button
              onClick={() => handleNavigation('http://localhost:5174')}
              className="bg-brand-accent text-brand-neutral-dark font-bold text-xl py-6 px-12 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 border-2 border-brand-accent hover:bg-brand-neutral-dark hover:text-brand-accent"
            >
              Clientes 360°
            </button>
          </div>
        </main>
      </div>
      <footer className="absolute bottom-4 text-gray text-md font-medium opacity-80">
        SaaS platform
      </footer>
    </div>
  );
};

export default App;
