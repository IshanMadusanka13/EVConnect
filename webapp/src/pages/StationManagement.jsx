import React, { useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import MapPicker from '../components/MapPicker';
import { ThemeContext } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Plus, X, MapPin, Pencil, Trash } from 'lucide-react';

const StationManagement = () => {
    const { darkMode, getColor } = useContext(ThemeContext);
    const [stations, setStations] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [stationDetails, setStationDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    // SlotTypes modal state
    const [showSlotTypesModal, setShowSlotTypesModal] = useState(false);
    const [slotTypes, setSlotTypes] = useState([]);
    const [slotTypeForm, setSlotTypeForm] = useState({ SlotName: '', Rate: '' });
    const [editingSlotType, setEditingSlotType] = useState(null);
    const [slotTypeLoading, setSlotTypeLoading] = useState(false);

    // Fetch slot types
    const fetchSlotTypes = async () => {
        setSlotTypeLoading(true);
        try {
            const data = await api.getAllSlotTypes();
            setSlotTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setSlotTypes([]);
        }
        setSlotTypeLoading(false);
    };

    // Add or update slot type
    const handleAddOrUpdateSlotType = async (e) => {
        e.preventDefault();
        try {
            if (editingSlotType) {
                await api.updateSlotType(editingSlotType.id, slotTypeForm);
            } else {
                await api.addSlotType(slotTypeForm);
            }
            setSlotTypeForm({ SlotName: '', Rate: '' });
            setEditingSlotType(null);
            fetchSlotTypes();
        } catch (err) {
            alert('Failed to save slot type');
        }
    };

    // Edit slot type
    const handleEditSlotType = (slotType) => {
        setEditingSlotType(slotType);
        setSlotTypeForm({ SlotName: slotType.slotName, Rate: slotType.rate });
    };

    // Delete slot type
    const handleDeleteSlotType = async (id) => {
        if (!window.confirm('Delete this slot type?')) return;
        try {
            await api.deleteSlotType(id);
            fetchSlotTypes();
        } catch (err) {
            alert('Failed to delete slot type');
        }
    };

    // Close modal and reset
    const handleCloseSlotTypesModal = () => {
        setShowSlotTypesModal(false);
        setSlotTypeForm({ SlotName: '', Rate: '' });
        setEditingSlotType(null);
    };

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
        fetchSlotTypes()
    }, []);

    // Only closes modal after schedule step is finished
    const handleCreateStation = async () => {
        const data = await api.getAllStation();
        setStations(Array.isArray(data) ? data : []);
        setShowCreateModal(false);
    };

    // Fetch station details when a card is clicked
    const handleCardClick = async (station) => {
        console.log('Clicked station:', station);
        setSelectedStation(station);
        setDetailsLoading(true);
        try {
            const details = await api.getStationAllDetails(station.id || station.Id);
            setStationDetails(details);
        } catch (err) {
            setStationDetails(null);
        }
        setDetailsLoading(false);
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${getColor('background.primary')}`}>
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-blue-600' : 'bg-blue-400'} animate-pulse`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20 ${darkMode ? 'bg-purple-600' : 'bg-purple-400'} animate-pulse`} style={{ animationDelay: '1s' }}></div>
                <div className={`absolute top-1/2 left-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 ${darkMode ? 'bg-pink-600' : 'bg-pink-400'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
            </div>

            <Navbar />
            <Sidebar activePath="/station" />

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
                            <button
                                onClick={() => setShowSlotTypesModal(true)}
                                className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50 hover:scale-105 flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                SlotTypes
                            </button>
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
                                    onClick={() => handleCardClick(station)}
                                >
                                    <div className="relative p-6">
                                        <h3 className={`font-bold text-xl mb-2 ${getColor('text.primary')} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-blue-500 to-purple-500 transition-all`}>
                                            {station.stationName}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className={`w-4 h-4 ${getColor('text.secondary')}`} />
                                            <span className={`text-sm ${getColor('text.secondary')}`}>{station.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs ${getColor('text.tertiary')}`}>Operator:</span>
                                            <span className={`text-sm font-semibold ${getColor('text.primary')}`}>{station.operatorId || station.OperatorId}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${station.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{station.isActive ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {showCreateModal ? (
                <CreateStationModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateStation} />
            ) : null}

            {/* SlotTypes Modal */}
            {showSlotTypesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleCloseSlotTypesModal}></div>
                    <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
                        <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>Slot Types</h2>
                                <button onClick={handleCloseSlotTypesModal} className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Add/Edit Form */}
                            <form className="flex items-center gap-4 mb-6" onSubmit={handleAddOrUpdateSlotType}>
                                <input
                                    type="text"
                                    placeholder="Slot"
                                    value={slotTypeForm.SlotName}
                                    onChange={e => setSlotTypeForm(f => ({ ...f, SlotName: e.target.value }))}
                                    className={`px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all w-40`}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Rate"
                                    value={slotTypeForm.Rate}
                                    onChange={e => setSlotTypeForm(f => ({ ...f, Rate: e.target.value }))}
                                    className={`px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all w-32`}
                                    required
                                    step="any"
                                />
                                <button type="submit" className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    {editingSlotType ? 'Update' : 'Add'}
                                </button>
                                {editingSlotType && (
                                    <button type="button" className="px-3 py-2 rounded-xl bg-gray-300 text-gray-700 font-semibold" onClick={() => { setEditingSlotType(null); setSlotTypeForm({ SlotName: '', Rate: '' }); }}>Cancel</button>
                                )}
                            </form>
                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full border rounded-xl">
                                    <thead>
                                        <tr className={`bg-purple-100 dark:bg-purple-900`}>
                                            <th className="px-4 py-2 text-left">Slot</th>
                                            <th className="px-4 py-2 text-left">Rate</th>
                                            <th className="px-4 py-2 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {slotTypeLoading ? (
                                            <tr><td colSpan={3} className="text-center py-6 text-gray-400">Loading...</td></tr>
                                        ) : slotTypes.length === 0 ? (
                                            <tr><td colSpan={3} className="text-center py-6 text-gray-400">No slot types found.</td></tr>
                                        ) : (
                                            slotTypes.map(st => (
                                                <tr key={st.Id || st.id} className="border-b">
                                                    <td className="px-4 py-2">{st.slotName}</td>
                                                    <td className="px-4 py-2">{st.rate}</td>
                                                    <td className="px-4 py-2 flex gap-2">
                                                        <button className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600" title="Edit" onClick={() => handleEditSlotType(st)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 rounded bg-red-500 text-white hover:bg-red-600" title="Delete" onClick={() => handleDeleteSlotType(st.Id || st.id)}>
                                                            <Trash className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedStation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => { setSelectedStation(null); setStationDetails(null); }}></div>
                    <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
                        <div className={`sticky top-0 ${getColor('background.modal')} z-10 p-6 border-b ${getColor('border.primary')}`}>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-2xl font-bold ${getColor('text.primary')}`}>Station Details</h2>
                                <button onClick={() => { setSelectedStation(null); setStationDetails(null); }} className={`p-2 rounded-xl ${getColor('hover.primary')} transition-colors`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {detailsLoading ? (
                                <div className="text-center text-lg py-12 text-gray-400">Loading details...</div>
                            ) : stationDetails ? (
                                <>
                                    {/* Header with name, address and map only */}
                                    <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex flex-col md:flex-row gap-8 items-center`}>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-white mb-2">{stationDetails.station?.stationName}</h3>
                                            <div className="flex items-center gap-2 text-white/90 mb-2">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-sm">{stationDetails.station?.address}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex justify-center items-center">
                                            {stationDetails.station?.latitude && stationDetails.station?.longitude ? (
                                                <div className="w-64 h-48 rounded-2xl overflow-hidden border border-white/30 bg-white">
                                                    <MapPicker
                                                        lat={stationDetails.station.latitude}
                                                        lng={stationDetails.station.longitude}
                                                        pinOnly={true}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-white/70">No location data</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Editable Operator and Active Status */}
                                    <EditableStationDetails
                                        station={stationDetails.station}
                                        getColor={getColor}
                                        darkMode={darkMode}
                                        onUpdate={async (updatedFields) => {
                                            try {
                                                // Send complete station object with updates
                                                const fullUpdate = {
                                                    id: stationDetails.station.id,
                                                    stationName: stationDetails.station.stationName,
                                                    address: stationDetails.station.address,
                                                    latitude: stationDetails.station.latitude,
                                                    longitude: stationDetails.station.longitude,
                                                    operatorId: updatedFields.operatorId !== undefined ? updatedFields.operatorId : stationDetails.station.operatorId,
                                                    isActive: updatedFields.isActive !== undefined ? updatedFields.isActive : stationDetails.station.isActive
                                                };
                                                await api.updateStationDetails(stationDetails.station.id, fullUpdate);
                                                setStationDetails(prev => {
                                                    if (!prev) return prev;
                                                    return {
                                                        ...prev,
                                                        station: { ...prev.station, ...updatedFields }
                                                    };
                                                });
                                            } catch (err) {
                                                alert('Failed to update station details');
                                                console.error(err);
                                            }
                                        }}
                                        onToggle={async (updatedFields) => {
                                            try {

                                                await api.updateStationStatus(stationDetails.station.id, updatedFields);
                                                setStationDetails(prev => {
                                                    if (!prev) return prev;
                                                    return {
                                                        ...prev,
                                                        station: { ...prev.station, ...updatedFields }
                                                    };
                                                });
                                            } catch (err) {
                                                alert('Failed to update station details');
                                                console.error(err);
                                            }
                                        }}
                                    />

                                    <div className="mb-6">
                                        <h4 className={`text-lg font-semibold mb-2 ${getColor('text.primary')}`}>Slots</h4>
                                        {stationDetails.slots && stationDetails.slots.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {stationDetails.slots.map((slot, idx) => (
                                                    <SlotCard
                                                        key={slot.slotId}
                                                        slot={slot}
                                                        darkMode={darkMode}
                                                        getColor={getColor}
                                                        onToggle={async (newStatus) => {
                                                            try {
                                                                await api.updateSlotOperationalStatus(slot.id, newStatus);
                                                                setStationDetails(prev => {
                                                                    if (!prev) return prev;
                                                                    const updatedSlots = prev.slots.map((s, i) => i === idx ? { ...s, isOperational: newStatus } : s);
                                                                    return { ...prev, slots: updatedSlots };
                                                                });
                                                            } catch (err) {
                                                                // Optionally show error
                                                            }
                                                        }}
                                                    />
                                                ))}
                                                <AddSlotCard
                                                    slotTypes={slotTypes}
                                                    stationId={stationDetails.station?.id}
                                                    darkMode={darkMode}
                                                    getColor={getColor}
                                                    onSlotAdded={newSlot => {
                                                        setStationDetails(prev => prev ? { ...prev, slots: [...prev.slots, newSlot] } : prev);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-gray-400 mb-4">No slots found.</div>
                                                <AddSlotCard
                                                    slotTypes={slotTypes}
                                                    stationId={stationDetails.station?.id}
                                                    darkMode={darkMode}
                                                    getColor={getColor}
                                                    onSlotAdded={newSlot => {
                                                        setStationDetails(prev => prev ? { ...prev, slots: [newSlot] } : prev);
                                                    }}
                                                />
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-semibold mb-2 ${getColor('text.primary')}`}>Schedules</h4>
                                        {stationDetails.schedules && stationDetails.schedules.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {stationDetails.schedules.map((schedule, idx) => (
                                                    <ScheduleCard
                                                        key={schedule.id}
                                                        schedule={schedule}
                                                        darkMode={darkMode}
                                                        getColor={getColor}
                                                        onUpdate={async (updatedSchedule) => {
                                                            try {
                                                                await api.updateSchedule(schedule.id, updatedSchedule);
                                                                setStationDetails(prev => {
                                                                    if (!prev) return prev;
                                                                    const updatedSchedules = prev.schedules.map((s, i) => i === idx ? { ...s, ...updatedSchedule } : s);
                                                                    return { ...prev, schedules: updatedSchedules };
                                                                });
                                                            } catch (err) {
                                                                alert('Failed to update schedule');
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400">No schedules found.</div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-lg py-12 text-gray-400">No details found.</div>
                            )}
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
    const [stationForm, setStationForm] = useState({
        stationName: '',
        address: '',
        operatorId: '',
        latitude: '',
        longitude: '',
        schedules: []
    });
    const [showMap, setShowMap] = useState(false);
    const [slotTypes, setSlotTypes] = useState([]);
    // Dynamic slot types selection
    const [selectedSlots, setSelectedSlots] = useState([]); // [{slotTypeId, slotName, rate, count}]
    // Seven days schedule state
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [scheduleStep, setScheduleStep] = useState(
        daysOfWeek.map(day => ({
            dayOfWeek: day,
            isOpen: false,
            openingTime: '',
            closingTime: ''
        }))
    );

    useEffect(() => {
        fetchSlotTypes();
    }, [step]);

    // Fetch slot types
    const fetchSlotTypes = async () => {
        try {
            const data = await api.getAllSlotTypes();
            setSlotTypes(Array.isArray(data) ? data : []);
        } catch (err) {
            setSlotTypes([]);
        }
    };

    // Step 1: Station Details
    const handleMapPick = (lat, lng) => {
        setStationForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setShowMap(false);
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setStep(2);
    };

    // Step 2: Slot Details
    const handleSlotSubmit = async (e) => {
        e.preventDefault();
        setStep(3);
    };

    // Step 3: Schedule Details
    const handleDayToggle = (idx, checked) => {
        setScheduleStep(prev => prev.map((item, i) => i === idx ? { ...item, isOpen: checked } : item));
    };

    const handleTimeChange = (idx, field, value) => {
        setScheduleStep(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        // Prepare payload matching CreateStationRequest DTO
        const payload = {
            stationName: stationForm.stationName,
            address: stationForm.address,
            latitude: parseFloat(stationForm.latitude),
            longitude: parseFloat(stationForm.longitude),
            operatorId: stationForm.operatorId,
            slots: selectedSlots.filter(s => parseInt(s.count) > 0).map(s => ({
                type: {
                    id: s.slotTypeId,
                    slotName: s.slotName
                },
                count: parseInt(s.count)
            })),
            schedules: scheduleStep.map(s => ({
                dayOfWeek: s.dayOfWeek,
                isOpen: s.isOpen,
                openingTime: s.openingTime,
                closingTime: s.closingTime
            }))
        };
        try {
            console.log('Submitting payload:', payload);
            const res = await api.addStation(payload);
            if (res && res.id) {
                onCreate();
                onClose();
            } else {
                alert('Failed to create station');
            }
        } catch (err) {
            alert('Error creating station');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
            <div className={`relative ${getColor('background.modal')} rounded-3xl shadow-2xl ${step === 3 ? 'max-w-4xl' : 'max-w-lg'} w-full max-h-[90vh] overflow-y-auto animate-scaleIn border ${getColor('border.primary')}`}>
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
                                    value={stationForm.stationName}
                                    onChange={e => setStationForm(prev => ({ ...prev, stationName: e.target.value }))}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Address</label>
                                <input
                                    type="text"
                                    value={stationForm.address}
                                    onChange={e => setStationForm(prev => ({ ...prev, address: e.target.value }))}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div>
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>OperatorId</label>
                                <input
                                    type="text"
                                    value={stationForm.operatorId}
                                    onChange={e => setStationForm(prev => ({ ...prev, operatorId: e.target.value }))}
                                    className={`w-full px-4 py-3 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Latitude</label>
                                    <input
                                        type="number"
                                        value={stationForm.latitude}
                                        onChange={e => setStationForm(prev => ({ ...prev, latitude: e.target.value }))}
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
                                        value={stationForm.longitude}
                                        onChange={e => setStationForm(prev => ({ ...prev, longitude: e.target.value }))}
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
                                <label className={`block mb-1 font-medium ${getColor('text.primary')}`}>Add Slots</label>
                                <div className="space-y-2">
                                    {Array.isArray(slotTypes) && slotTypes.length > 0 ? (
                                        slotTypes.map(st => {
                                            const selected = selectedSlots.find(s => s.slotTypeId === st.id);
                                            return (
                                                <div key={st.id} className="flex items-center gap-4">
                                                    <span className={`font-semibold ${getColor('text.primary')} w-32`}>{st.slotName} Slots</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={selected ? selected.count : ''}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            setSelectedSlots(prev => {
                                                                const exists = prev.find(s => s.slotTypeId === st.id);
                                                                if (exists) {
                                                                    return prev.map(s => s.slotTypeId === st.id ? { ...s, count: val } : s);
                                                                } else {
                                                                    return [...prev, { slotTypeId: st.id, slotName: st.slotName, rate: st.rate, count: val }];
                                                                }
                                                            });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} w-54`}
                                                        placeholder="Count"
                                                    />
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-gray-400">No slot types available. Add slot types first.</div>
                                    )}
                                </div>
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
                            <div className={`p-4 rounded-xl ${getColor('background.input')} border ${getColor('border.primary')} mb-4`}>
                                <h3 className={`text-lg font-semibold mb-2 ${getColor('text.primary')}`}>Operating Hours</h3>
                                <p className={`text-sm ${getColor('text.secondary')}`}>Set your station's operating hours for each day of the week</p>
                            </div>

                            <div className="space-y-3">
                                {scheduleStep.map((sched, idx) => (
                                    <div
                                        key={sched.dayOfWeek}
                                        className={`p-4 rounded-xl border ${getColor('border.primary')} transition-all ${sched.isOpen
                                            ? `${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-50'} border-emerald-500/30`
                                            : `${getColor('background.input')} opacity-75`
                                            }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            {/* Day name and toggle */}
                                            <div className="flex items-center gap-3 min-w-[180px]">
                                                <span className={`font-semibold text-base ${getColor('text.primary')} w-24`}>
                                                    {sched.dayOfWeek}
                                                </span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={sched.isOpen}
                                                        onChange={e => handleDayToggle(idx, e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full dark:bg-gray-700 peer-checked:bg-emerald-500 transition-all relative shadow-inner`}>
                                                        <div
                                                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-md ${sched.isOpen ? 'translate-x-5' : ''
                                                                }`}
                                                            style={{ transform: sched.isOpen ? 'translateX(20px)' : 'none' }}
                                                        ></div>
                                                    </div>
                                                </label>
                                                <span className={`text-sm font-semibold ${sched.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {sched.isOpen ? 'Open' : 'Closed'}
                                                </span>
                                            </div>

                                            {/* Time inputs */}
                                            {sched.isOpen && (
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="flex-1">
                                                        <label className={`text-xs font-medium ${getColor('text.secondary')} block mb-1`}>
                                                            Opens
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={sched.openingTime}
                                                            onChange={e => handleTimeChange(idx, 'openingTime', e.target.value)}
                                                            className={`w-full px-3 py-2 rounded-lg border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                                            required={sched.isOpen}
                                                        />
                                                    </div>
                                                    <span className={`text-lg ${getColor('text.tertiary')} mt-5`}>→</span>
                                                    <div className="flex-1">
                                                        <label className={`text-xs font-medium ${getColor('text.secondary')} block mb-1`}>
                                                            Closes
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={sched.closingTime}
                                                            onChange={e => handleTimeChange(idx, 'closingTime', e.target.value)}
                                                            className={`w-full px-3 py-2 rounded-lg border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')} focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                                                            required={sched.isOpen}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-105"
                                >
                                    Create Station
                                </button>
                            </div>
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


// ScheduleCard component for inline editing
function ScheduleCard({ schedule, darkMode, getColor, onUpdate }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        dayOfWeek: schedule.dayOfWeek,
        isOpen: schedule.isOpen ?? schedule.IsOpen ?? false,
        openingTime: schedule.openingTime,
        closingTime: schedule.closingTime
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onUpdate({
            id: schedule.id,
            stationId: schedule.stationId,
            dayOfWeek: form.dayOfWeek,
            isOpen: form.isOpen,
            openingTime: form.openingTime,
            closingTime: form.closingTime
        });
        setSaving(false);
        setEditing(false);
    };

    return (
        <div className={`p-4 rounded-xl border ${getColor('border.primary')} ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            {editing ? (
                <form className="space-y-2" onSubmit={handleSave}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`font-semibold ${getColor('text.primary')}`}>{form.dayOfWeek}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isOpen}
                                onChange={e => setForm(f => ({ ...f, isOpen: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full dark:bg-gray-700 peer-checked:bg-green-500 transition-all relative`}>
                                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.isOpen ? 'translate-x-5' : ''}`}
                                    style={{ transform: form.isOpen ? 'translateX(20px)' : 'none' }}></div>
                            </div>
                        </label>
                        <span className={`text-sm font-semibold ${form.isOpen ? 'text-green-600' : 'text-red-600'}`}>{form.isOpen ? 'Open' : 'Closed'}</span>
                    </div>
                    <div>
                        <input
                            type="time"
                            value={form.openingTime}
                            onChange={e => setForm(f => ({ ...f, openingTime: e.target.value }))}
                            className={`w-full px-2 py-1 rounded border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`}
                            disabled={!form.isOpen}
                        />
                    </div>
                    <div>
                        <input
                            type="time"
                            value={form.closingTime}
                            onChange={e => setForm(f => ({ ...f, closingTime: e.target.value }))}
                            className={`w-full px-2 py-1 rounded border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`}
                            disabled={!form.isOpen}
                        />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button type="submit" disabled={saving} className="px-3 py-1 rounded bg-emerald-500 text-white font-semibold">{saving ? 'Saving...' : 'Save'}</button>
                        <button type="button" className="px-3 py-1 rounded bg-gray-300 text-gray-700 font-semibold" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${getColor('text.primary')}`}>{form.dayOfWeek}</span>
                        <span className={`text-sm font-semibold ${form.isOpen ? 'text-green-600' : 'text-red-600'}`}>{form.isOpen ? 'Open' : 'Closed'}</span>
                    </div>
                    {form.isOpen ? (
                        <div className={`text-sm ${getColor('text.secondary')}`}>Open: {form.openingTime} - {form.closingTime}</div>
                    ) : (
                        <div className={`text-sm ${getColor('text.secondary')}`}>Closed</div>
                    )}
                    <button className="mt-2 px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold" onClick={() => setEditing(true)}>Edit</button>
                </>
            )}
        </div>
    );
}

// SlotCard component for slot display and toggle
function SlotCard({ slot, darkMode, getColor, onToggle }) {
    return (
        <div className={`p-4 rounded-xl border ${getColor('border.primary')} ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${getColor('text.primary')}`}>{slot.slotNumber}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${slot.chargerType === 'AC' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{slot.chargerType}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className={`text-sm ${getColor('text.secondary')}`}>Operational:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={slot.isOperational}
                        onChange={e => onToggle(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full dark:bg-gray-700 peer-checked:bg-green-500 transition-all relative">
                        <div
                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${slot.isOperational ? 'translate-x-5' : ''}`}
                            style={{ transform: slot.isOperational ? 'translateX(20px)' : 'none' }}
                        ></div>
                    </div>
                </label>
            </div>
        </div>
    );
}

// Place this function outside the main component

function EditableStationDetails({ station, getColor, darkMode, onUpdate, onToggle }) {
    const [editing, setEditing] = React.useState(false);
    const [form, setForm] = React.useState({
        operatorId: station?.operatorId || '',
        isActive: station?.isActive ?? true
    });
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        setForm({
            operatorId: station?.operatorId || '',
            isActive: station?.isActive ?? true
        });
    }, [station]);

    const handleOperatorSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onUpdate({ operatorId: form.operatorId });
            setEditing(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleActiveToggle = async (checked) => {
        setSaving(true);
        try {
            // Use dedicated endpoint for active status
            await api.updateStationStatus(station.id, checked );
            setForm(f => ({ ...f, isActive: checked }));
        } catch (err) {
            alert('Active Bookings Available. Cant Deactivate');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`mb-6 p-4 rounded-2xl border ${getColor('border.primary')} ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Operator */}
                <div>
                    {editing ? (
                        <form onSubmit={handleOperatorSave} className="flex flex-col gap-2">
                            <label className={`text-sm font-semibold ${getColor('text.primary')}`}>Operator ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={form.operatorId}
                                    onChange={e => setForm(f => ({ ...f, operatorId: e.target.value }))}
                                    className={`flex-1 px-3 py-2 rounded border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`}
                                    required
                                />
                                <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-emerald-500 text-white font-semibold text-sm">
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" className="px-3 py-2 rounded bg-gray-300 text-gray-700 font-semibold text-sm" onClick={() => setEditing(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <label className={`text-sm font-semibold ${getColor('text.primary')}`}>Operator ID</label>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${getColor('text.primary')}`}>{form.operatorId}</span>
                                <button className="px-3 py-1 rounded bg-blue-500 text-white text-xs font-semibold" onClick={() => setEditing(true)}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Status */}
                <div className="flex flex-col gap-2">
                    <label className={`text-sm font-semibold ${getColor('text.primary')}`}>Station Status</label>
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={e => handleActiveToggle(e.target.checked)}
                                disabled={saving}
                                className="sr-only peer"
                            />
                            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full dark:bg-gray-700 peer-checked:bg-green-500 transition-all relative`}>
                                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${form.isActive ? 'translate-x-5' : ''}`}
                                    style={{ transform: form.isActive ? 'translateX(20px)' : 'none' }}></div>
                            </div>
                        </label>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${form.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {form.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const AddSlotCard = ({ slotTypes, stationId, darkMode, getColor, onSlotAdded }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ slotTypeId: '', slotNumber: '', isOperational: true });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const slotType = slotTypes.find(st => st.id === form.slotTypeId || st.Id === form.slotTypeId);
            const payload = {
                stationId,
                chargerType: slotType.slotName,
            };
            console.log(payload)
            const res = await api.addStationSlot(payload);
            if (res && res.id) {
                onSlotAdded(res);
                setShowForm(false);
                setForm({ slotTypeId: '', slotNumber: '', isOperational: true });
            } else {
                alert('Failed to add slot');
            }
        } catch (err) {
            alert('Error adding slot');
        }
        setSaving(false);
    };

    if (!showForm) {
        return (
            <div
                className={`p-4 rounded-xl border-2 border-dashed ${getColor('border.primary')} flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-all ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} min-h-[120px]`}
                onClick={() => setShowForm(true)}
            >
                <Plus className="w-8 h-8 mb-2 text-blue-500" />
                <span className={`font-semibold ${getColor('text.primary')}`}>Add Slot</span>
            </div>
        );
    }

    return (
        <form className={`p-4 rounded-xl border ${getColor('border.primary')} ${darkMode ? 'bg-slate-800' : 'bg-slate-50'} flex flex-col gap-2`} onSubmit={handleSubmit}>
            <div>
                <label className={`block mb-1 text-xs font-medium ${getColor('text.primary')}`}>Type</label>
                <select
                    value={form.slotTypeId}
                    onChange={e => setForm(f => ({ ...f, slotTypeId: e.target.value }))}
                    className={`w-full px-2 py-1.5 text-sm rounded border ${getColor('border.input')} ${getColor('background.input')} ${getColor('text.primary')}`}
                    required
                >
                    <option value="">Select</option>
                    {slotTypes.map(st => (
                        <option key={st.id || st.Id} value={st.id || st.Id}>{st.slotName}</option>
                    ))}
                </select>
            </div>
            <div className="flex gap-2 mt-2">
                <button type="submit" disabled={saving} className="flex-1 px-3 py-1.5 text-xs rounded bg-emerald-500 text-white font-semibold">{saving ? 'Saving...' : 'Add'}</button>
                <button type="button" className="flex-1 px-3 py-1.5 text-xs rounded bg-gray-300 text-gray-700 font-semibold" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
        </form>
    );
};


export default StationManagement;
