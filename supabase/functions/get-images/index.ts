import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const BUCKET_NAME = 'images'
const SIGNED_URL_EXPIRY = 3600 // 1 heure en secondes

type MediaType = 'image' | 'video'

interface ImageListItem {
  name: string
  url: string
  createdAt: string
  type: MediaType
}

function getMediaType(fileName: string): MediaType {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'm4v']
  return videoExtensions.includes(ext) ? 'video' : 'image'
}

Deno.serve(async (req) => {
  try {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Vérifier le JWT manuellement
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Créer un client Supabase avec la clé anon pour vérifier le token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      console.error('Erreur d\'authentification:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Utilisateur authentifié:', user.email)

    // Créer le client Supabase avec les credentials admin pour accéder au storage

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer la liste des fichiers dans le bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list()

    if (listError) {
      console.error('Erreur lors de la récupération des fichiers:', listError)
      return new Response(
        JSON.stringify({ error: listError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Filtrer pour ne garder que les fichiers (pas les dossiers)
    const imageFiles = files.filter(file => file.id)

    // Générer les URLs signées pour chaque image/vidéo
    const imagesWithUrls: ImageListItem[] = await Promise.all(
      imageFiles.map(async (file) => {
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(file.name, SIGNED_URL_EXPIRY)

        if (urlError) {
          console.error(`Erreur URL pour ${file.name}:`, urlError)
          return {
            name: file.name,
            url: '',
            createdAt: file.created_at,
            type: getMediaType(file.name)
          }
        }

        return {
          name: file.name,
          url: signedUrlData.signedUrl,
          createdAt: file.created_at,
          type: getMediaType(file.name)
        }
      })
    )

    return new Response(
      JSON.stringify({ images: imagesWithUrls }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
