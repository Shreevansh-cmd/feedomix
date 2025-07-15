import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Mock price data - replace with real API call
const mockPriceData = [
  { ingredient: "Maize (Corn)", price_per_kg: 24.50 },
  { ingredient: "Soybean Meal (44% CP)", price_per_kg: 52.00 },
  { ingredient: "Soybean Meal (48% CP)", price_per_kg: 54.00 },
  { ingredient: "Rice Bran", price_per_kg: 18.75 },
  { ingredient: "Wheat", price_per_kg: 28.00 },
  { ingredient: "Fish Meal (60% CP)", price_per_kg: 85.00 },
  { ingredient: "Fish Meal (65% CP)", price_per_kg: 90.00 },
  { ingredient: "Groundnut Cake", price_per_kg: 45.00 },
  { ingredient: "Cotton Seed Meal", price_per_kg: 35.00 },
  { ingredient: "Sunflower Seed Meal", price_per_kg: 38.00 },
  { ingredient: "Barley", price_per_kg: 22.00 },
  { ingredient: "Sorghum", price_per_kg: 23.50 },
  { ingredient: "Broken Rice", price_per_kg: 32.00 },
  { ingredient: "Vegetable Oil", price_per_kg: 120.00 },
  { ingredient: "Dicalcium Phosphate (DCP)", price_per_kg: 55.00 },
  { ingredient: "Bone Meal", price_per_kg: 40.00 }
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting price fetch operation...')

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add some random variation to prices (+/- 5%)
    const updatedPrices = mockPriceData.map(item => ({
      ...item,
      price_per_kg: Number((item.price_per_kg * (0.95 + Math.random() * 0.1)).toFixed(2))
    }))

    console.log('Fetched prices:', updatedPrices)

    // Update prices in database
    const updatePromises = updatedPrices.map(async (priceData) => {
      const { data, error } = await supabase
        .from('feed_ingredients')
        .update({
          cost_per_kg: priceData.price_per_kg,
          price_source: 'AgriPriceAPI',
          price_updated_at: new Date().toISOString(),
          is_price_custom: false
        })
        .eq('name', priceData.ingredient)
        .eq('is_default', true)

      if (error) {
        console.error(`Error updating ${priceData.ingredient}:`, error)
        return { ingredient: priceData.ingredient, success: false, error }
      }

      console.log(`Updated ${priceData.ingredient} to ₹${priceData.price_per_kg}/kg`)
      return { ingredient: priceData.ingredient, success: true, price: priceData.price_per_kg }
    })

    const results = await Promise.all(updatePromises)
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    console.log(`Price update complete: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${successful} ingredient prices`,
        failed_updates: failed,
        updated_at: new Date().toISOString(),
        source: 'AgriPriceAPI',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in fetch-ingredient-prices function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Failed to fetch ingredient prices'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})