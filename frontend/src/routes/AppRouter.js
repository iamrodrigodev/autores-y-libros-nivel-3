import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Libros from '../pages/Libros';
import Autores from '../pages/Autores';
import Generos from '../pages/Generos';
import LibrosPorGenero from '../components/generos/LibrosPorGenero';
import LibrosPorAutor from '../components/autores/LibrosPorAutor';

const AppRouter = () => {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/libros" replace />} />
          <Route path="/libros" element={<Libros />} />
          <Route path="/autores" element={<Autores />} />
          <Route path="/generos" element={<Generos />} />
          <Route path="/generos/libros/:id" element={<LibrosPorGenero />} />
          <Route path="/autores/libros/:id" element={<LibrosPorAutor />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRouter;