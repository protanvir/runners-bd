
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

module.exports = async function (req) {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { code, refresh_token } = await req.json();

        // Get secrets from environment
        // const clientId = Deno.env.get('STRAVA_CLIENT_ID');
        // const clientSecret = Deno.env.get('STRAVA_CLIENT_SECRET');

        // if (!clientId || !clientSecret) {
        //     throw new Error('Strava credentials not configured');
        // }

        let tokenResponse;

        if (code) {
            // Exchange Code for Token
            const response = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: '38116',
                    client_secret: '376733ca08ac9989fc2c5a88c8a01fe63e7984a3',
                    code: code,
                    grant_type: 'authorization_code'
                })
            });
            tokenResponse = await response.json();
        } else if (refresh_token) {
            // Refresh Token
            const response = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: '38116',
                    client_secret: '376733ca08ac9989fc2c5a88c8a01fe63e7984a3',
                    refresh_token: refresh_token,
                    grant_type: 'refresh_token'
                })
            });
            tokenResponse = await response.json();
        } else {
            throw new Error('Missing code or refresh_token');
        }

        if (tokenResponse.errors) {
            throw new Error(JSON.stringify(tokenResponse));
        }

        // Return the tokens to the client
        // Note: In a production app, you might want to save directly to the DB here
        // But for now, we return to the client to save via the existing updateProfile call 
        // OR we can save it here if we have the user ID from the Authorization header.
        // For simplicity with this tool, let's return it and let the client save it 
        // (though client saving means client sees the refresh token - acceptable for this demo).

        // BETTER: Let's save it to the DB here if we can verify the user.
        // However, the standard `insforge.functions.invoke` passes the user JWT.
        // We can use Supabase client to save it.

        // For this iteration, returning to client is easiest for the frontend to handle the state update.

        return new Response(JSON.stringify(tokenResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
}
