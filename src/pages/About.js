import React from 'react';
import { Link } from 'react-router-dom';
import './Pages.css';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Founder & Lead Instructor',
      bio: '10+ years of experience in full-stack development',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Curriculum Developer',
      bio: 'Expert in modern JavaScript frameworks',
      image: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'Mentor & Career Coach',
      bio: 'Helped 500+ students land tech jobs',
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    }
  ];

  return (
    <div className="page-container">
      <section className="about-hero">
        <div className="about-content">
          <h1>About Our Learning Platform</h1>
          <p>Empowering the next generation of developers and tech professionals</p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-text">
          <h2>Our Mission</h2>
          <p>
            We believe that education should be accessible, engaging, and effective. 
            Our platform is designed to help learners of all levels acquire in-demand 
            tech skills through hands-on projects and expert guidance.
          </p>
          <p>
            Since our founding in 2023, we've helped thousands of students transform 
            their careers and achieve their professional goals in the tech industry.
          </p>
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Industry-Ready Skills</h3>
            <p>Learn the most in-demand technologies used by top companies</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍💻</div>
            <h3>Project-Based Learning</h3>
            <p>Build real-world projects for your portfolio</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Community Support</h3>
            <p>Join a community of passionate learners and mentors</p>
          </div>
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="team-card">
              <img src={member.image} alt={member.name} className="team-photo" />
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p className="bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Start Learning?</h2>
        <p>Join thousands of students who have transformed their careers with us</p>
        <Link to="/signup" className="cta-button">Get Started for Free</Link>
      </section>
    </div>
  );
};

export default About;
