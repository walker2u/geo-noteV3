import { NextResponse } from 'next/server';
import pool from '../../../../../lib/db';

export async function POST(request, { params }) {
    const { noteId } = params;
    const { userId, emoji } = await request.json();

    if (!userId || !emoji) {
        return NextResponse.json({ error: 'Missing userId or emoji' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        const existingReaction = await client.query(
            'SELECT id FROM reactions WHERE note_id = $1 AND user_id = $2 AND emoji = $3',
            [noteId, userId, emoji]
        );

        if (existingReaction.rows.length > 0) {
            await client.query('DELETE FROM reactions WHERE id = $1', [existingReaction.rows[0].id]);
        } else {
            await client.query(
                'INSERT INTO reactions (note_id, user_id, emoji) VALUES ($1, $2, $3)',
                [noteId, userId, emoji]
            );
        }

        const updatedReactionsResult = await client.query(
            `SELECT emoji, user_id FROM reactions WHERE note_id = $1`,
            [noteId]
        );

        return NextResponse.json(updatedReactionsResult.rows, { status: 200 });

    } catch (err) {
        console.error(`Error toggling reaction for note ${noteId}:`, err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
        client.release();
    }
}