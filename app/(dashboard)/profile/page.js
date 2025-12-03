'use client'
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
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
  FaSpinner,
  FaEnvelope,
  FaShieldAlt,
  FaExclamationTriangle,
  FaLock,
  FaRedo,
  FaHistory
} from 'react-icons/fa';

const ProfileInput = ({ label, name, value, onChange, disabled, type = "text", placeholder, verified = false }) => {
  return (
    <div>
      <label className="block text-gray-400 text-sm mb-1">{label}</label>
      <div className="relative">
        <input 
          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
          type={type} 
          name={name} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange} 
          disabled={disabled} 
        />
        {verified && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <FaShieldAlt className="text-green-400 text-sm" title="Email verified" />
          </div>
        )}
      </div>
    </div>
  );
};

const PasswordModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(password);
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4">
          <FaLock className="text-yellow-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Security Verification</h3>
        </div>
        <p className="text-gray-300 mb-4">
          For security reasons, please enter your current password to change your email address.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
            required
            autoFocus
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  Verify
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [originalForm, setOriginalForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [photo, setPhoto] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  
  const [emailChanged, setEmailChanged] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [verificationChecked, setVerificationChecked] = useState(false);
  const [authEmailUpdated, setAuthEmailUpdated] = useState(false);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordVerifying, setPasswordVerifying] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [lastEmailSent, setLastEmailSent] = useState(null);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState('idle');

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
          const formData = {
            fullName: `${data.surname || ''} ${data.firstname || ''} ${data.middlename || ''}`.trim(),
            email: user.email || data.email || '',
            phone: data.mobile || '',
            address: data.address || ''
          };
          setForm(formData);
          setOriginalForm(formData);
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
    // console.log('Current user:', user);
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (emailChanged && emailVerificationSent && authEmailUpdated) {
      console.log('Starting email verification checker...');
      
      const checkVerification = async () => {
        try {
          if (!user) return false;
          
          await user.reload();
          console.log('Email verification status:', user.emailVerified);
          console.log('Current email:', user.email);
          
          if (user.email === form.email && user.emailVerified) {
            setEmailVerifying(false);
            setSaveDisabled(false);
            setVerificationChecked(true);
            toast.success('Email verified and updated successfully! You can now save your profile.');
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error checking verification:', error);
          if (error.code === 'auth/user-token-expired') {
            console.log('User token expired, stopping verification checker');
            return true;
          }
          return false;
        }
      };

      checkVerification();
      
      const interval = setInterval(async () => {
        const verified = await checkVerification();
        if (verified) {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [emailChanged, emailVerificationSent, authEmailUpdated, user, form.email]);

  const handleChange = e => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);

    if (name === 'email' && value !== originalForm.email) {
      setEmailChanged(true);
      setSaveDisabled(true);
      setEmailVerificationSent(false);
      setVerificationChecked(false);
      setAuthEmailUpdated(false);
      setResendAttempts(0);
      setEmailDeliveryStatus('idle');
    }
  };

  const sendEmailChangeNotifications = async (oldEmail, newEmail, userName) => {
    try {
      setEmailDeliveryStatus('sending');
      
      const oldEmailPromise = fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: oldEmail,
          subject: 'Email Change Notification - WACCPS',
          message: `
            <div>
              <h2>Email Change Notification</h2>
              <p>Dear ${userName},</p>
              <p>Your email address for WACCPS has been changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
              <p>If you did not make this change, please contact support immediately.</p>
              <br>
              <p>Best regards,<br>WACCPS Team</p>
            </div>
          `,
          name: userName
        })
      });

      const newEmailPromise = fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: newEmail,
          subject: 'Email Verification Required - WACCPS',
          message: `
            <div>
              <h2>Email Verification Required</h2>
              <p>Dear ${userName},</p>
              <p>Your email address has been updated to this address for WACCPS.</p>
              <p>Please check your inbox for a verification email from Firebase and click the link to verify your new email address.</p>
              <p><strong>Note:</strong> If you don't see the email, please check your spam folder.</p>
              <br>
              <p>Best regards,<br>WACCPS Team</p>
            </div>
          `,
          name: userName
        })
      });

      await Promise.all([oldEmailPromise, newEmailPromise]);
      setEmailDeliveryStatus('sent');
      setLastEmailSent(new Date());
      return true;
    } catch (error) {
      console.error('Error sending email notifications:', error);
      setEmailDeliveryStatus('failed');
      throw error;
    }
  };

  const sendProfileChangeNotification = async (email, userName, changes) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Profile Updated - WACCPS',
          message: `
            <div>
              <h2>Profile Updated Successfully</h2>
              <p>Dear ${userName},</p>
              <p>Your WACCPS profile has been updated with the following changes:</p>
              <ul>
                ${changes.map(change => `<li><strong>${change.field}</strong>: ${change.oldValue} → ${change.newValue}</li>`).join('')}
              </ul>
              <br>
              <p>If you did not make these changes, please contact support immediately.</p>
              <br>
              <p>Best regards,<br>WACCPS Team</p>
            </div>
          `,
          name: userName
        })
      });
    } catch (error) {
      console.error('Error sending profile change notification:', error);
    }
  };

  const updateEmailWithReauth = async (password) => {
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      console.log('Sending verification email to new address:', form.email);
      await verifyBeforeUpdateEmail(user, form.email);
      
      setEmailVerificationSent(true);
      setAuthEmailUpdated(true);
      
      await sendEmailChangeNotifications(originalForm.email, form.email, form.fullName);
      
      toast.success('Verification email sent! Click the link in the email to complete the change.');
      setShowPasswordModal(false);
      return true;
    } catch (error) {
      console.error('Error in updateEmailWithReauth:', error);
      throw error;
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(60);
    setResendAttempts(prev => prev + 1);
    
    try {
      await verifyBeforeUpdateEmail(user, form.email);
      
      await sendEmailChangeNotifications(originalForm.email, form.email, form.fullName);
      
      toast.success('Verification email resent! Please check your inbox and spam folder.');
    } catch (error) {
      console.error('Error resending verification:', error);
      
      if (error.code === 'auth/requires-recent-login' || error.code === 'auth/user-token-expired') {
        toast.info('For security, please verify your password to resend the email.');
        setShowPasswordModal(true);
      } else {
        toast.error('Failed to resend verification email. Please try again.');
      }
    }
  };

  const handleSendVerification = async () => {
    if (!form.email) {
      toast.error('Please enter a valid email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setEmailVerifying(true);
    try {
      console.log('Sending verification email to new address:', form.email);
      await verifyBeforeUpdateEmail(user, form.email);
      
      setEmailVerificationSent(true);
      setAuthEmailUpdated(true);
      
      await sendEmailChangeNotifications(originalForm.email, form.email, form.fullName);
      
      setResendAttempts(1);
      setResendCooldown(60);
      
      toast.success('Verification email sent! Click the link in the email to complete the change.');
      
    } catch (error) {
      console.error('Error sending verification:', error);
      
      if (error.code === 'auth/requires-recent-login' || error.code === 'auth/user-token-expired') {
        toast.info('For security, please verify your password to continue.');
        setShowPasswordModal(true);
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already in use by another account.');
        setForm(prev => ({ ...prev, email: originalForm.email }));
        setEmailChanged(false);
        setSaveDisabled(false);
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(`Failed to send verification: ${error.message}`);
        setForm(prev => ({ ...prev, email: originalForm.email }));
        setEmailChanged(false);
        setSaveDisabled(false);
      }
    } finally {
      setEmailVerifying(false);
    }
  };

  const handlePasswordSubmit = async (password) => {
    setPasswordVerifying(true);
    try {
      await updateEmailWithReauth(password);
    } catch (error) {
      console.error('Password verification failed:', error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already in use by another account.');
        setForm(prev => ({ ...prev, email: originalForm.email }));
        setEmailChanged(false);
        setSaveDisabled(false);
        setShowPasswordModal(false);
      } else {
        toast.error(`Verification failed: ${error.message}`);
      }
    } finally {
      setPasswordVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('You must be logged in to save changes');
      return;
    }

    const hasNonEmailChanges = 
      form.phone !== originalForm.phone || 
      form.address !== originalForm.address || 
      form.fullName !== originalForm.fullName;

    const hasEmailChange = form.email !== originalForm.email;

    if (hasEmailChange && user && user.email !== form.email && !hasNonEmailChanges) {
      toast.info('Starting email verification process...');
      await handleSendVerification();
      return;
    }

    if (hasEmailChange && user && user.email !== form.email && hasNonEmailChanges) {
      const shouldSaveAnyway = window.confirm(
        'Your email change is not verified yet. Do you want to save the other changes now and verify email later?'
      );
      
      if (!shouldSaveAnyway) {
        return;
      }
    }

    try {
      const ref = doc(db, 'users', user.uid);
      const updateData = {
        mobile: form.phone,
        address: form.address,
        surname: form.fullName.split(' ')[0] || '',
        firstname: form.fullName.split(' ')[1] || '',
        middlename: form.fullName.split(' ')[2] || ''
      };

      if (hasEmailChange && user && user.email === form.email) {
        updateData.email = form.email;
        console.log('Updating Firestore email to:', form.email);
      }

      await updateDoc(ref, updateData);

      const changes = [];
      if (form.phone !== originalForm.phone) changes.push({ field: 'Phone', oldValue: originalForm.phone, newValue: form.phone });
      if (form.address !== originalForm.address) changes.push({ field: 'Address', oldValue: originalForm.address, newValue: form.address });
      if (form.fullName !== originalForm.fullName) changes.push({ field: 'Full Name', oldValue: originalForm.fullName, newValue: form.fullName });
      if (hasEmailChange && user && user.email === form.email) changes.push({ field: 'Email', oldValue: originalForm.email, newValue: form.email });
      
      if (changes.length > 0) {
        await sendProfileChangeNotification(form.email, form.fullName, changes);
      }

      setEdit(false);
      if (hasEmailChange && user && user.email === form.email) {
        setEmailChanged(false);
        setEmailVerificationSent(false);
        setSaveDisabled(false);
        setAuthEmailUpdated(false);
        setOriginalForm(form);
      } else if (!hasEmailChange) {
        setOriginalForm(form);
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleSaveButtonClick = () => {
    const hasNonEmailChanges = 
      form.phone !== originalForm.phone || 
      form.address !== originalForm.address || 
      form.fullName !== originalForm.fullName;

    if (saveDisabled && !hasNonEmailChanges) {
      handleSendVerification();
    } else {
      handleSave();
    }
  };

  const handleCancelEdit = () => {
    setForm(originalForm);
    setEdit(false);
    setEmailChanged(false);
    setEmailVerificationSent(false);
    setSaveDisabled(false);
    setVerificationChecked(false);
    setAuthEmailUpdated(false);
    setShowPasswordModal(false);
    setResendAttempts(0);
    setResendCooldown(0);
    setEmailDeliveryStatus('idle');
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
      
      const getLogoPath = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/logo.jpg`;
      };
  
      const logoPath = getLogoPath();
  
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
          
          if (src.startsWith('http')) {
            img.src = src + '?t=' + new Date().getTime();
          }
        });
      };
  
      let logoAvailable = false;
      try {
        await loadImage(logoPath);
        logoAvailable = true;
      } catch (error) {
        console.warn('Logo not available, using fallback:', error);
        logoAvailable = false;
      }
  
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

      const images = idCardElement.getElementsByTagName('img');
      const imageLoadPromises = [];
      
      for (let img of images) {
        if (!img.complete) {
          imageLoadPromises.push(new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          }));
        }
      }

      await Promise.race([
        Promise.all(imageLoadPromises),
        new Promise(resolve => setTimeout(resolve, 5000))
      ]);

      const canvas = await html2canvas(idCardElement, {
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            img.setAttribute('crossOrigin', 'anonymous');
          });
        }
      });

      document.body.removeChild(idCardElement);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdfWidth = 85;
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

  const uploadToFirebaseStorage = async (file, userId) => {
    if (!file) return '';
    
    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile-photos/${userId}/photo-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw new Error(`Photo upload failed: ${error.message}`);
    }
  };

  const deleteFromFirebaseStorage = async (photoUrl) => {
    if (!photoUrl) return;
    
    try {
      const photoRef = ref(storage, photoUrl);
      await deleteObject(photoRef);
    } catch (error) {
      console.error('Error deleting photo from Firebase Storage:', error);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    setPhotoUploading(true);
    setPhotoError('');
    
    try {
      if (profile?.photoURL && profile.photoURL.includes('firebasestorage.googleapis.com')) {
        await deleteFromFirebaseStorage(profile.photoURL);
      }
      
      const newPhotoUrl = await uploadToFirebaseStorage(file, user.uid);
      
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

  const hasNonEmailChanges = 
    form.phone !== originalForm.phone || 
    form.address !== originalForm.address || 
    form.fullName !== originalForm.fullName;

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
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        loading={passwordVerifying}
      />
      
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Profile</h1>
        
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
            <label className={`px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform cursor-pointer ${photoUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}>
              <FaCamera className="h-5 w-5 mr-2" />
              {photoUploading ? 'Uploading...' : 'Change Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={photoUploading} />
            </label>
            {photoError && <div className="text-red-500 mt-2">{photoError}</div>}
          </div>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">View & Edit Personal Info</h2>
          
          {emailChanged && user && user.email !== form.email && (
            <div className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-yellow-400 font-semibold mb-2">Email Verification Required</h3>
                  <p className="text-yellow-300 text-sm mb-3">
                    Please verify your new email address before saving changes.
                    {authEmailUpdated && (
                      <span className="block mt-1">
                        <strong>Check your inbox at {form.email} for the verification link.</strong>
                        <br />
                        <span className="text-yellow-200">Don't forget to check your spam folder!</span>
                      </span>
                    )}
                  </p>
                  
                  {emailDeliveryStatus === 'sending' && (
                    <div className="flex items-center text-blue-400 text-sm mb-2">
                      <FaSpinner className="animate-spin mr-2" />
                      Sending verification email...
                    </div>
                  )}
                  
                  {emailDeliveryStatus === 'sent' && (
                    <div className="flex items-center text-green-400 text-sm mb-2">
                      <FaCheck className="mr-2" />
                      Verification email sent! Check your inbox.
                      {lastEmailSent && (
                        <span className="ml-2 text-yellow-300">
                          (Last sent: {lastEmailSent.toLocaleTimeString()})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {emailDeliveryStatus === 'failed' && (
                    <div className="flex items-center text-red-400 text-sm mb-2">
                      <FaTimes className="mr-2" />
                      Failed to send email. Please try again.
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    {!emailVerificationSent ? (
                      <button
                        onClick={handleSendVerification}
                        disabled={emailVerifying}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center disabled:opacity-50"
                      >
                        {emailVerifying ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" />
                            Sending Verification...
                          </>
                        ) : (
                          <>
                            <FaEnvelope className="mr-2" />
                            Send Verification Email
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center text-green-400 text-sm">
                          <FaCheck className="mr-2" />
                          Verification email sent! Check your new email inbox.
                        </div>
                        
                        <button
                          onClick={handleResendVerification}
                          disabled={resendCooldown > 0 || emailVerifying}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center disabled:opacity-50"
                        >
                          {resendCooldown > 0 ? (
                            <>
                              <FaHistory className="mr-2" />
                              Resend available in {resendCooldown}s
                            </>
                          ) : (
                            <>
                              <FaRedo className="mr-2" />
                              Resend Verification Email
                              {resendAttempts > 0 && ` (${resendAttempts})`}
                            </>
                          )}
                        </button>
                        
                        {emailVerifying && (
                          <div className="flex items-center text-blue-400 text-sm">
                            <FaSpinner className="animate-spin mr-2" />
                            Waiting for email verification...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 p-3 bg-yellow-800/30 rounded text-yellow-200 text-xs">
                    <strong>Not receiving the email?</strong>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Check your spam or junk folder</li>
                      <li>Add waccps.org to your email whitelist</li>
                      <li>Ensure {form.email} is spelled correctly</li>
                      <li>Wait a few minutes - emails can take 1-5 minutes to arrive</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              verified={!emailChanged && user && user.emailVerified}
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
                  className={`flex-1 px-6 py-3 text-white rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform ${
                    saveDisabled && !hasNonEmailChanges 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={handleSaveButtonClick}
                >
                  <FaCheck className="h-5 w-5 mr-2" />
                  {saveDisabled && !hasNonEmailChanges 
                    ? 'Verify Email to Save' 
                    : 'Save Changes'
                  }
                </button>
                <button 
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
                  onClick={handleCancelEdit}
                >
                  <FaTimes className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
                onClick={() => setEdit(true)}
              >
                <FaEdit className="h-5 w-5 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Download Student ID Card</h2>
          <button 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
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