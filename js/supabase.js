import { createClient } from 'http://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabaseUrl = 'https://uhflpbmxmzgkqwjpyhon.supabase.co'
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZmxwYm14bXpna3F3anB5aG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTI2ODUsImV4cCI6MjA5NDE2ODY4NX0.aZxJB5IiLQ7dwxppRB-W_lCh-cnx1TqH7Ng6jC_1oZk'

export const supabase = createClient(supabaseUrl, supabaseKey)

console.log("Supabase inciaido com sucesso!")