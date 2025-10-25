import PhoneInputField  from '@/components/auth/steps/forms/PhoneInputField';
import { COUNTRIES } from '@/utils/constants';
import FormInput from "@/components/auth/steps/forms/FormInput"
export const PersonalInfoStep = ({ form, phoneValue, handleChange, updatePhone, maxDob }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        label="Surname"
        name="surname"
        value={form.surname}
        onChange={handleChange}
        required
        placeholder="Surname"
      />
      
      <FormInput
        label="First Name"
        name="firstname"
        value={form.firstname}
        onChange={handleChange}
        required
        placeholder="First Name"
      />
      
      <FormInput
        label="Middle Name"
        name="middlename"
        value={form.middlename}
        onChange={handleChange}
        required
        placeholder="Middle Name"
      />
      
      <FormInput
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        placeholder="Email"
      />
      
      <FormInput
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
        placeholder="Password"
      />

      <FormInput
        label="Date of Birth"
        name="dob"
        type="date"
        value={form.dob}
        onChange={handleChange}
        required
        max={maxDob}
      />
      
      <div className="flex flex-col gap-1">
        <label className="text-white text-sm">Gender*</label>
        <select 
          name="gender" 
          className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" 
          value={form.gender} 
          onChange={handleChange} 
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <PhoneInputField value={phoneValue} onChange={updatePhone} />
      
      <FormInput
        label="Address"
        name="address"
        value={form.address}
        onChange={handleChange}
        required
        placeholder="Contact Address"
        className="md:col-span-2"
      />
      
      <FormInput
        label="Institution"
        name="institution"
        value={form.institution}
        onChange={handleChange}
        required
        placeholder="Institution"
      />
      
      <div className="flex flex-col gap-1">
        <label className="text-white text-sm">Nationality</label>
        <select 
          name="nationality" 
          className="px-3 py-2 rounded bg-[#23272f] text-white border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" 
          value={form.nationality} 
          onChange={handleChange}
        >
          <option value="">Select Nationality</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
};