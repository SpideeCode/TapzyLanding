import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Get the caller's JWT
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Missing Authorization header')

        // 2. Verify the caller is a superadmin
        // We create a client with the caller's token to get their user
        const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
            global: { headers: { Authorization: authHeader } }
        })

        const { data: { user: caller }, error: callerError } = await userClient.auth.getUser()
        if (callerError || !caller) throw new Error('Invalid caller token')

        const { data: profile, error: profileFetchError } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', caller.id)
            .single()

        if (profileFetchError || profile?.role !== 'superadmin') {
            throw new Error('Unauthorized: SuperAdmin role required')
        }

        const { email, password, role, restaurant_id } = await req.json()

        // 3. Create the user in Auth
        const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role }
        })

        if (userError) throw userError

        // 4. Update the profile
        const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ role, restaurant_id })
            .eq('id', userData.user.id)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({ success: true, user: userData.user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
