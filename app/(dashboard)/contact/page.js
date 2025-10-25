'use client';
import React from 'react';
import { 
  FaEnvelope, 
  FaWhatsapp, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook,
  FaPhone,
  FaBuilding
} from 'react-icons/fa';

const ContactPage = () => {
  const contactInfo = {
    communicationChannels: [
      {
        icon: <FaEnvelope className="text-red-500 text-xl" />,
        title: 'Email',
        value: 'info.waccps@gmail.com',
        link: 'mailto:info.waccps@gmail.com',
        description: 'For inquiries, student application and partnerships'
      },
      {
        icon: <FaWhatsapp className="text-green-500 text-xl" />,
        title: 'WhatsApp',
        value: '+234 708 192 4221',
        link: 'https://wa.me/2347081924221',
        description: 'Direct chat support'
      },
      {
        icon: <FaGlobe className="text-blue-500 text-xl" />,
        title: 'Website',
        value: 'www.waccps.org',
        link: 'https://www.waccps.org',
        description: 'Official website'
      }
    ],
    offices: [
      {
        icon: <FaBuilding className="text-purple-500 text-xl" />,
        title: 'Abuja Office',
        address: 'House No. 2 Zago Building, Beside Nigeria Corporate Registry Headquarters, Maitama, Abuja FCT.',
        description: 'Federal Capital Territory Office'
      },
      {
        icon: <FaBuilding className="text-orange-500 text-xl" />,
        title: 'Anambra Office',
        address: 'No. 2 Edwin Nwora Street, Nodu Road, Awka, Anambra State, Nigeria.',
        description: 'Anambra State Office'
      }
    ],
    socialMedia: [
      {
        icon: <FaLinkedin className="text-blue-600 text-xl" />,
        name: 'LinkedIn',
        handle: 'West African College of Clinical Physiology Sciences (WACCPS)',
        link: 'https://www.linkedin.com/in/west-african-college-of-clinical-physiology-sciences-waccps-45664b367/',
        username: '@WACCPS'
      },
      {
        icon: <FaTwitter className="text-black text-xl" />,
        name: 'Twitter (X)',
        handle: 'WACCPS',
        link: 'https://x.com/WACCPS_',
        username: '@WACCPS_'
      },
      {
        icon: <FaFacebook className="text-blue-700 text-xl" />,
        name: 'Facebook',
        handle: 'West African College of Clinical Physiology Sciences',
        link: 'https://www.facebook.com/profile.php?id=100063969766186&mibextid=ZbWKwL',
        username: 'WACCPS'
      }
    ]
  };

  const ContactCard = ({ icon, title, value, link, description, address, className = '' }) => (
    <div className={`bg-[#23272f] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          {value && (
            <a 
              href={link} 
              className="text-blue-400 hover:text-blue-300 hover:underline text-lg font-medium block mb-2"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {value}
            </a>
          )}
          {address && (
            <p className="text-gray-300 text-lg mb-2">{address}</p>
          )}
          {description && (
            <p className="text-gray-400 text-sm">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  const SocialMediaCard = ({ icon, name, handle, link, username }) => (
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-[#23272f] border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-all duration-300 hover:transform hover:scale-105 block"
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
          <p className="text-gray-300 text-sm">{handle}</p>
          <p className="text-blue-400 text-sm mt-1">{username}</p>
        </div>
      </div>
    </a>
  );

  return (
    <div className="min-h-screen bg-[#3e444d] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Get in touch with the West African College of Clinical Physiology Sciences. 
            We're here to assist you with inquiries, applications, and partnerships.
          </p>
        </div>

        {/* Communication Channels */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FaPhone className="mr-3 text-blue-400" />
            Communication Channels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.communicationChannels.map((channel, index) => (
              <ContactCard
                key={index}
                icon={channel.icon}
                title={channel.title}
                value={channel.value}
                link={channel.link}
                description={channel.description}
              />
            ))}
          </div>
        </section>

        {/* Office Locations */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FaMapMarkerAlt className="mr-3 text-green-400" />
            Our Offices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactInfo.offices.map((office, index) => (
              <ContactCard
                key={index}
                icon={office.icon}
                title={office.title}
                address={office.address}
                description={office.description}
              />
            ))}
          </div>
        </section>

        {/* Social Media */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FaGlobe className="mr-3 text-purple-400" />
            Connect With Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.socialMedia.map((social, index) => (
              <SocialMediaCard
                key={index}
                icon={social.icon}
                name={social.name}
                handle={social.handle}
                link={social.link}
                username={social.username}
              />
            ))}
          </div>
        </section>

      

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            We typically respond to all inquiries within 24-48 hours during business days.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Business Hours: Monday - Friday, 9:00 AM - 5:00 PM WAT
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;