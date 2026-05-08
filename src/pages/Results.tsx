import React from "react";
import { Link } from "react-router-dom";
import { StarButton } from "../components/ui/star-button";
import NeuralStellarGallery from "../components/ui/PureStellarGallery";

const Results = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black overflow-hidden relative">
      <NeuralStellarGallery />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[60] p-4 md:p-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-end items-center pointer-events-auto">
          <Link to="/">
            <StarButton 
              className="font-bold uppercase tracking-tight h-10 md:h-12 px-6 md:px-8 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              lightColor="rgba(255,255,255,0.3)"
            >
              VOLTAR
            </StarButton>
          </Link>
        </div>
      </nav>

      {/* Removed old main */}

      <footer className="fixed bottom-0 left-0 right-0 py-6 text-center text-white/20 text-[8px] uppercase tracking-[0.3em] font-bold z-50 pointer-events-none flex justify-center">
        <div className="bg-black/40 backdrop-blur-xl px-8 py-2 rounded-full border border-white/5">
          &copy; 2026 SALVA. TODOS OS DIREITOS RESERVADOS.
        </div>
      </footer>
    </div>
  );
};

export default Results;
