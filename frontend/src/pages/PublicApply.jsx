import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/inara_logo.png';
import formBg from '../assets/form_bg.png';

const PublicApply = () => {
  const { user, logout, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    currentEducation: '',
    instituteName: '',
    preferredDepartment: '',
    internshipMode: 'REMOTE',
    dob: '',
    address: '',
    gender: '',
    nationality: '',
    emergencyContact: '',
    duration: '6',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resume, setResume] = useState(null);
  const [picture, setPicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [appLoading, setAppLoading] = useState(false);
  const [coolOffInfo, setCoolOffInfo] = useState(null);

  const [dropdownOptions, setDropdownOptions] = useState({
    currentEducation: [],
    preferredDepartment: [],
    internshipMode: [],
    duration: []
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get('/dropdowns');
        const data = response.data.data;
        setDropdownOptions(data);

        // Populate default values based on loaded options if they exist
        setFormData(prev => ({
          ...prev,
          currentEducation: prev.currentEducation || data.currentEducation[0]?.value || '',
          preferredDepartment: prev.preferredDepartment || data.preferredDepartment[0]?.value || '',
          internshipMode: prev.internshipMode || data.internshipMode[0]?.value || 'REMOTE',
          duration: prev.duration || data.duration[0]?.value || '6'
        }));
      } catch (err) {
        console.error("Failed to fetch dropdown options:", err);
      }
    };
    fetchOptions();
  }, []);

  const getCoolOffInfo = (updatedAt) => {
    if (!updatedAt) return { active: false, remainingMonths: 0, message: "" };
    const rejectionDate = new Date(updatedAt);
    const eligibleDate = new Date(rejectionDate);
    eligibleDate.setMonth(eligibleDate.getMonth() + 6);

    const now = new Date();
    const remainingMs = eligibleDate.getTime() - now.getTime();

    if (remainingMs <= 0) {
      return { active: false, remainingMonths: 0, message: "" };
    }

    const remainingMonths = (remainingMs / (30 * 24 * 60 * 60 * 1000)).toFixed(1);

    let message = "";
    const totalDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
    if (totalDays > 30) {
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      message = `${months} month${months > 1 ? 's' : ''} and ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      message = `${totalDays} day${totalDays !== 1 ? 's' : ''}`;
    }

    return {
      active: true,
      remainingMonths: parseFloat(remainingMonths),
      readableTime: message,
      eligibleDate
    };
  };

  useEffect(() => {
    const checkApplication = async () => {
      if (!authLoading) {
        if (!user) {
          // Allow guest users to stay and fill register + application form
          return;
        }

        if (user.role !== 'APPLICANT') {
          navigate('/dashboard');
          return;
        }

        if (user.applicationId) {
          setAppLoading(true);
          try {
            const response = await api.get(`/applications/track/${user.applicationId}`);
            const app = response.data.data;
            if (app.status === 'REJECTED') {
              const coolOff = getCoolOffInfo(app.updatedAt);
              if (coolOff.active) {
                setCoolOffInfo(coolOff);
              } else {
                // Cool off passed, allow re-applying by pre-populating fields
                setFormData((prev) => ({
                  ...prev,
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email || '',
                }));
              }
            } else {
              // Not rejected, go to track page
              navigate('/track');
            }
          } catch (err) {
            console.error("Error fetching application details:", err);
            navigate('/track');
          } finally {
            setAppLoading(false);
          }
        } else {
          // Pre-populate fields for fresh application
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          }));
        }
      }
    };

    checkApplication();
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedImageTypes.includes(file.type)) {
        setError('Only PNG, JPEG, and JPG file formats are allowed for the profile picture.');
        setPicture(null);
        setPicturePreview(null);
        e.target.value = null; // Clear input
        return;
      }
      setPicture(file);
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError('Please fill in your name and email address.');
        setLoading(false);
        return;
      }

      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
    }

    if (!formData.preferredDepartment) {
      setError('Please select your preferred department.');
      setLoading(false);
      return;
    }

    if (!resume) {
      setError('Please upload your resume (CV).');
      setLoading(false);
      return;
    }

    if (!picture) {
      setError('Please upload your profile picture.');
      setLoading(false);
      return;
    }

    try {
      if (!user) {
        // Register applicant account
        await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });

        // Autologin to set user token and context
        const loginResult = await login(formData.email, formData.password);
        if (!loginResult.success) {
          throw new Error(loginResult.message || 'Failed to login after registration.');
        }
      }

      const payload = new FormData();
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('cnic', formData.cnic);
      payload.append('currentEducation', formData.currentEducation);
      payload.append('instituteName', formData.instituteName);
      payload.append('internshipMode', formData.internshipMode);
      payload.append('preferredDepartment', formData.preferredDepartment);
      payload.append('dob', formData.dob);
      payload.append('address', formData.address);
      payload.append('gender', formData.gender);
      payload.append('nationality', formData.nationality);
      payload.append('emergencyContact', formData.emergencyContact);
      payload.append('duration', formData.duration);
      payload.append('resume', resume);
      payload.append('picture', picture);

      const response = await api.post('/applications/apply', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local storage user profile with the newly created applicationId
      const savedUser = JSON.parse(localStorage.getItem('user'));
      savedUser.applicationId = response.data.data.id;
      localStorage.setItem('user', JSON.stringify(savedUser));

      setTrackingDetails(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit application. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || appLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="text-slate-400 text-sm">Loading application form...</span>
      </div>
    );
  }

  if (trackingDetails) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4" style={{ backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.9)), url(${formBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="w-full max-w-lg glass-panel p-8 text-center auth-card shadow-cyan-950/10">
          <div className="h-16 w-16 bg-white border border-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-100 mb-2">Application Submitted!</h2>
          <p className="text-slate-200 text-sm mb-8">
            Your application was received successfully. Click below to track its progress.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 mb-8 text-left space-y-4">
            <div>
              <span className="text-slate-300 text-xs uppercase font-semibold tracking-wider block">Tracking ID (CNIC)</span>
              <span className="font-mono text-red-900 text-lg break-all select-all font-semibold">{trackingDetails.cnic}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-4">
              <div>
                <span className="text-slate-300 text-xs uppercase font-semibold block">Full Name</span>
                <span className="text-slate-200 font-medium">{trackingDetails.firstName} {trackingDetails.lastName}</span>
              </div>
              <div>
                <span className="text-slate-300 text-xs uppercase font-semibold block">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/30 mt-1">
                  {trackingDetails.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to={`/track?id=${trackingDetails.cnic}`} className="btn-primary flex-1 py-3 text-center rounded-xl text-sm font-semibold">
              Track Live Progress
            </Link>
            <Link to="/home" className="btn-secondary flex-1 py-3 text-center rounded-xl text-sm font-semibold">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col justify-center items-center relative overflow-hidden" style={{ backgroundImage: `linear-gradient(rgba(248, 250, 252, 0.9), rgba(248, 250, 252, 0.9)), url(${formBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Subtle floating background elements (red/amber glows) */}
      <div className="absolute top-10 left-10 h-72 w-72 bg-red-500 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ opacity: 0.08, animationDuration: '6s' }}></div>
      <div className="absolute bottom-20 right-10 h-96 w-96 bg-amber-500 rounded-full blur-[100px] pointer-events-none" style={{ opacity: 0.08 }}></div>
      <div className="absolute top-1/3 right-1/4 h-80 w-80 bg-blue-500 rounded-full blur-[90px] pointer-events-none" style={{ opacity: 0.08 }}></div>
      <div className="absolute bottom-10 left-1/4 h-80 w-80 bg-red-500 rounded-full blur-[90px] pointer-events-none" style={{ opacity: 0.06 }}></div>

      <div className="w-full max-w-2xl z-10">
        <div className="text-center mb-8">
          <Link to="/home" className="inline-block mb-3">
            <img src={logo} alt="Inara Technologies Logo" className="h-24 w-auto mx-auto object-contain" />
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-950">Internship Application</h2>
          <p className="text-slate-400 text-[16px] mt-1 font-regular">Fill out the form below and attach your CV to apply</p>
        </div>

        <div className="glass-panel p-8 auth-card bg-white/70 backdrop-blur-md border-slate-200/80 shadow-2xl">
          {coolOffInfo ? (
            <div className="text-center py-6 space-y-6">
              <div className="h-16 w-16 bg-red-100 border border-red-200 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Cool-off Period Active</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Your previous application was not selected. You must wait for a 6-month cool-off period before submitting a new application.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-2">
                <span className="text-slate-500 text-xs uppercase font-semibold tracking-wider block">Remaining Cool-off Time</span>
                <span className="font-semibold text-blue-800 text-lg block">
                  {coolOffInfo.readableTime} ({coolOffInfo.remainingMonths} months)
                </span>
                <span className="text-xs text-slate-550 block">
                  You will be eligible to re-apply on: <span className="text-slate-800 font-medium">{coolOffInfo.eligibleDate.toLocaleDateString()}</span>
                </span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link to="/track" className="btn-primary flex-1 py-3 text-center rounded-xl text-sm font-semibold block">
                  Track Rejection Status
                </Link>
                <button
                  onClick={() => window.location.href = '/home'}
                  className="bg-white hover:bg-red-50 text-red-600 border border-red-600 flex-1 py-3 text-center rounded-xl text-sm font-semibold block transition-colors cursor-pointer"
                >
                  Return Home
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-white border border-red-800/40 rounded-xl p-4 mb-6 text-red-600 text-[13px] font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar upload container at the top of form */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('pictureInput').click()}>
                    <div className="w-24 h-24 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center overflow-hidden relative shadow-lg">
                      {picturePreview ? (
                        <img src={picturePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </div>
                    {/* Red Camera Icon overlay */}
                    <div className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 border border-white shadow-md transition-colors cursor-pointer flex items-center justify-center h-8 w-8">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                      </svg>
                    </div>
                  </div>
                  {/* Hidden File Input */}
                  <input
                    id="pictureInput"
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handlePictureChange}
                    className="hidden"
                  />
                  <span className="text-slate-700 text-xs font-bold mt-2">
                    {picture ? picture.name : "Upload Profile Photograph"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="firstName">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      disabled={!!user}
                      className={`w-full ${user ? 'text-black border border-blue-200 cursor-not-allowed' : 'bg-white text-slate-900 border border-slate-300 focus:border-red-500'} rounded-xl px-4 py-3 font-normal focus:outline-none transition-all duration-200`}
                      style={{ backgroundColor: user ? '#eff6ff' : '#ffffff', color: '#000000' }}
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="lastName">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      disabled={!!user}
                      className={`w-full ${user ? 'text-black border border-blue-200 cursor-not-allowed' : 'bg-white text-slate-900 border border-slate-300 focus:border-red-500'} rounded-xl px-4 py-3 font-normal focus:outline-none transition-all duration-200`}
                      style={{ backgroundColor: user ? '#eff6ff' : '#ffffff', color: '#000000' }}
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      disabled={!!user}
                      className={`w-full ${user ? 'text-black border border-blue-200 cursor-not-allowed' : 'bg-white text-slate-900 border border-slate-300 focus:border-red-500'} rounded-xl px-4 py-3 font-normal focus:outline-none transition-all duration-200`}
                      style={{ backgroundColor: user ? '#eff6ff' : '#ffffff', color: '#000000' }}
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {!user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                        Create Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 pr-12"
                          style={{ backgroundColor: '#ffffff', color: '#000000' }}
                          placeholder="At least 6 characters"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3a9 9 0 0 1-8.56-8.56m1.153-1.153a3.5 3.5 0 0 1 4.828 4.828" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 pr-12"
                          style={{ backgroundColor: '#ffffff', color: '#000000' }}
                          placeholder="Repeat your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors cursor-pointer"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.822 7.822 3 3m-3-3a9 9 0 0 1-8.56-8.56m1.153-1.153a3.5 3.5 0 0 1 4.828 4.828" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="cnic">
                      CNIC Number / National ID
                    </label>
                    <input
                      id="cnic"
                      type="text"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      placeholder="e.g. 42101-1234567-1"
                      value={formData.cnic}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="dob">
                      Date of Birth (DOB)
                    </label>
                    <input
                      id="dob"
                      type="date"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="address">
                      Home Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      placeholder="123 Main St, City, Country"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="currentEducation">
                      Current Education
                    </label>
                    <select
                      id="currentEducation"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      value={formData.currentEducation}
                      onChange={handleChange}
                    >
                      <option value="">Select Education Level</option>
                      {dropdownOptions.currentEducation.map(opt => (
                        <option key={opt.id} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="instituteName">
                      Institute Name
                    </label>
                    <input
                      id="instituteName"
                      type="text"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      placeholder="e.g. NUST, FAST, LUMS"
                      value={formData.instituteName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="gender">
                      Gender
                    </label>
                    <select
                      id="gender"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Choose Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="nationality">
                      Nationality
                    </label>
                    <input
                      id="nationality"
                      type="text"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      placeholder="e.g. Pakistani"
                      value={formData.nationality}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="emergencyContact">
                      Emergency Contact Number
                    </label>
                    <input
                      id="emergencyContact"
                      type="tel"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      placeholder="+92 300 1234567"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="preferredDepartment">
                      Preferred Department
                    </label>
                    <select
                      id="preferredDepartment"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      value={formData.preferredDepartment}
                      onChange={handleChange}
                    >
                      <option value="">Choose Department</option>
                      {dropdownOptions.preferredDepartment.map(opt => (
                        <option key={opt.id} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="internshipMode">
                      Internship Mode
                    </label>
                    <select
                      id="internshipMode"
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      value={formData.internshipMode}
                      onChange={handleChange}
                    >
                      {dropdownOptions.internshipMode.map(opt => (
                        <option key={opt.id} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="duration">
                      Internship Duration
                    </label>
                    <select
                      id="duration"
                      required
                      className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 font-normal focus:outline-none focus:border-red-500 transition-all duration-200 cursor-pointer"
                      style={{ backgroundColor: '#ffffff', color: '#000000' }}
                      value={formData.duration}
                      onChange={handleChange}
                    >
                      {dropdownOptions.duration.map(opt => (
                        <option key={opt.id} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">
                    Resume / CV File (PDF Only)
                  </label>
                  <div className="bg-white/85 border border-slate-300 border-dashed rounded-xl px-6 py-8 text-center hover:border-red-500 transition-all duration-200 relative cursor-pointer shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                    <input
                      type="file"
                      required
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg className="mx-auto h-10 w-10 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {resume ? (
                      <span className="text-blue-800 text-sm font-bold break-all">{resume.name}</span>
                    ) : (
                      <span className="text-slate-600 text-sm font-medium">Click or drag your CV file here to upload</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 flex justify-center items-center space-x-2 font-semibold"
                >
                  {loading ? <span>Submitting application...</span> : <span>Submit Application</span>}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6 flex flex-col items-center space-y-3">
          <Link to="/home" className="text-blue-800 hover:text-blue-955 font-extrabold hover:underline text-sm">
            &larr; Back to Home
          </Link>
          {user && (
            <button
              onClick={() => {
                logout();
                window.location.href = '/home';
              }}
              className="text-red-600 hover:text-red-800 font-extrabold hover:underline text-xs cursor-pointer btn-icon"
            >
              Sign Out from Candidate Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicApply;
