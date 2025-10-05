import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitted(false);
    }, 3000);
  };

  const contactInfo = [
    { icon: '📧', title: 'Email', value: 'support@learningplatform.com' },
    { icon: '📞', title: 'Phone', value: '+1 (555) 123-4567' },
    { icon: '🏢', title: 'Address', value: '123 Learning St, Tech City, TC 12345' },
    { icon: '⏰', title: 'Working Hours', value: 'Monday - Friday, 9:00 AM - 6:00 PM' }
  ];

  return (
    <div className="page-container">
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
      </section>

      <div className="contact-container">
        <section className="contact-form-section">
          <h2>Send Us a Message</h2>
          {isSubmitted ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What's this about?"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          )}
        </section>

        <aside className="contact-info">
          <h2>Contact Information</h2>
          <p>Have questions or need assistance? We're here to help!</p>
          
          <div className="contact-details">
            {contactInfo.map((item, index) => (
              <div key={index} className="contact-item">
                <div className="contact-icon">{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="social-links">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="#" className="social-icon" aria-label="Facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          
          <div className="faq-cta">
            <h3>Have a Question?</h3>
            <p>Check out our <Link to="/faq">FAQ section</Link> for quick answers to common questions.</p>
          </div>
        </aside>
      </div>
      
      <section className="map-section">
        <div className="map-container">
          <iframe
            title="Our Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a23e28c1191%3A0x49f75d3281df052a!2s150%20Park%20Row%2C%20New%20York%2C%20NY%2010007!5e0!3m2!1sen!2sus!4v1644262070010!5m2!1sen!2sus"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Contact;
