"use client";

import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

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

function NotePopup({ note, onClose }) {
    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl w-64 border border-gray-600 relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <p className="text-gray-200 mb-2">{note.text}</p>
            <p className="text-xs text-gray-500">Posted on {new Date(note.created_at).toLocaleDateString()}</p>
        </div>
    );
}

// --- Main Map Component ---
export default function MapComponent() {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState(null);
    const [currentNote, setCurrentNote] = useState(null);
    const [viewState, setViewState] = useState({ longitude: -100, latitude: 40, zoom: 2 });
    const [mapStyle, setMapStyle] = useState(HYBRID_STYLE);

    useEffect(() => {
        const fetchNotes = async () => {
            const res = await fetch('/api/notes');
            const data = await res.json();
            setNotes(data);
        };
        fetchNotes();
    }, []);

    const handleMapClick = (e) => {
        if (e.originalEvent.target.closest('.maplibregl-marker')) return;
        const { lng, lat } = e.lngLat;
        setNewNote({ lat, lng });
        setCurrentNote(null);
    };

    const handleAddNote = async (e) => {
        e.preventDefault();
        const text = e.target.text.value;
        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newNote, text }),
        });
        const data = await res.json();
        setNotes([...notes, data]);
        setNewNote(null);
    };

    const toggleMapStyle = () => {
        setMapStyle(currentStyle => currentStyle === HYBRID_STYLE ? STREETS_STYLE : HYBRID_STYLE);
    };

    return (
        <>
            <button onClick={toggleMapStyle} className="absolute top-4 right-4 z-10 bg-gray-800 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
                {mapStyle === HYBRID_STYLE ? 'Streets' : 'Satellite'}
            </button>
            <div className="h-screen w-screen">
                <Map
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
                        <Popup longitude={JSON.parse(currentNote.geom).coordinates[0]} latitude={JSON.parse(currentNote.geom).coordinates[1]} onClose={() => setCurrentNote(null)} closeButton={false} className="modern-popup" anchor="left">
                            <NotePopup note={currentNote} onClose={() => setCurrentNote(null)} />
                        </Popup>
                    )}
                </Map>
            </div>
        </>
    );
}