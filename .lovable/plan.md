# Plan - Fix Missing Dashboard Messages

The user reports that messages received via webmail are not showing up in the dashboard "Messages" page. Currently, the dashboard only loads from local storage or falls back to mock data if the API fails. I will ensure live data from the backend is correctly fetched, merged, and displayed.

## User Review Required

> [!IMPORTANT]
> This fix assumes the backend is correctly receiving and storing messages. If the webmail messages aren't reaching the database table `messages`, this frontend fix won't show them.

- The "Messages" page will prioritize live data from the backend.
- SMTP health checks will remain visible to help diagnose why replies might fail.
- I will verify the connection between the frontend and the `GET /messages` endpoint.

## Proposed Changes

### Dashboard & API
- **useMessages Hook**: Ensure it correctly fetches from `/messages` and handles the normalization of dates/previews for the UI.
- **Messages Page**: 
  - Update `list` state when API data arrives.
  - Fix the local cache update logic to not overwrite new incoming messages.
  - Ensure the "unread" status is correctly handled.

### Backend Verification
- Verify `server/routes/messages.js` handles the list retrieval correctly (already confirmed it does `SELECT * FROM messages ORDER BY created_at DESC`).

## Technical Details
- Frontend: `src/hooks/api/useDashboardData.ts` and `src/pages/dashboard/Messages.tsx`.
- Backend: `server/routes/messages.js`.
- Data merging: Prioritize server-sent `id`s to avoid showing duplicate mock data.
