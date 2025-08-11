import React from 'react';
import mainLogo from '/img/light_logo.png';

const App: React.FC = () => {
  const handleNavigation = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="app-hero">
      <div className="app-content text-center">
        <header>
          <div className="glass-card hero-card">
            <img src={mainLogo} alt="Main Logo" style={{ height: '96px', marginBottom: '0.5rem' }} />
            <h2 className="hero-title">Business Intelligence</h2>
            <p className="hero-subtitle">SaaS platform</p>
          </div>
        </header>
        <main>
          <div className="buttons-row">
            <button onClick={() => handleNavigation('http://localhost:5175')} className="btn btn-outline">
              Controle de Ponto
            </button>
            <button onClick={() => handleNavigation('http://localhost:5176')} className="btn btn-primary">
              Dashboard Gerencial
            </button>
            <button onClick={() => handleNavigation('http://localhost:5174')} className="btn btn-primary">
              Clientes 360°
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
