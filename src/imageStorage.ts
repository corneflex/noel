import { supabase } from './supabaseClient'

export type MediaType = 'image' | 'video'

export interface ImageListItem {
  name: string
  url: string
  createdAt: string
  type: MediaType
}

/**
 * Liste toutes les images dans le bucket via l'Edge Function
 * @returns Liste des images avec leurs URLs signées
 */
export async function listImages(): Promise<ImageListItem[]> {
  try {
    // Récupérer le token JWT de l'utilisateur connecté
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Erreur de session:', sessionError)
      return []
    }

    if (!session) {
      console.error('Aucune session utilisateur')
      // Forcer une reconnexion
      await supabase.auth.signOut()
      return []
    }

    console.log('Session active, appel de l\'Edge Function...')

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/functions/v1/get-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': supabaseKey,
      },
    })

    if (!response.ok) {
      console.error('Erreur HTTP:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Détails:', errorText)

      // Si erreur 401, la session est probablement expirée
      if (response.status === 401) {
        console.error('Session expirée, déconnexion...')
        await supabase.auth.signOut()
      }

      return []
    }

    const data = await response.json()

    if (!data || !data.images) {
      console.error('Réponse invalide de l\'Edge Function:', data)
      return []
    }

    console.log('Médias récupérés:', data.images.length)
    return data.images
  } catch (error) {
    console.error('Erreur:', error)
    return []
  }
}
