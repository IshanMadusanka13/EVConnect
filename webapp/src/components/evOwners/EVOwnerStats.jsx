import React, { useContext } from 'react';
import { User, CheckCircle, Car, Activity } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';

const EVOwnerStats = ({ evOwners }) => {
    const { darkMode, getColor } = useContext(ThemeContext);

    // Calculate statistics
    const stats = [
        {
            label: 'Total Owners',
            value: evOwners.length.toString(),
            change: '+5%',
            icon: User,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Active Accounts',
            value: evOwners.filter(o => o.isActive).length.toString(),
            change: '+3',
            icon: CheckCircle,
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            label: 'Cars Registered',
            value: evOwners.filter(o => o.vehicleType === 'Car').length.toString(),
            change: '+8',
            icon: Car,
            gradient: 'from-amber-500 to-orange-500'
        },
        {
            label: 'Total Energy',
            value: `${evOwners.reduce((sum, o) => sum + o.totalEnergy, 0).toFixed(0)} kWh`,
            change: '+12%',
            icon: Activity,
            gradient: 'from-purple-500 to-pink-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className={`group relative overflow-hidden rounded-2xl ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        <div className="relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className={`text-sm ${getColor('text.secondary')} mb-1`}>{stat.label}</p>
                            <p className={`text-3xl font-bold ${getColor('text.primary')}`}>{stat.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EVOwnerStats;