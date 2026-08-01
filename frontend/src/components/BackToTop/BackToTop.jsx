import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import './BackToTop.css';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const calculateScrollProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight || document.documentElement.clientHeight;
    const totalScroll = docHeight - winHeight;
    const currentProgress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
    setScrollProgress(currentProgress);
  };

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      toggleVisibility();
      calculateScrollProgress();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const circleRadius = 22;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (scrollProgress / 100) * circleCircumference;

  return (
    <>
      {isVisible && (
        <button 
          className="back-to-top-btn" 
          onClick={scrollToTop}
          aria-label={`Back to top, ${Math.round(scrollProgress)}% scrolled`}
        >
          <svg className="progress-circle" viewBox="0 0 50 50">
            <circle
              className="progress-circle-bg"
              cx="25"
              cy="25"
              r={circleRadius}
            />
            <circle
              className="progress-circle-bar"
              cx="25"
              cy="25"
              r={circleRadius}
              strokeDasharray={circleCircumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="back-to-top-icon">
            <ArrowUp size={22} />
          </div>
        </button>
      )}
    </>
  );
};

export default BackToTop;