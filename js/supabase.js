// 1. Importação da biblioteca oficial do Supabase via CDN
import { createClient } from 'http://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 2. As credenciais de acesso
const supabaseUrl = 'https://uhflpbmxmzgkqwjpyhon.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoZmxwYm14bXpna3F3anB5aG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTI2ODUsImV4cCI6MjA5NDE2ODY4NX0.aZxJB5IiLQ7dwxppRB-W_lCh-cnx1TqH7Ng6jC_1oZk'

// 3. Inicializa o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

//Validador de conexão
console.log("Supabase inciaido com sucesso!")

