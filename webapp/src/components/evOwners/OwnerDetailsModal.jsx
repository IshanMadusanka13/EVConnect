import React, { useContext } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, Activity, Star, Battery, Car } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const OwnerDetailsModal = ({ owner, onClose, onEdit, onStatusToggle, onDelete }) => {
    const { darkMode, getColor } = useContext(ThemeContext);

    // Safe value getter with fallbacks
    const getSafeValue = (value, fallback = 'N/A') => {
        return value !== null && value !== undefined ? value : fallback;
    };

    // Safe number to string conversion
    const getSafeNumberString = (value, fallback = '0') => {
        return value !== null && value !== undefined ? value.toString() : fallback;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Calculate member duration
    const getMemberDuration = () => {
        if (!owner.registrationDate) return 'N/A';

        try {
            const registrationDate = new Date(owner.registrationDate);
            const today = new Date();
            const diffTime = Math.abs(today - registrationDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 30) return `${diffDays} days`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
            return `${Math.floor(diffDays / 365)} years`;
        } catch (error) {
            return 'N/A';
        }
    };

    // Safe compatible charger types split
    const getChargerTypes = () => {
        if (!owner.compatibleChargerTypes) return [];
        try {
            return owner.compatibleChargerTypes.split(',').map(type => type.trim());
        } catch (error) {
            return [];
        }
    };

    if (!owner) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
                <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
                    <div className="p-6 text-center">
                        <p className={`text-lg ${getColor('text.primary')}`}>No owner data available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>

                {/* Header */}
                <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>
                            Owner Details
                        </h2>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Owner Banner */}
                    <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r ${getSafeValue(owner.isActive) ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-pink-500'}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {getSafeValue(owner.firstName)} {getSafeValue(owner.lastName)}
                                </h3>
                                <div className="flex items-center gap-2 text-white/90 mb-1">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm">NIC: {getSafeValue(owner.nic)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/90">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{getSafeValue(owner.email)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-white/90 text-sm">Member for</div>
                                <div className="text-white text-lg font-bold">{getMemberDuration()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information Section */}
                    <div className="mb-6">
                        <h3 className={`text-xl font-semibold mb-4 ${getColor('text.primary')}`}>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard
                                label="Email Address"
                                value={getSafeValue(owner.email)}
                                icon={Mail}
                                color="blue"
                            />
                            <InfoCard
                                label="Phone Number"
                                value={getSafeValue(owner.phoneNumber)}
                                icon={Phone}
                                color="green"
                            />
                            <InfoCard
                                label="Gender"
                                value={getSafeValue(owner.gender)}
                                icon={User}
                                color="purple"
                            />
                            <InfoCard
                                label="Date of Birth"
                                value={formatDate(owner.dateOfBirth)}
                                icon={Calendar}
                                color="orange"
                            />
                        </div>
                        <div className="mt-4">
                            <InfoCard
                                label="Address"
                                value={getSafeValue(owner.address)}
                                icon={MapPin}
                                color="red"
                                fullWidth
                            />
                        </div>
                    </div>

                    {/* Vehicle Information Section */}
                    <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-blue-50 to-green-50'} mb-6`}>
                        <h3 className={`font-bold mb-4 ${getColor('text.primary')}`}>
                            Vehicle Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 mb-2`}>
                                    <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className={`text-sm ${getColor('text.secondary')}`}>Type</p>
                                <p className={`text-lg font-bold ${getColor('text.primary')}`}>{getSafeValue(owner.vehicleType)}</p>
                            </div>
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/20 mb-2`}>
                                    <Car className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className={`text-sm ${getColor('text.secondary')}`}>Model</p>
                                <p className={`text-lg font-bold ${getColor('text.primary')}`}>{getSafeValue(owner.vehicleModel)}</p>
                            </div>
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 mb-2`}>
                                    <Car className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className={`text-sm ${getColor('text.secondary')}`}>Plate</p>
                                <p className={`text-lg font-bold ${getColor('text.primary')}`}>{getSafeValue(owner.vehiclePlateNumber)}</p>
                            </div>
                            <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/20 mb-2`}>
                                    <Battery className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <p className={`text-sm ${getColor('text.secondary')}`}>Battery</p>
                                <p className={`text-lg font-bold ${getColor('text.primary')}`}>{getSafeValue(owner.batteryCapacity)}</p>
                            </div>
                        </div>
                        <div className="mt-4 p-4 rounded-xl bg-white/50 dark:bg-slate-700/50">
                            <p className={`text-sm font-semibold ${getColor('text.primary')} mb-1`}>
                                Compatible Charger Types
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {getChargerTypes().length > 0 ? (
                                    getChargerTypes().map((type, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-full text-sm font-medium"
                                        >
                                            {type}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-slate-500 dark:text-slate-400">No charger types specified</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Usage Statistics Section */}
                    <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-gradient-to-br from-purple-50 to-pink-50'} mb-6`}>
                        <h3 className={`font-bold mb-4 ${getColor('text.primary')}`}>
                            Usage Statistics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                label="Total Bookings"
                                value={getSafeNumberString(owner.totalBookings)}
                                subtitle="charging sessions"
                                gradient="from-blue-500 to-cyan-500"
                            />
                            <StatCard
                                label="Total Energy"
                                value={getSafeNumberString(owner.totalEnergy)}
                                subtitle="kWh consumed"
                                gradient="from-green-500 to-emerald-500"
                            />
                            <StatCard
                                label="Customer Rating"
                                value={getSafeNumberString(owner.rating, '0.0')}
                                subtitle="out of 5 stars"
                                gradient="from-amber-500 to-orange-500"
                            />
                            <StatCard
                                label="Account Status"
                                value={getSafeValue(owner.isActive) ? "Active" : "Inactive"}
                                subtitle={getSafeValue(owner.isActive) ? "✓ Verified" : "✗ Suspended"}
                                gradient={getSafeValue(owner.isActive) ? "from-emerald-500 to-teal-500" : "from-red-500 to-pink-500"}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onEdit}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={onStatusToggle}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all ${getSafeValue(owner.isActive)
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-amber-500/50'
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-emerald-500/50'
                                }`}
                        >
                            {getSafeValue(owner.isActive) ? 'Deactivate Account' : 'Activate Account'}
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Info Card Component
const InfoCard = ({ label, value, icon: Icon, color, fullWidth = false }) => {
    const { getColor } = useContext(ThemeContext);

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
        orange: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
        red: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
    };

    return (
        <div className={`${fullWidth ? 'col-span-2' : ''} p-4 rounded-xl border ${getColor('border.primary')} ${getColor('background.card')}`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>{label}</p>
                    <p className={`font-semibold ${getColor('text.primary')}`}>{value}</p>
                </div>
            </div>
        </div>
    );
};

// Reusable Stat Card Component
const StatCard = ({ label, value, subtitle, gradient }) => {
    const { getColor } = useContext(ThemeContext);

    return (
        <div className="text-center">
            <p className={`text-sm ${getColor('text.secondary')} mb-2`}>{label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {value}
            </p>
            <p className={`text-xs ${getColor('text.tertiary')} mt-1`}>{subtitle}</p>
        </div>
    );
};

export default OwnerDetailsModal;