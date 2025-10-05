import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, MessageSquare, Code, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <BookOpen className="footer-logo" />
            <h3>LearnHub</h3>
          </div>
          <p>Empowering the next generation of developers with high-quality, accessible education.</p>
          <div className="social-media mt-3">
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Categories</h3>
          <ul className="footer-links">
            <li><Link to="/courses?category=web">Web Development</Link></li>
            <li><Link to="/courses?category=mobile">Mobile Development</Link></li>
            <li><Link to="/courses?category=data">Data Science</Link></li>
            <li><Link to="/courses?category=design">UI/UX Design</Link></li>
            <li><Link to="/courses?category=business">Business</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul className="footer-contact">
            <li>
              <Mail size={16} />
              <span>support@learnhub.com</span>
            </li>
            <li>
              <MessageSquare size={16} />
              <span>+1 (555) 123-4567</span>
            </li>
            <li>
              <Code size={16} />
              <span>123 Learning St, Tech City</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} LearnHub. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <span> | </span>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
