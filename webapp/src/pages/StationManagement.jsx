import React, { useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import MapPicker from '../components/MapPicker';
import { ThemeContext } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import { Plus, X, MapPin } from 'lucide-react';

const StationManagement = () => {
    const { darkMode, getColor } = useContext(ThemeContext);
    const [stations, setStations] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStations = async () => {
            setLoading(true);
            try {
                const data = await api.getAllStation();
                setStations(Array.isArray(data) ? data : []);
            } catch (err) {
                setStations([]);
            }
            setLoading(false);
        };
        fetchStations();
    }, []);

    // Only closes modal after schedule step is finished
    const handleCreateStation = async () => {
        const data = await api.getAllStation();
        setStations(Array.isArray(data) ? data : []);
        setShowCreateModal(false);
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
                <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
            </div>

            <Navbar />

            <div className="relative pt-24 pb-8 px-4 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`px-3 py-1 rounded-full ${getColor('background.accent')} ${getColor('text.accent')} text-sm font-medium`}>
                            Dashboard
                        </div>
                        <span className={`w-4 h-4 ${getColor('text.tertiary')}`}>/</span>
                        <div className={`px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-medium`}>
                            Stations
                        </div>
                    </div>
                    <h1 className={`text-4xl font-bold mb-2 ${getColor('text.primary')}`}>
                        Charging <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Stations</span>
                    </h1>
                    <p className={`text-lg ${getColor('text.secondary')}`}>
                        Manage all your EV charging stations and locations
                    </p>
                </div>

                <div className={`${getColor('background.card')} backdrop-blur-sm rounded-2xl border ${getColor('border.primary')} p-6 mb-6`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search stations..."
                                className={`pl-4 pr-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full md:w-80`}
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="relative group overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                New Station
                            </span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-lg py-12 text-gray-400">Loading stations...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stations.length === 0 ? (
                            <div className="col-span-3 text-center text-lg py-12 text-gray-400">No stations found.</div>
                        ) : (
                            stations.map((station) => (
                                <div
                                    key={station.id}
                                    className={`group relative overflow-hidden rounded-2xl ${getColor('background.card')} backdrop-blur-sm border ${getColor('border.primary')} hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer`}
                                    onClick={() => setSelectedStation(station)}
                                >
                                    <div className="relative p-6">
                                        <h3 className={`font-bold text-xl mb-2 ${getColor('text.primary')} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-blue-500 to-purple-500 transition-all`}>
                                            {station.stationName}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className={`w-4 h-4 ${getColor('text.secondary')}`} />
                                            <span className={`text-sm ${getColor('text.secondary')}`}>{station.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs ${getColor('text.tertiary')}`}>Operator:</span>
                                            <span className={`text-sm font-semibold ${getColor('text.primary')}`}>{station.operatorId || station.OperatorId}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateStationModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateStation} />
            )}

            {selectedStation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedStation(null)}></div>
                    <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
                        <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>Station Details</h2>
                                <button onClick={() => setSelectedStation(null)} className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500`}>
                                <h3 className="text-2xl font-bold text-white mb-2">{selectedStation.stationName}</h3>
                                <div className="flex items-center gap-2 text-white/90">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">{selectedStation.address}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Latitude</p>
                                    <p className={`font-semibold ${getColor('text.primary')}`}>{selectedStation.latitude}</p>
                                </div>
                                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    <p className={`text-xs ${getColor('text.tertiary')} mb-1`}>Longitude</p>
                                    <p className={`font-semibold ${getColor('text.primary')}`}>{selectedStation.longitude}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Create Station Modal Component
const CreateStationModal = ({ onClose, onCreate }) => {
    const { darkMode, getColor } = useContext(ThemeContext);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        stationName: '',
        address: '',
        OperatorId: '',
        latitude: '',
        longitude: ''
    });
    const [stationId, setStationId] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [slotData, setSlotData] = useState({ acCount: '', dcCount: '', acRate: '', dcRate: '' });
    const [scheduleData, setScheduleData] = useState([]);
    const [scheduleStep, setScheduleStep] = useState({ dayOfWeek: '', openingTime: '', closingTime: '' });

    // Step 1: Station Details
    const handleMapPick = (lat, lng) => {
        setFormData({ ...formData, latitude: lat, longitude: lng });
        setShowMap(false);
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        if (!formData.stationName || !formData.address || !formData.latitude || !formData.longitude || !formData.OperatorId) return;
        // Send station details to BE
        const created = await api.addStation(formData);
        if (created && created.id) setStationId(created.id);
        setStep(2);
    };

    // Step 2: Slot Details
    const handleSlotSubmit = async (e) => {
        e.preventDefault();
        if (!stationId) return;
        await api.addStationSlot({
            stationId,
            acCount: slotData.acCount,
            dcCount: slotData.dcCount,
            acRate: slotData.acRate,
            dcRate: slotData.dcRate
        });
        setStep(3);
    };

    // Step 3: Schedule Details
    const handleScheduleAdd = (e) => {
        e.preventDefault();
        if (!stationId || !scheduleStep.dayOfWeek || !scheduleStep.openingTime || !scheduleStep.closingTime) return;
        setScheduleData([...scheduleData, {
            stationId,
            dayOfWeek: scheduleStep.dayOfWeek,
            openingTime: scheduleStep.openingTime,
            closingTime: scheduleStep.closingTime
        }]);
        setScheduleStep({ dayOfWeek: '', openingTime: '', closingTime: '' });
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        for (const sched of scheduleData) {
            await api.addStationSchedule(sched);
        }
        // Refresh station list and close modal
        await onCreate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
                <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                    <div className="flex items-center justify-between">
                        <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>Create New Station</h2>
                        <button onClick={onClose} className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {step === 1 && (
                        <form className="space-y-6" onSubmit={handleDetailsSubmit}>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Station Name</label>
                                <input
                                    type="text"
                                    value={formData.stationName}
                                    onChange={e => setFormData({ ...formData, stationName: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>OperatorId</label>
                                <input
                                    type="text"
                                    value={formData.OperatorId}
                                    onChange={e => setFormData({ ...formData, OperatorId: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Latitude</label>
                                    <input
                                        type="number"
                                        value={formData.latitude}
                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                        required
                                        step="any"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Longitude</label>
                                    <input
                                        type="number"
                                        value={formData.longitude}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                        className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                        required
                                        step="any"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 mb-2"
                                onClick={() => setShowMap(true)}
                            >
                                Pick Location on Map
                            </button>
                            <button
                                type="submit"
                                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
                            >
                                Next
                            </button>
                        </form>
                    )}
                    {step === 2 && (
                        <form className="space-y-6" onSubmit={handleSlotSubmit}>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Number of AC Chargers</label>
                                <input
                                    type="number"
                                    value={slotData.acCount}
                                    onChange={e => setSlotData({ ...slotData, acCount: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>AC Charging Rate</label>
                                <input
                                    type="number"
                                    value={slotData.acRate}
                                    onChange={e => setSlotData({ ...slotData, acRate: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Number of DC Chargers</label>
                                <input
                                    type="number"
                                    value={slotData.dcCount}
                                    onChange={e => setSlotData({ ...slotData, dcCount: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>DC Charging Rate</label>
                                <input
                                    type="number"
                                    value={slotData.dcRate}
                                    onChange={e => setSlotData({ ...slotData, dcRate: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
                            >
                                Next
                            </button>
                        </form>
                    )}
                    {step === 3 && (
                        <form className="space-y-6" onSubmit={handleScheduleSubmit}>
                            <div className="mb-4">
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Day of Week</label>
                                <select
                                    value={scheduleStep.dayOfWeek}
                                    onChange={e => setScheduleStep({ ...scheduleStep, dayOfWeek: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                >
                                    <option value="">Select Day</option>
                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Opening Time</label>
                                <input
                                    type="time"
                                    value={scheduleStep.openingTime}
                                    onChange={e => setScheduleStep({ ...scheduleStep, openingTime: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Closing Time</label>
                                <input
                                    type="time"
                                    value={scheduleStep.closingTime}
                                    onChange={e => setScheduleStep({ ...scheduleStep, closingTime: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <button
                                type="button"
                                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 mb-2"
                                onClick={handleScheduleAdd}
                            >
                                Add Schedule
                            </button>
                            <div className="mb-4">
                                {scheduleData.length > 0 && (
                                    <ul className="list-disc pl-6">
                                        {scheduleData.map((sched, idx) => (
                                            <li key={idx} className={`text-sm ${getColor('text.primary')}`}>
                                                {sched.dayOfWeek}: {sched.openingTime} - {sched.closingTime}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
                            >
                                Finish
                            </button>
                        </form>
                    )}
                </div>
                {showMap && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowMap(false)}></div>
                        <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
                            <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                                <div className="flex items-center justify-between">
                                    <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>Pick Station Location</h2>
                                    <button onClick={() => setShowMap(false)} className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}>
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col items-center">
                                <div className="w-full h-64 rounded-2xl mb-4 border border-blue-300 overflow-hidden">
                                    <MapPicker onPick={handleMapPick} />
                                </div>
                                <p className={`text-sm ${getColor('text.secondary')}`}>Click on the map to mark the station location.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StationManagement;
