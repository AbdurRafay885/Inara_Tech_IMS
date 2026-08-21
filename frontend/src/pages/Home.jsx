import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/inara_logo.png';
import homeBg from '../assets/home_bg.png';

const Home = () => {
  const { user, logout } = useAuth();
  const [activeStep, setActiveStep] = useState('apply');

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden" style={{ backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.8), rgba(248, 250, 252, 0.9)), url(${homeBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

      {/* Subtle floating background elements (red/amber glows) */}
      <div className="absolute top-10 left-10 h-72 w-72 bg-red-500 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ opacity: 0.08, animationDuration: '6s' }}></div>
      <div className="absolute bottom-20 right-10 h-96 w-96 bg-amber-500 rounded-full blur-[100px] pointer-events-none" style={{ opacity: 0.08 }}></div>
      <div className="absolute top-1/3 right-1/4 h-80 w-80 bg-blue-500 rounded-full blur-[90px] pointer-events-none" style={{ opacity: 0.08 }}></div>
      <div className="absolute bottom-10 left-1/4 h-80 w-80 bg-red-500 rounded-full blur-[90px] pointer-events-none" style={{ opacity: 0.06 }}></div>

      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/75 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/home" className="flex items-center space-x-3">
              <img src={logo} alt="Inara Technologies Logo" className="h-14 w-auto object-contain" />
              <span className="h-6 w-px bg-slate-300 hidden md:block"></span>
              <span className="text-black font-extrabold text-[20px] tracking-wide hidden md:block">
                Internship Management System
              </span>
            </Link>
          </div>
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to={user.role === 'APPLICANT' ? (user.applicationId ? '/track' : '/apply') : '/dashboard'} className="btn-primary bg-red-600 hover:bg-red-700 text-white py-2 px-5 text-sm rounded-xl font-bold transition-colors shadow-md">
                Go to Portal
              </Link>
              <button onClick={logout} className="bg-white hover:bg-red-50 text-red-600 border border-red-600 py-2 px-5 text-sm rounded-xl font-bold transition-colors cursor-pointer">
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-white hover:bg-red-50 text-red-600 border border-red-600 py-2 px-5 text-sm rounded-xl font-bold transition-all duration-200 shadow-sm">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-14 flex-1 flex flex-col justify-center items-center text-center z-10">
        <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200/60 rounded-full px-4 py-1.5 mb-8">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="text-red-600 text-xs font-bold uppercase tracking-wider">Internship Portal v1.0</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-slate-950">
          Shape the Future of Technology at <br />
          <span className="text-red-600 block mt-2">Inara Technologies</span>
        </h1>

        <p className="text-slate-200 text-lg md:text-xl max-w-2xl mb-12 font-medium leading-relaxed">
          Step into a collaborative training environment. Submit your application, manage onboarding, track module reports, and build real-world project assignments with expert supervisors.
        </p>

        {/* Action Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mb-12">
          {/* Card 1: Apply */}
          <div className="glass-panel p-8 text-left bg-white/70 backdrop-blur-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-2xl flex flex-col justify-between shadow-md" style={{ border: '2px solid #ef4444' }}>
            <div>
              <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-950 mb-3">Join as an Intern</h3>
              <p className="text-slate-200 text-sm font-normal mb-6 leading-relaxed">
                Submit your CV, select your preferred department (DevOps, Development, Security, etc.) and complete your application form online.
              </p>
            </div>
            <Link to="/apply" className="btn-primary bg-red-600 hover:bg-red-700 text-white py-3 text-center w-full block rounded-xl font-bold transition-all duration-200 shadow-md">
              Apply Now
            </Link>
          </div>

          {/* Card 2: Track Status */}
          <div className="glass-panel p-8 text-left bg-white/70 backdrop-blur-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-2xl flex flex-col justify-between shadow-md" style={{ border: '2px solid #ef4444' }}>
            <div>
              <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-slate-950 mb-3">Track Application</h3>
              <p className="text-slate-200 text-sm font-normal mb-6 leading-relaxed">
                Already applied? Track the live review progress of your application using your unique Tracking ID or registered email.
              </p>
            </div>
            <Link to="/track" className="bg-white hover:bg-red-50 text-red-600 border border-red-600 py-3 text-center w-full block rounded-xl font-bold transition-all duration-200 shadow-sm">
              Check Status
            </Link>
          </div>
        </div>

        {/* Internship Tracks Section */}
        <div className="w-full max-w-5xl mt-12 mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-950">Our Internship Tracks</h2>
            <p className="text-slate-200 text-sm mt-2 font-medium">Explore the engineering domains you can choose for your training</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white/80 border border-slate-200 p-5 rounded-2xl text-center hover:border-red-500 hover:shadow-md transition-all duration-200">
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-200 text-sm">Development</h4>
            </div>

            <div className="bg-white/80 border border-slate-200 p-5 rounded-2xl text-center hover:border-red-500 hover:shadow-md transition-all duration-200">
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-200 text-sm">DevOps</h4>
            </div>

            <div className="bg-white/80 border border-slate-200 p-5 rounded-2xl text-center hover:border-red-500 hover:shadow-md transition-all duration-200">
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-200 text-sm">AI/ML</h4>
            </div>

            <div className="bg-white/80 border border-slate-200 p-5 rounded-2xl text-center hover:border-red-500 hover:shadow-md transition-all duration-200">
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-200 text-sm">Security</h4>
            </div>

            <div className="bg-white/80 border border-slate-200 p-5 rounded-2xl text-center hover:border-red-500 hover:shadow-md transition-all duration-200">
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.5V9m.75 9l-.382-.047a3.377 3.377 0 00-1.947.25l-1.53.765m9.87-10.125a9.586 9.586 0 011.664 1.34l-3.34 3.34m0-10.02a9.586 9.586 0 00-1.664 1.34l3.34 3.34M12 14a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-200 text-sm">Networking</h4>
            </div>
          </div>
        </div>

        {/* Why Choose Inara Section */}
        <div className="w-full max-w-5xl mt-14 mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-950">Why Intern With Us?</h2>
            <p className="text-slate-200 text-sm mt-2 font-medium">Gain valuable hands-on experience under real software house guidelines</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-red-500 hover:shadow-md transition-all duration-200 text-center md:text-left">
              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">1-on-1 Mentorship</h3>
              <p className="text-slate-200 text-sm leading-relaxed font-normal">
                Work directly alongside senior developers and solutions architects who review your work and guide you daily.
              </p>
            </div>

            <div className="bg-white/80 border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-red-500 hover:shadow-md transition-all duration-200 text-center md:text-left">
              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Real-world Projects</h3>
              <p className="text-slate-200 text-sm leading-relaxed font-normal">
                No mock tasks here. Interns contribute to production codebases, write tests, and build enterprise deployments.
              </p>
            </div>

            <div className="bg-white/80 border border-slate-200 p-6 rounded-2xl shadow-sm hover:border-red-500 hover:shadow-md transition-all duration-200 text-center md:text-left">
              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Experience Letter</h3>
              <p className="text-slate-200 text-sm leading-relaxed font-normal">
                Successful internees receive formal recommendations and experience letters representing true software engineering credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Internship Journey Section */}
        <div className="w-full max-w-5xl mt-14 mb-2">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-950">Your Training Journey</h2>
            <p className="text-slate-200 text-sm mt-2 font-medium">Click on each stage to discover what your training path looks like</p>
          </div>

          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm">
            {/* Tabs Header */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => setActiveStep('apply')}
                className={`journey-tab-btn hover:bg-red-50 ${activeStep === 'apply' ? 'active' : 'inactive'}`}
              >
                1. Submit Application
              </button>
              <button
                onClick={() => setActiveStep('onboard')}
                className={`journey-tab-btn hover:bg-red-50 ${activeStep === 'onboard' ? 'active' : 'inactive'}`}
              >
                2. Onboarding Docs
              </button>
              <button
                onClick={() => setActiveStep('reports')}
                className={`journey-tab-btn hover:bg-red-50 ${activeStep === 'reports' ? 'active' : 'inactive'}`}
              >
                3. Weekly Progress
              </button>
              <button
                onClick={() => setActiveStep('complete')}
                className={`journey-tab-btn hover:bg-red-50 ${activeStep === 'complete' ? 'active' : 'inactive'}`}
              >
                4. Project Completion
              </button>
            </div>

            {/* Tabs Content */}
            <div className="text-left py-2">
              {activeStep === 'apply' && (
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-slate-950 flex items-center space-x-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-extrabold">1</span>
                    <span>Submit & Match Track</span>
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed font-normal">
                    Choose your preferred track (e.g. Development, DevOps) and submit your application with a profile picture and resume. The Admin review team schedules short interviews to assess alignment and matches candidates with active supervisor slots.
                  </p>
                </div>
              )}
              {activeStep === 'onboard' && (
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-slate-950 flex items-center space-x-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-extrabold">2</span>
                    <span>Verify Credentials & Onboard</span>
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed font-normal">
                    Once selected, upload required documents such as photo ID, academic transcripts, and emergency contacts to activate your intern portal profile. This keeps all engineering files safe and authenticated.
                  </p>
                </div>
              )}
              {activeStep === 'reports' && (
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-slate-950 flex items-center space-x-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-extrabold">3</span>
                    <span>Log Modules & Reports</span>
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed font-normal">
                    Submit weekly module reports summarizing your engineering progress, tasks completed, and tech hurdles encountered. Assigned supervisor engineers review, request modifications, or approve your progress logs.
                  </p>
                </div>
              )}
              {activeStep === 'complete' && (
                <div className="space-y-3">
                  <h4 className="text-lg font-bold text-slate-950 flex items-center space-x-2">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-600 text-xs font-extrabold">4</span>
                    <span>Deploy Project & Graduate</span>
                  </h4>
                  <p className="text-slate-200 text-sm leading-relaxed font-normal">
                    Build and submit a collaborative project task reflecting the skills you learned. Once validated by the supervisor, the Admin archives your profile to award your formal completion record and credentials.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 bg-white/50 z-10">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-300 text-xs font-semibold">
          &copy; {new Date().getFullYear()} Inara Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
