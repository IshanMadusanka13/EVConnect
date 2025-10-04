import React, { useContext } from 'react';
import {
    User, Mail, Calendar, Activity, Battery, Star,
    ChevronRight, Car, Edit, Trash2
} from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const EVOwnerCard = ({
    owner,
    index,
    onSelect,
    onEdit,
    onActivate,
    onDeactivate,
    onDelete
}) => {
    const { darkMode, getColor } = useContext(ThemeContext);

    // Get status color based on active state
    const getStatusColor = (isActive) => {
        return isActive ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-pink-500';
    };

    // Get vehicle icon based on type
    const getVehicleIcon = (type) => {
        return type === 'Car' ?
            <Car className={`w-5 h-5 ${getColor('text.primary')}`} /> :
            <Battery className={`w-5 h-5 ${getColor('text.primary')}`} />;
    };

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onSelect(owner)}
        >
            {/* Gradient Border Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor(owner.isActive)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>

            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(owner.isActive)} text-white text-xs font-semibold shadow-lg`}>
                    {owner.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>

            <div className="relative p-6">
                {/* Owner Info */}
                <div className="mb-4">
                    <h3 className={`font-bold text-xl mb-2 ${getColor('text.primary')} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${getStatusColor(owner.isActive)} transition-all`}>
                        {owner.firstName} {owner.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                        <User className={`w-4 h-4 ${getColor('text.secondary')}`} />
                        <span className={`text-sm ${getColor('text.secondary')}`}>
                            {owner.nic}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${getColor('text.secondary')}`} />
                        <span className={`text-sm ${getColor('text.secondary')}`}>
                            {owner.email}
                        </span>
                    </div>
                </div>

                {/* Vehicle Info */}
                <div className={`mb-4 p-3 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {getVehicleIcon(owner.vehicleType)}
                            <span className={`text-sm font-semibold ${getColor('text.primary')}`}>
                                {owner.vehicleType}
                            </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${owner.vehicleType === 'Car' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'}`}>
                            {owner.vehicleType}
                        </span>
                    </div>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className={getColor('text.tertiary')}>Model</span>
                            <span className={getColor('text.primary')}>{owner.vehicleModel}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={getColor('text.tertiary')}>Plate</span>
                            <span className={getColor('text.primary')}>{owner.vehiclePlateNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Stats & Rating */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(owner.isActive)}`}>
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className={`text-xs ${getColor('text.tertiary')}`}>Registered</p>
                            <p className={`text-sm font-semibold ${getColor('text.primary')}`}>
                                {new Date(owner.registrationDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(owner.isActive)}`}>
                            <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className={`text-xs ${getColor('text.tertiary')}`}>Bookings</p>
                            <p className={`text-sm font-semibold ${getColor('text.primary')}`}>
                                {owner.totalBookings} sessions
                            </p>
                        </div>
                    </div>
                </div>

                {/* Battery & Rating */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${getColor('text.secondary')}`} />
                        <span className={`text-sm font-medium ${getColor('text.primary')}`}>
                            {owner.batteryCapacity}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className={`text-sm font-semibold ${getColor('text.primary')}`}>
                            {owner.rating}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(owner);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (owner.isActive) {
                                onDeactivate(owner.nic);
                            } else {
                                onActivate(owner.nic);
                            }
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${owner.isActive
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}
                    >
                        {owner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(owner.nic);
                        }}
                        className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Hover Arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className={`w-5 h-5 ${getColor('text.secondary')}`} />
            </div>
        </div>
    );
};

export default EVOwnerCard;