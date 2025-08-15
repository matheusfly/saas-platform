import React from 'react';
import mainLogo from '/img/light_logo.png';

const page = import.meta.env.VITE_APP || 'home';
console.log('🔥 VITE_APP:', import.meta.env.VITE_APP);
console.log('🔥 PAGE:', page);
console.log('🔥 All env:', import.meta.env);

const Home = () => (
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
          <a href="http://localhost:5176" className="btn btn-primary">Controle de Ponto</a>
          <a href="http://localhost:5174" className="btn btn-primary">Painel Gerencial</a>
          <a href="http://localhost:5175" className="btn btn-primary">Central de Clientes</a>
        </div>
      </main>
    </div>
    <footer className="app-footer">
      <p className="hero-subtitle">SaaS Platform</p>
    </footer>
  </div>
);

// Import real Dashboard
const Dashboard = () => {
  // Mock data for now - replace with real API calls
  const mockData = {
    kpis: {
      averageLtv: 15000,
      newClientCount: 42,
      conversionRate: 18.5,
      totalRevenue: 850000,
      averageClientLifespan: 365,
      monthlyChurnRate: 5.2,
      dataQualityScore: 95,
      roi: 3.2
    },
    funnel: [],
    leadEvolution: [],
    checkIn: [],
    ltv: [],
    cohort: []
  };
  
  return (
    <div style={{padding: '20px', backgroundColor: '#1E1E1E', minHeight: '100vh', color: '#fff'}}>
      <h1 style={{color:'#9EFF00', textAlign:'center', marginBottom: '20px'}}>Dashboard - Painel Gerencial</h1>
      <p style={{textAlign: 'center', marginBottom: '40px'}}>Real BI Dashboard coming soon...</p>
      
      {/* KPI Preview */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px'}}>
        <div style={{background: 'rgba(158, 255, 0, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #9EFF00'}}>
          <h3>LTV Médio</h3>
          <p style={{fontSize: '24px', color: '#9EFF00'}}>R$ {mockData.kpis.averageLtv.toLocaleString()}</p>
        </div>
        <div style={{background: 'rgba(158, 255, 0, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #9EFF00'}}>
          <h3>Novos Clientes</h3>
          <p style={{fontSize: '24px', color: '#9EFF00'}}>{mockData.kpis.newClientCount}</p>
        </div>
        <div style={{background: 'rgba(158, 255, 0, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #9EFF00'}}>
          <h3>Taxa Conversão</h3>
          <p style={{fontSize: '24px', color: '#9EFF00'}}>{mockData.kpis.conversionRate}%</p>
        </div>
        <div style={{background: 'rgba(158, 255, 0, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid #9EFF00'}}>
          <h3>Receita Total</h3>
          <p style={{fontSize: '24px', color: '#9EFF00'}}>R$ {mockData.kpis.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <p style={{textAlign: 'center', fontSize: '12px', opacity: 0.7}}>Powered by BASE Business Intelligence</p>
    </div>
  );
};
const Cliente = () => <h1 style={{color:'#9EFF00',textAlign:'center'}}>Central de Clientes (VITE_APP=cliente)</h1>;
const Schedule = () => <h1 style={{color:'#9EFF00',textAlign:'center'}}>Controle de Ponto (VITE_APP=schedule)</h1>;

const App: React.FC = () => {
  return (
    <div style={{padding: '20px', backgroundColor: '#000', color: '#fff'}}>
      <div style={{background: '#ff0000', padding: '10px', margin: '10px', color: '#fff'}}>
        DEBUG: VITE_APP = {import.meta.env.VITE_APP || 'undefined'}
      </div>
      <div style={{background: '#00ff00', padding: '10px', margin: '10px', color: '#000'}}>
        DEBUG: PAGE = {page}
      </div>
      <div style={{background: '#0000ff', padding: '10px', margin: '10px', color: '#fff'}}>
        DEBUG: All env = {JSON.stringify(import.meta.env, null, 2)}
      </div>
      {(() => {
        switch (page) {
          case 'dashboard':
            return <Dashboard />;
          case 'cliente':
            return <Cliente />;
          case 'schedule':
            return <Schedule />;
          default:
            return <Home />;
        }
      })()}
    </div>
  );
};

export default App;
