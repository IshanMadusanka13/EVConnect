import React, { useContext, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';
import api from '../../utils/api';

const EVOwnerFilters = ({ filters, onFiltersChange, onCreateOwner }) => {
    const { darkMode, getColor } = useContext(ThemeContext);
    const [searchResults, setSearchResults] = useState([]);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });

        // If it's a search filter change, trigger search API call
        if (key === 'search') {
            handleSearch(value);
        }
    };

    // Handle search API call
    const handleSearch = async (searchTerm) => {
        if (searchTerm.trim() === '') {
            // Reset search results if search is empty
            setSearchResults([]);
            return;
        }

        try {
            const results = await api.searchEVOwners(searchTerm);
            setSearchResults(results);
            // Note: You'll need to handle how these search results integrate with your main data
        } catch (error) {
            console.error('Error searching owners:', error);
            setSearchResults([]);
        }
    };

    return (
        <div className={`${getColor('background.card')} backdrop-blur-sm rounded-2xl border ${getColor('border.primary')} p-6 mb-6`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getColor('text.tertiary')}`} />
                        <input
                            type="text"
                            placeholder="Search owners by name, email, or NIC..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className={`pl-12 pr-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-80`}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className={`px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Vehicle Type Filter */}
                    <select
                        value={filters.vehicleType}
                        onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                        className={`px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                    >
                        <option value="all">All Vehicles</option>
                        <option value="Car">Cars</option>
                        <option value="Bike">Bikes</option>
                    </select>
                </div>

                {/* Create New Owner Button */}
                <button
                    onClick={onCreateOwner}
                    className="relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Owner
                    </span>
                </button>
            </div>

            {/* Display search results count (optional) */}
            {searchResults.length > 0 && (
                <div className="mt-4 text-sm text-blue-600 dark:text-blue-400">
                    Found {searchResults.length} matching owners
                </div>
            )}
        </div>
    );
};

export default EVOwnerFilters;