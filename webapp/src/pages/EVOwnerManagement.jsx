import React, { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import EVOwnerStats from '../components/evOwners/EVOwnerStats';
import EVOwnerFilters from '../components/evOwners/EVOwnerFilters';
import EVOwnerCard from '../components/evOwners/EVOwnerCard';
import CreateOwnerModal from '../components/evOwners/CreateOwnerModal';
import EditOwnerModal from '../components/evOwners/EditOwnerModal';
import OwnerDetailsModal from '../components/evOwners/OwnerDetailsModal';

const EVOwnerManagement = () => {
    const { darkMode, getColor } = useContext(ThemeContext);

    // State management
    const [evOwners, setEvOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        vehicleType: 'all'
    });

    // Fetch EV owners data on component mount
    useEffect(() => {
        fetchEVOwners();
    }, []);

    // Simulate API call to fetch EV owners
    const fetchEVOwners = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                const mockData = [
                    {
                        nic: '987654321V',
                        firstName: 'John',
                        lastName: 'Doe',
                        dateOfBirth: '1990-05-15',
                        gender: 'Male',
                        email: 'john.doe@example.com',
                        phoneNumber: '0771234567',
                        address: '123 Main Street, Colombo',
                        vehicleType: 'Car',
                        vehicleModel: 'Tesla Model 3',
                        vehiclePlateNumber: 'CAB-1234',
                        batteryCapacity: '75 kWh',
                        compatibleChargerTypes: 'AC,DC,Super',
                        isActive: true,
                        registrationDate: '2024-01-10',
                        totalBookings: 12,
                        totalEnergy: 450.5,
                        rating: 4.8
                    },
                    // Add more mock data as needed...
                ];
                setEvOwners(mockData);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching EV owners:', error);
            setLoading(false);
        }
    };

    // Filter owners based on search and filter criteria
    const filteredOwners = evOwners.filter(owner => {
        const matchesSearch = filters.search === '' ||
            owner.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
            owner.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
            owner.email.toLowerCase().includes(filters.search.toLowerCase()) ||
            owner.nic.includes(filters.search);

        const matchesStatus = filters.status === 'all' ||
            (filters.status === 'active' && owner.isActive) ||
            (filters.status === 'inactive' && !owner.isActive);

        const matchesVehicle = filters.vehicleType === 'all' ||
            owner.vehicleType === filters.vehicleType;

        return matchesSearch && matchesStatus && matchesVehicle;
    });

    // Handle owner activation
    const handleActivate = async (nic) => {
        try {
            // TODO: Replace with actual API call
            setEvOwners(prev => prev.map(owner =>
                owner.nic === nic ? { ...owner, isActive: true } : owner
            ));
        } catch (error) {
            console.error('Error activating owner:', error);
        }
    };

    // Handle owner deactivation
    const handleDeactivate = async (nic) => {
        try {
            // TODO: Replace with actual API call
            setEvOwners(prev => prev.map(owner =>
                owner.nic === nic ? { ...owner, isActive: false } : owner
            ));
        } catch (error) {
            console.error('Error deactivating owner:', error);
        }
    };

    // Handle owner deletion
    const handleDelete = async (nic) => {
        if (window.confirm('Are you sure you want to delete this EV owner?')) {
            try {
                // TODO: Replace with actual API call
                setEvOwners(prev => prev.filter(owner => owner.nic !== nic));
            } catch (error) {
                console.error('Error deleting owner:', error);
            }
        }
    };

    // Handle owner creation
    const handleCreateOwner = async (ownerData) => {
        try {
            // TODO: Replace with actual API call
            const newOwner = {
                ...ownerData,
                nic: ownerData.nic,
                isActive: true,
                registrationDate: new Date().toISOString().split('T')[0],
                totalBookings: 0,
                totalEnergy: 0,
                rating: 0
            };
            setEvOwners(prev => [...prev, newOwner]);
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating owner:', error);
        }
    };

    // Handle owner update
    const handleUpdateOwner = async (nic, ownerData) => {
        try {
            // TODO: Replace with actual API call
            setEvOwners(prev => prev.map(owner =>
                owner.nic === nic ? { ...owner, ...ownerData } : owner
            ));
            setShowEditModal(false);
            setSelectedOwner(null);
        } catch (error) {
            console.error('Error updating owner:', error);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
                <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
            </div>

            <Navbar />

            {/* Main Content */}
            <div className="relative pt-24 pb-8 px-4 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`px-3 py-1 rounded-full ${getColor('background.accent')} ${getColor('text.accent')} text-sm font-medium`}>
                            Dashboard
                        </div>
                        <span className={`w-4 h-4 ${getColor('text.tertiary')}`}>/</span>
                        <div className={`px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium`}>
                            EV Owners
                        </div>
                    </div>
                    <h1 className={`text-4xl font-bold mb-2 ${getColor('text.primary')}`}>
                        EV <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-green-500 to-emerald-500">Owners</span>
                    </h1>
                    <p className={`text-lg ${getColor('text.secondary')}`}>
                        Manage all electric vehicle owner profiles and accounts
                    </p>
                </div>

                {/* Statistics Cards */}
                <EVOwnerStats evOwners={evOwners} />

                {/* Filters Section */}
                <EVOwnerFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onCreateOwner={() => setShowCreateModal(true)}
                />

                {/* EV Owners Grid */}
                {loading ? (
                    <LoadingGrid />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOwners.map((owner, index) => (
                            <EVOwnerCard
                                key={owner.nic}
                                owner={owner}
                                index={index}
                                onSelect={setSelectedOwner}
                                onEdit={(owner) => {
                                    setSelectedOwner(owner);
                                    setShowEditModal(true);
                                }}
                                onActivate={handleActivate}
                                onDeactivate={handleDeactivate}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredOwners.length === 0 && (
                    <EmptyState onCreateOwner={() => setShowCreateModal(true)} />
                )}
            </div>

            {/* Modals */}
            {selectedOwner && (
                <OwnerDetailsModal
                    owner={selectedOwner}
                    onClose={() => setSelectedOwner(null)}
                    onEdit={() => setShowEditModal(true)}
                    onStatusToggle={() => {
                        if (selectedOwner.isActive) {
                            handleDeactivate(selectedOwner.nic);
                        } else {
                            handleActivate(selectedOwner.nic);
                        }
                        setSelectedOwner(null);
                    }}
                    onDelete={() => {
                        handleDelete(selectedOwner.nic);
                        setSelectedOwner(null);
                    }}
                />
            )}

            {showCreateModal && (
                <CreateOwnerModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateOwner}
                />
            )}

            {showEditModal && selectedOwner && (
                <EditOwnerModal
                    owner={selectedOwner}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedOwner(null);
                    }}
                    onUpdate={handleUpdateOwner}
                />
            )}
        </div>
    );
};

// Loading grid component
const LoadingGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse border border-slate-200 dark:border-slate-700">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full mt-4"></div>
            </div>
        ))}
    </div>
);

// Empty state component
const EmptyState = ({ onCreateOwner }) => {
    const { getColor } = useContext(ThemeContext);

    return (
        <div className={`text-center py-12 ${getColor('text.secondary')}`}>
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">No EV Owners Found</h3>
            <p className="mb-6">Get started by creating your first EV owner profile.</p>
            <button
                onClick={onCreateOwner}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
                Create First Owner
            </button>
        </div>
    );
};

export default EVOwnerManagement;