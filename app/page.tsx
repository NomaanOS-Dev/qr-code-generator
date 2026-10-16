import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  
  // Simple query to test connection
  const { data, error } = await supabase
    .from('qr_codes')
    .select('count')
    .limit(1)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">ScanFlow</h1>
      {error ? (
        <p className="text-red-500">❌ Supabase error: {error.message}</p>
      ) : (
        <p className="text-green-500">✅ Supabase connected</p>
      )}
      <p className="text-sm text-muted-foreground mt-4">
        Connected to Supabase and fetched {data?.length ?? 0} QR codes.
      </p>
    </main>
  )
}