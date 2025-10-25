import React, { useState, useContext, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Car, Battery, AlertCircle } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const EditOwnerModal = ({ owner, onClose, onUpdate }) => {
    const { darkMode, getColor } = useContext(ThemeContext);

    // Form state - initialize with owner data
    const [formData, setFormData] = useState({
        nic: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phoneNumber: '',
        address: '',
        vehicleType: '',
        vehicleModel: '',
        vehiclePlateNumber: '',
        batteryCapacity: '',
        compatibleChargerTypes: 'AC,DC'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Convert ISO date to yyyy-MM-dd format for HTML input
    const formatDateForInput = (isoDateString) => {
        if (!isoDateString) return '';
        try {
            const date = new Date(isoDateString);
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    // Initialize form with owner data
    useEffect(() => {
        if (owner) {
            setFormData({
                nic: owner.nic || '',
                firstName: owner.firstName || '',
                lastName: owner.lastName || '',
                dateOfBirth: formatDateForInput(owner.dateOfBirth),
                gender: owner.gender || '',
                email: owner.email || '',
                phoneNumber: owner.phoneNumber || '',
                address: owner.address || '',
                vehicleType: owner.vehicleType || '',
                vehicleModel: owner.vehicleModel || '',
                vehiclePlateNumber: owner.vehiclePlateNumber || '',
                batteryCapacity: owner.batteryCapacity || '',
                compatibleChargerTypes: owner.compatibleChargerTypes || 'AC,DC'
            });
        }
    }, [owner]);

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Validate field in real-time (excluding required validation)
        validateField(field, value);

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    // Real-time field validation (excluding required validation)
    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'firstName':
                if (value && !/^[a-zA-Z ]+$/.test(value)) {
                    error = 'First name can only contain letters and spaces';
                }
                break;

            case 'lastName':
                if (value && !/^[a-zA-Z ]+$/.test(value)) {
                    error = 'Last name can only contain letters and spaces';
                }
                break;

            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;

            case 'phoneNumber':
                if (value && !/^0\d{9}$/.test(value)) {
                    error = 'Phone must be 10 digits starting with 0';
                }
                break;

            case 'vehicleModel':
                if (value && !/^[a-zA-Z0-9 ]+$/.test(value)) {
                    error = 'Vehicle model can only contain letters, numbers and spaces';
                }
                break;

            case 'vehiclePlateNumber':
                if (value && !/^[A-Z0-9/]+$/.test(value.toUpperCase())) {
                    error = 'Plate number can only contain letters, numbers and /';
                }
                break;

            case 'batteryCapacity':
                if (value) {
                    const capacity = parseFloat(value);
                    if (isNaN(capacity) || capacity <= 0) {
                        error = 'Battery capacity must be a positive number';
                    }
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

    // Validate form (excluding required validation)
    const validateForm = () => {
        const newErrors = {};

        // Format validation only (no required field validation)
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

        // Date of Birth validation (must be at least 16 years old if provided)
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
            // Prepare the data for update - convert date back to ISO format
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : owner.dateOfBirth,
                gender: formData.gender,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                vehicleType: formData.vehicleType,
                vehicleModel: formData.vehicleModel,
                vehiclePlateNumber: formData.vehiclePlateNumber,
                batteryCapacity: formData.batteryCapacity,
                compatibleChargerTypes: formData.compatibleChargerTypes
            };

            console.log('Updating owner with data:', updateData);

            await onUpdate(owner.nic, updateData);
        } catch (error) {
            console.error('Error updating owner:', error);
            alert('Failed to update owner. Please try again.');
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

    if (!owner) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>

                {/* Header */}
                <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>
                            Edit EV Owner
                        </h2>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className={`text-sm ${getColor('text.secondary')} mt-2`}>
                        Update the details for {owner.firstName} {owner.lastName}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Personal Information Section */}
                    <div>
                        <h3 className={`text-lg font-semibold mb-4 ${getColor('text.primary')}`}>
                            Personal Information
                        </h3>

                        {/* NIC (Read-only) */}
                        <div className="mb-4">
                            <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                NIC
                            </label>
                            <div className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400`}>
                                {formData.nic}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                NIC cannot be modified
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Gender */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${getColor('text.primary')}`}>
                                    Gender
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
                                    First Name
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
                                    Last Name
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
                                    Email Address
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
                                    Phone Number
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
                                Address
                            </label>
                            <textarea
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none`}
                                placeholder="Enter full address"
                            />
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
                                    Vehicle Type
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
                                    Vehicle Model
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
                                    Plate Number
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
                                    Battery Capacity
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
                            {isSubmitting ? 'Updating...' : 'Update Owner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditOwnerModal;