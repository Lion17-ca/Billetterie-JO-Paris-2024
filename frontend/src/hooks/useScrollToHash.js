import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook personnalisé pour faire défiler la page vers l'élément correspondant au hash dans l'URL
 * après le chargement de la page ou la navigation
 */
const useScrollToHash = () => {
  const location = useLocation();

  useEffect(() => {
    // Vérifier si l'URL contient un hash
    if (location.hash) {
      // Attendre un court instant pour que le DOM soit complètement chargé
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        
        if (element) {
          // Faire défiler vers l'élément avec une animation fluide
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Si pas de hash, défiler vers le haut de la page
      window.scrollTo(0, 0);
    }
  }, [location]);
};

export default useScrollToHash;
