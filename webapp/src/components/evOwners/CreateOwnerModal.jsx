import React, { useState, useContext } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Car, Battery, AlertCircle } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const CreateOwnerModal = ({ onClose, onCreate }) => {
    const { darkMode, getColor } = useContext(ThemeContext);

    // Form state
    const [formData, setFormData] = useState({
        nic: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phoneNumber: '',
        address: '',
        password: '',
        confirmPassword: '',
        vehicleType: '',
        vehicleModel: '',
        vehiclePlateNumber: '',
        batteryCapacity: '',
        compatibleChargerTypes: 'AC,DC'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Validate field in real-time
        validateField(field, value);

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Real-time field validation
    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'nic':
                if (!value.trim()) {
                    error = 'NIC is required';
                } else if (value.length < 10) {
                    error = 'NIC must be at least 10 characters';
                } else if (value.length > 12) {
                    error = 'NIC cannot exceed 12 characters';
                } else if (value.length === 10 && !/^\d{9}[VX]$/i.test(value)) {
                    error = 'Old NIC format: 9 digits followed by V or X';
                } else if (value.length === 12 && !/^\d{12}$/.test(value)) {
                    error = 'New NIC format: 12 digits only';
                }
                break;

            case 'firstName':
                if (!value.trim()) {
                    error = 'First name is required';
                } else if (!/^[a-zA-Z ]+$/.test(value)) {
                    error = 'First name can only contain letters and spaces';
                }
                break;

            case 'lastName':
                if (!value.trim()) {
                    error = 'Last name is required';
                } else if (!/^[a-zA-Z ]+$/.test(value)) {
                    error = 'Last name can only contain letters and spaces';
                }
                break;

            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;

            case 'phoneNumber':
                if (!value.trim()) {
                    error = 'Phone number is required';
                } else if (!/^0\d{9}$/.test(value)) {
                    error = 'Phone must be 10 digits starting with 0';
                }
                break;

            case 'vehicleModel':
                if (!value.trim()) {
                    error = 'Vehicle model is required';
                } else if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
                    error = 'Vehicle model can only contain letters, numbers and spaces';
                }
                break;

            case 'vehiclePlateNumber':
                if (!value.trim()) {
                    error = 'Plate number is required';
                } else if (!/^[A-Z0-9/]+$/.test(value.toUpperCase())) {
                    error = 'Plate number can only contain letters, numbers and /';
                }
                break;

            case 'batteryCapacity':
                if (!value.trim()) {
                    error = 'Battery capacity is required';
                } else {
                    const capacity = parseFloat(value);
                    if (isNaN(capacity) || capacity <= 0) {
                        error = 'Battery capacity must be a positive number';
                    }
                }
                break;

            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (value.length < 6) {
                    error = 'Password must be at least 6 characters';
                }
                break;

            case 'confirmPassword':
                if (!value) {
                    error = 'Please confirm your password';
                } else if (value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;

            case 'gender':
                if (value && !['Male', 'Female', 'Other'].includes(value)) {
                    error = 'Please select a valid gender';
                }
                break;

            case 'vehicleType':
                if (value && !['Car', 'Bike'].includes(value)) {
                    error = 'Please select a valid vehicle type';
                }
                break;

            case 'dateOfBirth':
                if (value) {
                    const today = new Date();
                    const birthDate = new Date(value);
                    const age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    let actualAge = age;
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        actualAge = age - 1;
                    }

                    if (actualAge < 16) {
                        error = 'Must be at least 16 years old';
                    }
                }
                break;

            default:
                break;
        }

        if (error) {
            setErrors(prev => ({
                ...prev,
                [field]: error
            }));
        } else if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Validate entire form
    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        if (!formData.nic.trim()) newErrors.nic = 'NIC is required';
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
        if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Vehicle model is required';
        if (!formData.vehiclePlateNumber.trim()) newErrors.vehiclePlateNumber = 'Plate number is required';
        if (!formData.batteryCapacity.trim()) newErrors.batteryCapacity = 'Battery capacity is required';
        if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

        // Format validation
        if (formData.nic) {
            if (formData.nic.length === 10 && !/^\d{9}[VX]$/i.test(formData.nic)) {
                newErrors.nic = 'Old NIC format: 9 digits followed by V or X';
            } else if (formData.nic.length === 12 && !/^\d{12}$/.test(formData.nic)) {
                newErrors.nic = 'New NIC format: 12 digits only';
            } else if (formData.nic.length < 10 || formData.nic.length > 12) {
                newErrors.nic = 'NIC must be 10 or 12 characters';
            }
        }

        if (formData.firstName && !/^[a-zA-Z ]+$/.test(formData.firstName)) {
            newErrors.firstName = 'First name can only contain letters and spaces';
        }

        if (formData.lastName && !/^[a-zA-Z ]+$/.test(formData.lastName)) {
            newErrors.lastName = 'Last name can only contain letters and spaces';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.phoneNumber && !/^0\d{9}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone must be 10 digits starting with 0';
        }

        if (formData.vehicleModel && !/^[a-zA-Z0-9 ]+$/.test(formData.vehicleModel)) {
            newErrors.vehicleModel = 'Vehicle model can only contain letters, numbers and spaces';
        }

        if (formData.vehiclePlateNumber && !/^[A-Z0-9/]+$/.test(formData.vehiclePlateNumber.toUpperCase())) {
            newErrors.vehiclePlateNumber = 'Plate number can only contain letters, numbers and /';
        }

        if (formData.batteryCapacity) {
            const capacity = parseFloat(formData.batteryCapacity);
            if (isNaN(capacity) || capacity <= 0) {
                newErrors.batteryCapacity = 'Battery capacity must be a positive number';
            }
        }

        if (formData.gender && !['Male', 'Female', 'Other'].includes(formData.gender)) {
            newErrors.gender = 'Please select a valid gender';
        }

        if (formData.vehicleType && !['Car', 'Bike'].includes(formData.vehicleType)) {
            newErrors.vehicleType = 'Please select a valid vehicle type';
        }

        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Date of Birth validation (must be at least 16 years old)
        if (formData.dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(formData.dateOfBirth);
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            let actualAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                actualAge = age - 1;
            }

            if (actualAge < 16) {
                newErrors.dateOfBirth = 'Must be at least 16 years old';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await onCreate(formData);
        } catch (error) {
            console.error('Error creating owner:', error);
            // Error is handled in the parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    // Charger type options
    const chargerTypes = [
        { value: 'AC', label: 'AC Charging', description: 'Standard • 7-22 kW' },
        { value: 'DC', label: 'DC', description: 'Rapid • 50-350 kW' },
        { value: 'AC,DC', label: 'AC & DC', description: 'Dual compatible' },
        { value: 'AC,DC,Super', label: 'All Types', description: 'Full compatibility' }
    ];

    // Gender options
    const genderOptions = ['Male', 'Female', 'Other'];

    // Vehicle type options
    const vehicleTypeOptions = ['Car', 'Bike'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>

                {/* Header */}
                <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>
                            Create New EV Owner
                        </h2>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Personal Information Section */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-4 ${getColor('text.primary')}`}>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* NIC */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    NIC *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nic}
                                    onChange={(e) => handleInputChange('nic', e.target.value.toUpperCase())}
                                    maxLength={12}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.nic ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="Enter NIC (9 digits + V/X or 12 digits)"
                                />
                                {errors.nic && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.nic}
                                </p>}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Gender *
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.gender ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                >
                                    <option value="">Select Gender</option>
                                    {genderOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.gender}
                                </p>}
                            </div>

                            {/* First Name */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.firstName ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="Enter first name"
                                />
                                {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.firstName}
                                </p>}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.lastName ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="Enter last name"
                                />
                                {errors.lastName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.lastName}
                                </p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]} // Max date is today
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.dateOfBirth ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.dateOfBirth}
                                </p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="Enter email address"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.email}
                                </p>}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    maxLength={10}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.phoneNumber ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="Enter 10-digit phone number"
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.phoneNumber}
                                </p>}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="mt-4">
                            <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                Address *
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none`}
                                placeholder="Enter full address"
                            />
                            {!formData.address.trim() && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Address is required
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Vehicle Information Section */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-4 ${getColor('text.primary')}`}>
                            Vehicle Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Vehicle Type */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Vehicle Type *
                                </label>
                                <select
                                    value={formData.vehicleType}
                                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.vehicleType ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                >
                                    <option value="">Select Vehicle Type</option>
                                    {vehicleTypeOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                {errors.vehicleType && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.vehicleType}
                                </p>}
                            </div>

                            {/* Vehicle Model */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Vehicle Model *
                                </label>
                                <input
                                    type="text"
                                    value={formData.vehicleModel}
                                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.vehicleModel ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="e.g., Tesla Model 3"
                                />
                                {errors.vehicleModel && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.vehicleModel}
                                </p>}
                            </div>

                            {/* Plate Number */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Plate Number *
                                </label>
                                <input
                                    type="text"
                                    value={formData.vehiclePlateNumber}
                                    onChange={(e) => handleInputChange('vehiclePlateNumber', e.target.value.toUpperCase())}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.vehiclePlateNumber ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="e.g., CAB-1234"
                                />
                                {errors.vehiclePlateNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.vehiclePlateNumber}
                                </p>}
                            </div>

                            {/* Battery Capacity */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Battery Capacity *
                                </label>
                                <input
                                    type="text"
                                    value={formData.batteryCapacity}
                                    onChange={(e) => handleInputChange('batteryCapacity', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.batteryCapacity ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="e.g., 75 kWh"
                                />
                                {errors.batteryCapacity && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.batteryCapacity}
                                </p>}
                            </div>
                        </div>

                        {/* Charger Types */}
                        <div className="mt-4">
                            <label className={`block text-sm font-semibold mb-3 ${getColor('text.primary')}`}>
                                Compatible Charger Types
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {chargerTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleInputChange('compatibleChargerTypes', type.value)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${formData.compatibleChargerTypes === type.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-105'
                                            : `${darkMode ? 'border-slate-700 hover:border-slate-600' : 'border-slate-200 hover:border-slate-300'}`
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${formData.compatibleChargerTypes === type.value
                                                ? 'bg-blue-500 text-white'
                                                : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <Battery className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className={`font-semibold ${getColor('text.primary')}`}>{type.label}</p>
                                                <p className={`text-xs ${getColor('text.secondary')}`}>{type.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Account Security Section */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-4 ${getColor('text.primary')}`}>
                            Account Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="Enter password (min 6 characters)"
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.password}
                                </p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Confirm Password *
                                </label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    placeholder="Confirm password"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.confirmPassword}
                                </p>}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Owner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOwnerModal;