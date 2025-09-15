import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
    try {
        const result = await pool.query(
            'SELECT id, text, ST_AsGeoJSON(geom) AS geom, created_at FROM notes WHERE visibility = 0'
        );
        return NextResponse.json(result.rows, { status: 200 });
    } catch (err) {
        console.error('GET /api/notes error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { text, lat, lng } = await request.json();

        if (
            typeof text !== 'string' ||
            typeof lat !== 'number' ||
            typeof lng !== 'number'
        ) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const insertResult = await pool.query(
            `INSERT INTO notes (text, geom)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))
       RETURNING id, text, ST_AsGeoJSON(geom) AS geom, created_at`,
            [text, lng, lat]  // Note: ST_MakePoint(longitude, latitude)
        );

        const newNote = insertResult.rows[0];
        return NextResponse.json(newNote, { status: 201 });
    } catch (err) {
        console.error('POST /api/notes error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
