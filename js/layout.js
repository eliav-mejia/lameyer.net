import React, { useState } from 'react';

// --- Improved CSS for High-Visibility Circuit Pattern ---
const Styles = () => (
  <style>{`
    body {
      margin: 0;
      background-color: #ffffff; /* Base page color */
    }

    /* The Circuit Container */
    .circuit-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background-color: #fcfdfe; /* Very slight blue-tinted white */
      
      /* Major Grid (The "Traces") */
      background-image: 
        linear-gradient(to right, rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px),
        linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px),
        /* Minor Grid (The "Texture") */
        linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px);
      
      background-size: 80px 80px, 80px 80px, 20px 20px, 20px 20px;
      
      /* Fade effect so it's not distracting at the edges */
      mask-image: radial-gradient(circle at center, black 40%, transparent 90%);
      -webkit-mask-image: radial-gradient(circle at center, black 40%, transparent 90%);
    }
    
    /* The "Nodes" or solder points at intersections */
    .circuit-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle, rgba(59, 130, 246, 0.2) 2px, transparent 2px);
      background-size: 80px 80px;
      background-position: -1px -1px;
    }

    .glass {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    }
    
    .menu-open #line1 { transform: rotate(45deg) translate(5px, 5px); }
    .menu-open #line2 { opacity: 0; }
    .menu-open #line3 { transform: rotate(-45deg) translate(5px, -5px); }
    .hidden-menu { transform: translateX(100%); display: none; }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

const layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="relative min-h-screen w-full">
      <Styles />
      
      {/* 1. Background Layer */}
      <div className="circuit-bg"></div>

      {/* 2. Top Banner */}
      <div className="fixed top-0 w-full h-10 bg-[#0f172a] z-[60] flex items-center justify-between px-8 overflow-hidden">
        <span className="text-[9px] md:text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] whitespace-nowrap">
          Global Certifications & Standards
        </span>
        <div className="flex items-center space-x-4 md:space-x-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 overflow-x-auto no-scrollbar">
          {['ISO 27001', 'ISO 9001', 'ASSE LEC 2004', 'ETL CERTIFIED', 'PCI DSS'].map((cert, index) => (
            <div key={index} className="flex items-center space-x-1 flex-shrink-0">
              <div className="w-1 h-3 bg-blue-500"></div>
              <span className="text-[9px] font-bold text-white tracking-widest uppercase">{cert}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Navigation */}
      <nav className="fixed left-0 w-full z-50 px-6 md:px-8 py-3 flex justify-between items-center glass shadow-sm mt-10">
        <a href="/" className="block"> 
            <img 
               src="https://raw.githubusercontent.com/cypher-the-meyer/themeyer.eu/main/themeyerlogo" 
              alt="Lameyer Logo" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
        </a>

        <div className="hidden md:flex space-x-8 text-sm font-semibold tracking-widest uppercase opacity-60">
          <a href="pages/Tecnologia.html" className="hover:text-blue-600 transition-colors">Tecnologias</a>
          <a href="pages/Sustainability.html" className="hover:text-blue-600 transition-colors">Sustentabilidad</a>
          <a href="/pages/Nosotros.html" className="hover:text-blue-600 transition-colors">Nosotros</a>
        </div>

        <div className="flex items-center space-x-4">
          <button className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-md">
            DEMO
          </button>
          
          <button 
            onClick={toggleMenu}
            className={`md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 focus:outline-none z-[110] ${isMobileMenuOpen ? 'menu-open' : ''}`}
          >
            <span className="block w-6 h-0.5 bg-gray-900 transition-transform duration-300" id="line1"></span>
            <span className="block w-6 h-0.5 bg-gray-900 transition-opacity duration-300" id="line2"></span>
            <span className="block w-6 h-0.5 bg-gray-900 transition-transform duration-300" id="line3"></span>
          </button>
        </div>
      </nav>

      {/* 4. Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-[100] md:hidden flex flex-col items-center justify-center space-y-8 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="flex flex-col items-center space-y-8 text-xl font-bold tracking-[0.2em] uppercase text-gray-900">
          <a href="/pages/Tecnologia.html" className="hover:text-blue-600" onClick={toggleMenu}>Tecnologias</a>
          <a href="/pages/Sustainability.html" className="hover:text-blue-600" onClick={toggleMenu}>Sustentabilidad</a>
          <a href="/pages/Nosotros.html" className="hover:text-blue-600" onClick={toggleMenu}>Nosotros</a>
        </div>
        <button className="bg-blue-600 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl">
          SOLICITAR DEMO
        </button>
      </div>

      {/* 5. Content Layer */}
      <main className="relative z-10 pt-40 px-4 md:px-8">
        {children}
      </main>

    </div>
  );
};

export default function App() {
  return (
    <layout>
      <div className="max-w-4xl mx-auto text-center mt-20">
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tighter">
          FUTURE OF <span className="text-blue-600">TECHNOLOGY</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Lameyer infrastructure is built on precision engineering. Explore our digital circuit ecosystems.
        </p>
      </div>
    </layout>
  );
}
