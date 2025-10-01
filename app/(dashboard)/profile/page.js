'use client'
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  FaUser, 
  FaCamera, 
  FaCheck, 
  FaTimes, 
  FaEdit, 
  FaDownload,
  FaSpinner
} from 'react-icons/fa';

// Reusable Input Component
const ProfileInput = ({ label, name, value, onChange, disabled, type = "text", placeholder }) => {
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      <input 
        className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
        type={type} 
        name={name} 
        placeholder={placeholder} 
        value={value} 
        onChange={onChange} 
        disabled={disabled} 
      />
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [photo, setPhoto] = useState(null);
  const [downloading, setDownloading] = useState(false);
  // Add state for photo uploading and error
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    if (!user) {
      console.log('No user logged in');
      toast.info('Please log in to view your profile');
      return;
    }
    const fetchProfile = async () => {
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          console.log('Fetched profile data:', data);
          setProfile(data);
          setPhoto(data.photoURL || null);
          setForm({
            fullName: `${data.surname || ''} ${data.firstname || ''} ${data.middlename || ''}`.trim(),
            email: data.email || '',
            phone: data.mobile || '',
            address: data.address || ''
          });
         
        } else {
          console.log('No profile found for user:', user.uid);
          setProfile(null);
          toast.warning('No profile data found. Please complete your profile.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    console.log('Current user:', user);
    fetchProfile();
  }, [user]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save changes');
      return;
    }
    
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, {
        email: form.email,
        mobile: form.phone,
        address: form.address,
        surname: form.fullName.split(' ')[0] || '',
        firstname: form.fullName.split(' ')[1] || '',
        middlename: form.fullName.split(' ')[2] || ''
      });
      
      setEdit(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    setForm({
      fullName: `${profile.surname || ''} ${profile.firstname || ''} ${profile.middlename || ''}`.trim(),
      email: profile.email || '',
      phone: profile.mobile || '',
      address: profile.address || ''
    });
    setEdit(false);
    toast.info('Edit cancelled');
  };

  const handleDownloadID = async () => {
    if (!profile) {
      toast.error('No profile data available');
      return;
    }
  
    setDownloading(true);
    toast.info('Generating ID card...');
  
    try {
      // Create a temporary ID card element
      const idCardElement = document.createElement('div');
      idCardElement.style.width = '350px';
      idCardElement.style.height = '220px';
      idCardElement.style.padding = '15px';
      idCardElement.style.backgroundColor = '#ffffff';
      idCardElement.style.borderRadius = '12px';
      idCardElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      idCardElement.style.display = 'flex';
      idCardElement.style.flexDirection = 'column';
      idCardElement.style.position = 'absolute';
      idCardElement.style.left = '-9999px';
      idCardElement.style.fontFamily = 'Arial, sans-serif';
      idCardElement.style.overflow = 'hidden';
      idCardElement.style.border = '2px solid #4f46e5';
      
      // Get absolute path for logo
      const getLogoPath = () => {
        // Use window.location to construct absolute path
        const baseUrl = window.location.origin;
        return `${baseUrl}/logo.jpg`;
      };
  
      const logoPath = getLogoPath();
  
      // Function to load image with CORS handling
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
          
          // Add cache busting to avoid cached images
          if (src.startsWith('http')) {
            img.src = src + '?t=' + new Date().getTime();
          }
        });
      };
  
      // Pre-load logo to ensure it's available
      let logoAvailable = false;
      try {
        await loadImage(logoPath);
        logoAvailable = true;
      } catch (error) {
        console.warn('Logo not available, using fallback:', error);
        logoAvailable = false;
      }
  
      // School header with logo
      const schoolHeader = `
        <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
          ${
            logoAvailable 
              ? `<img src="${logoPath}" crossOrigin="anonymous" alt="School Logo" style="width: 40px; height: 40px; margin-right: 10px; object-fit: contain;" />`
              : `<div style="width: 40px; height: 40px; background: #4f46e5; border-radius: 5px; display: flex; align-items: center; justify-content: center; margin-right: 10px;">
                   <span style="color: white; font-weight: bold; font-size: 10px;">WACCPS</span>
                 </div>`
          }
          <div style="text-align: center;">
            <h3 style="margin: 0; color: #1f2937; font-size: 14px; font-weight: bold; line-height: 1.2;">
              WEST AFRICAN COLLEGE OF<br>CLINICAL PHYSIOLOGY SCIENCES
            </h3>
            <p style="margin: 2px 0 0; color: #6b7280; font-size: 10px; font-weight: bold;">WACCPS</p>
          </div>
        </div>
      `;
      
      // Student photo and details
      const studentDetails = `
        <div style="display: flex; margin-bottom: 15px;">
          <div style="width: 80px; height: 80px; border-radius: 5px; overflow: hidden; margin-right: 15px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; background: #f9fafb;">
            ${photo ? `<img src="${photo}" crossOrigin="anonymous" style="width: 100%; height: 100%; object-fit: cover;" alt="Student Photo" />` : 
              `<div style="color: #9ca3af; font-size: 12px; text-align: center;">No Photo</div>`}
          </div>
          <div style="flex: 1;">
            <h2 style="margin: 0 0 5px; color: #1f2937; font-size: 16px; font-weight: bold;">${form.fullName}</h2>
            <p style="margin: 2px 0; color: #374151; font-size: 12px;"><strong>ID:</strong> ${user.uid.substring(0, 8).toUpperCase()}</p>
            <p style="margin: 2px 0; color: #374151; font-size: 12px;"><strong>Email:</strong> ${form.email}</p>
            <p style="margin: 2px 0; color: #374151; font-size: 12px;"><strong>Phone:</strong> ${form.phone}</p>
          </div>
        </div>
      `;
      
      // Footer with barcode and signature
      const cardFooter = `
        <div style="border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="width: 80px; height: 40px; background: repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px);"></div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #000; width: 80px; margin-bottom: 3px;"></div>
            <p style="margin: 0; color: #374151; font-size: 10px;">Authorized Signature</p>
          </div>
        </div>
        <div style="margin-top: 5px; text-align: center; color: #9ca3af; font-size: 9px;">
          Valid until: ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}
        </div>
      `;
      
      idCardElement.innerHTML = schoolHeader + studentDetails + cardFooter;
      document.body.appendChild(idCardElement);
  
      // Wait for all images to load
      const images = idCardElement.getElementsByTagName('img');
      const imageLoadPromises = [];
      
      for (let img of images) {
        if (!img.complete) {
          imageLoadPromises.push(new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails to load
          }));
        }
      }
  
      // Wait for images to load or timeout after 5 seconds
      await Promise.race([
        Promise.all(imageLoadPromises),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);
  
      // Convert to canvas with better configuration
      const canvas = await html2canvas(idCardElement, {
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Ensure CORS is set on cloned images too
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            img.setAttribute('crossOrigin', 'anonymous');
          });
        }
      });
  
      // Remove the temporary element
      document.body.removeChild(idCardElement);
  
      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 85; // mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
  
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`WACCPS-Student-ID-${form.fullName.replace(/\s+/g, '-')}.pdf`);
  
      toast.success('ID card downloaded successfully!');
    } catch (error) {
      console.error('Error generating ID card:', error);
      toast.error('Failed to download ID card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Helper to delete photo from R2
  const deletePhotoFromR2 = async (photoUrl, userId) => {
    if (!photoUrl) return;
    try {
      await fetch('/api/delete-r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photoUrl, userId }),
      });
    } catch (err) {
      console.error('Failed to delete old photo:', err);
    }
  };

  // Helper to upload photo to R2
  const uploadToR2 = async (file, userId) => {
    if (!file) return '';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    const res = await fetch('/api/upload-r2', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Photo upload failed');
    const data = await res.json();
    return data.url;
  };

  // Handle photo change
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setPhotoUploading(true);
    setPhotoError('');
    try {
      // Delete old photo from R2
      if (profile?.photoURL) {
        await deletePhotoFromR2(profile.photoURL, user.uid);
      }
      // Upload new photo
      const newPhotoUrl = await uploadToR2(file, user.uid);
      // Update Firestore
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, { photoURL: newPhotoUrl });
      setPhoto(newPhotoUrl);
      setProfile((prev) => ({ ...prev, photoURL: newPhotoUrl }));
      toast.success('Profile photo updated!');
    } catch (err) {
      setPhotoError('Failed to update photo.');
      toast.error('Failed to update photo.');
    }
    setPhotoUploading(false);
  };

  if (loading) return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Loading your profile...</div>
    </div>
  );
  
  if (!profile) return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center">
      <div className="text-red-500 text-xl p-8 text-center">No profile data found for this user.</div>
    </div>
  );

  return (
    <div className="bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Profile</h1>
        
        {/* Upload Passport Photo */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Passport Photo</h2>
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-700 rounded-full overflow-hidden mb-4 border-2 border-purple-500">
              {photo ? (
                <img src={photo} alt="Passport" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FaUser className="h-12 w-12" />
                </div>
              )}
            </div>
            <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform cursor-pointer">
              <FaCamera className="h-5 w-5 mr-2" />
              {photoUploading ? 'Uploading...' : 'Change Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
            </label>
            {photoError && <div className="text-red-500 mt-2">{photoError}</div>}
          </div>
        </section>
        
        {/* View & Edit Personal Info */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">View & Edit Personal Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProfileInput
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={!edit}
              placeholder="Full Name"
            />
            <ProfileInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={!edit}
              placeholder="Email"
            />
            <ProfileInput
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              disabled={!edit}
              placeholder="Phone"
            />
            <ProfileInput
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={!edit}
              placeholder="Address"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {edit ? (
              <>
                <button 
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700  flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
                  onClick={handleSave}
                >
                  <FaCheck className="h-5 w-5 mr-2" />
                  Save Changes
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700  flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
                  onClick={handleCancelEdit}
                >
                  <FaTimes className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700  flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
                onClick={() => setEdit(true)}
              >
                <FaEdit className="h-5 w-5 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </section>
        
        {/* Download Student ID Card */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Download Student ID Card</h2>
          <button 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700  flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDownloadID}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                Generating ID...
              </>
            ) : (
              <>
                <FaDownload className="h-5 w-5 mr-2" />
                Download ID Card
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;