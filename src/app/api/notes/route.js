import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
    try {
        const query = `
            SELECT
                n.id,
                n.text,
                ST_AsGeoJSON(n.geom) AS geom,
                n.created_at,
                n.user_name,
                COALESCE(
                    (SELECT jsonb_agg(r)
                     FROM (
                        SELECT emoji, user_id
                        FROM reactions
                        WHERE note_id = n.id
                     ) AS r
                    ), '[]'::jsonb
                ) AS reactions
            FROM
                notes n
            WHERE
                n.visibility = 0
            ORDER BY
                n.created_at DESC;
        `;

        const result = await pool.query(query);
        return NextResponse.json(result.rows, { status: 200 });
    } catch (err) {
        console.error('GET /api/notes error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { text, lat, lng, userId, userName } = await request.json();

        if (
            typeof text !== 'string' ||
            typeof lat !== 'number' ||
            typeof lng !== 'number'
        ) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const insertResult = await pool.query(
            `INSERT INTO notes (text, geom,user_id,user_name)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326),$4,$5)
       RETURNING id, text, ST_AsGeoJSON(geom) AS geom, created_at,user_name`,
            [text, lng, lat, userId, userName]  // Note: ST_MakePoint(longitude, latitude)
        );

        const newNote = insertResult.rows[0];
        return NextResponse.json(newNote, { status: 201 });
    } catch (err) {
        console.error('POST /api/notes error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
