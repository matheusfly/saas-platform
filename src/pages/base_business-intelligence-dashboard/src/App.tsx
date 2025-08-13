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
            <img src={mainLogo} alt="Main Logo" style={{ height: '115px', marginBottom: '0.3rem' }} />
            <h2 className="hero-title">Business Intelligence</h2>
          </div>
        </header>
        <main>
          <div className="buttons-row">
            <button onClick={() => handleNavigation('http://localhost:5175')} className="btn btn-primary">
              Controle de Ponto
            </button>
            <button onClick={() => handleNavigation('http://localhost:5176')} className="btn btn-primary">
              Painel Gerencial
            </button>
            <button onClick={() => handleNavigation('http://localhost:5174')} className="btn btn-primary">
              Central de Clientes
            </button>
          </div>
        </main>
      </div>
      <footer className="app-footer">
        <p className="hero-subtitle">SaaS Platform</p>
      </footer>
    </div>
  );
};

export default App;
