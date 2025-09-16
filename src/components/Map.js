"use client";

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FaLocationCrosshairs } from "react-icons/fa6";
import { v4 as uuidv4 } from 'uuid';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';

// --- Style Constants ---
const HYBRID_STYLE = `https://api.maptiler.com/maps/hybrid/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;
const STREETS_STYLE = `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`;

function AddNoteForm({ onSubmit, onImageAdd }) {
    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl w-72 border border-gray-600">
            <h3 className="text-lg font-semibold mb-3 text-center">Add a New Note</h3>
            <form onSubmit={onSubmit}>
                <textarea
                    name="text"
                    placeholder="What's on your mind?"
                    required
                    className="w-full h-24 p-2 bg-gray-700 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-3"
                />
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={onImageAdd}
                        title="Add Image (coming soon)"
                        className="p-2 text-gray-400 hover:bg-gray-600 hover:text-blue-600 rounded-full transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Add Note
                    </button>
                </div>
            </form>
        </div>
    );
}

function NotePopup({ note, onClose, onReaction }) {
    const [showPicker, setShowPicker] = useState(false);

    const onEmojiClick = (emojiData) => {
        onReaction(emojiData.emoji);
        setShowPicker(false);
    };

    return (
        <div className="bg-gray-800 text-white p-2 rounded-lg shadow-xl w-64 border border-gray-600 relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">
                <IoIosCloseCircleOutline />
            </button>
            <p className="text-sm font-bold text-cyan-400 mb-1">{note.user_name || 'Anonymous'}</p>

            <p className="text-gray-200 mb-2">{note.text}</p>
            <p className="text-xs text-gray-500">Posted on {new Date(note.created_at).toLocaleDateString()}</p>

            {/* --- Reactions UI --- */}
            <div className="mt-2 border-t border-gray-700 pt-2">
                <ReactionsDisplay
                    reactions={note.reactions || []}
                    onReactionClick={onReaction}
                    userId={getUserProfile().id}
                />
                <button
                    onClick={() => setShowPicker(!showPicker)}
                    className="mt-2 text-gray-400 hover:text-white"
                    title="Add reaction"
                >
                    <span className="text-2xl"><MdOutlineEmojiEmotions /></span>
                </button>
            </div>
            {showPicker && (
                <div className="absolute z-20 bottom-0 left-full ml-2">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                </div>
            )}
        </div>
    );
}

const generateRandomName = () => {
    const adjectives = ["Brave", "Clever", "Witty", "Curious", "Silent", "Lone", "Swift", "Wise"];
    const animals = ["Badger", "Wombat", "Eagle", "Fox", "Wolf", "Jaguar", "Panda", "Owl"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    return `${adj} ${animal}`;
};

const getUserProfile = () => {
    const profileString = localStorage.getItem('geoNotesUserProfile');
    if (profileString) {
        return JSON.parse(profileString);
    }
    const newProfile = {
        id: uuidv4(),
        name: generateRandomName()
    };
    localStorage.setItem('geoNotesUserProfile', JSON.stringify(newProfile));
    return newProfile;
};

const ReactionsDisplay = ({ reactions, onReactionClick, userId }) => {
    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
        acc[reaction.emoji] = acc[reaction.emoji] || { count: 0, users: [] };
        acc[reaction.emoji].count++;
        acc[reaction.emoji].users.push(reaction.user_id);
        return acc;
    }, {});

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(groupedReactions).map(([emoji, data]) => {
                const userHasReacted = data.users.includes(userId);
                return (
                    <button
                        key={emoji}
                        onClick={() => onReactionClick(emoji)}
                        className={`px-2 py-1 rounded-full text-sm transition-colors ${userHasReacted ? 'bg-blue-500 border-blue-400' : 'bg-gray-600 border-gray-500'
                            } border`}
                        title={`Reacted by ${data.count} users`}
                    >
                        {emoji} {data.count}
                    </button>
                );
            })}
        </div>
    );
};

// --- Main Map Component ---
export default function MapComponent() {
    const mapRef = useRef(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState(null);
    const [currentNote, setCurrentNote] = useState(null);
    const [viewState, setViewState] = useState({ longitude: -100, latitude: 40, zoom: 2 });
    const [mapStyle, setMapStyle] = useState(HYBRID_STYLE);
    const [userName, setUserName] = useState("");

    const goToUserLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (mapRef.current) {
                    mapRef.current.flyTo({
                        center: [position.coords.longitude, position.coords.latitude],
                        zoom: 13,
                        duration: 2500,
                        essential: true
                    });
                }
            },
            () => {
                alert("Unable to retrieve your location. Please enable location services.");
            }
        );
    };

    useEffect(() => {
        const userProfile = getUserProfile();
        setUserName(userProfile.name);

        const fetchNotes = async () => {
            const res = await fetch('/api/notes');
            const data = await res.json();
            setNotes(data);
        };
        fetchNotes();

        goToUserLocation();
    }, []);

    const handleNameSave = () => {
        const profile = getUserProfile();
        profile.name = userName;
        localStorage.setItem('geoNotesUserProfile', JSON.stringify(profile));
    };

    const handleMapClick = (e) => {
        if (e.originalEvent.target.closest('.maplibregl-marker')) return;
        const { lng, lat } = e.lngLat;
        setNewNote({ lat, lng });
        setCurrentNote(null);
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        const userProfile = getUserProfile();

        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newNote,
                text,
                userId: userProfile.id,
                userName: userProfile.name
            }),
        });

        const data = await res.json();
        setNotes([...notes, data]);
        setNewNote(null);
    };

    const toggleMapStyle = () => {
        setMapStyle(currentStyle => currentStyle === HYBRID_STYLE ? STREETS_STYLE : HYBRID_STYLE);
    };

    const handleReaction = async (noteId, emoji) => {
        const userProfile = getUserProfile();

        const response = await fetch(`/api/notes/${noteId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userProfile.id, emoji }),
        });

        if (response.ok) {
            const updatedReactions = await response.json();

            // Update the state of the specific note immutably
            setNotes(prevNotes =>
                prevNotes.map(note =>
                    note.id === noteId ? { ...note, reactions: updatedReactions } : note
                )
            );
            // Also update currentNote if it's the one being reacted to
            setCurrentNote(prevNote =>
                prevNote && prevNote.id === noteId ? { ...prevNote, reactions: updatedReactions } : prevNote
            );
        } else {
            console.error("Failed to update reaction");
        }
    };

    return (
        <>
            <div className="absolute top-4 left-4 z-10">
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onBlur={handleNameSave} // Save when the user clicks away
                    className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-full shadow-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                    placeholder="Your anonymous name"
                />
            </div>
            <div className="absolute top-4 right-4 z-10 flex flex-row gap-2">
                <button
                    onClick={toggleMapStyle}
                    className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                >
                    {mapStyle === HYBRID_STYLE ? 'Streets' : 'Satellite'}
                </button>

                <button
                    onClick={goToUserLocation}
                    className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                >
                    <FaLocationCrosshairs />
                </button>
            </div>
            <div className="h-screen w-screen">
                <Map
                    ref={mapRef}
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    mapStyle={mapStyle}
                    onClick={handleMapClick}
                    projection={viewState.zoom < 4 ? 'globe' : 'mercator'}
                >
                    {notes.map(note => (
                        <Marker key={note.id} longitude={JSON.parse(note.geom).coordinates[0]} latitude={JSON.parse(note.geom).coordinates[1]} onClick={(e) => { e.originalEvent.stopPropagation(); setCurrentNote(note); setNewNote(null); }} />
                    ))}
                    {newNote && (
                        <Popup longitude={newNote.lng} latitude={newNote.lat} onClose={() => setNewNote(null)} closeButton={false} className="modern-popup" anchor="left">
                            <AddNoteForm onSubmit={handleAddNote} onImageAdd={() => { alert("Coming Soon!") }} />
                        </Popup>
                    )}
                    {currentNote && (
                        <Popup
                            longitude={JSON.parse(currentNote.geom).coordinates[0]}
                            latitude={JSON.parse(currentNote.geom).coordinates[1]}
                            onClose={() => setCurrentNote(null)}
                            closeButton={false}
                            className="modern-popup" anchor="left"
                        >
                            <NotePopup
                                note={currentNote}
                                onClose={() => setCurrentNote(null)}
                                onReaction={(emoji) => handleReaction(currentNote.id, emoji)}
                            />
                        </Popup>
                    )}
                </Map>
            </div>
        </>
    );
}