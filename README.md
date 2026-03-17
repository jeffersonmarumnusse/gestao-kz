# Gestão KZ - Fitness Studio 🏋️‍♂️

Sistema completo para gestão de estúdios de fitness, integrando controle de alunos, financeiro e agenda em tempo real.

## 🚀 Tecnologias
- **Frontend:** React + Vite + Tailwind CSS
- **Ícones:** Lucide React
- **Gráficos:** Recharts
- **Animações:** Motion
- **Banco de Dados:** Supabase

## ☁️ Como Fazer o Deploy na Vercel

1. **Acesse a Vercel:** [vercel.com](https://vercel.com/)
2. **Crie um Novo Projeto:** Clique em "Add New" > "Project".
3. **Importe do GitHub:** Conecte sua conta e selecione o repositório `gestao-kz`.
4. **Configure as Variáveis de Ambiente (CRÍTICO):**
   No campo "Environment Variables" dentro da Vercel, adicione as mesmas chaves que estão no seu arquivo `.env`:
   - `VITE_SUPABASE_URL`: Sua URL do Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Sua chave anon do Supabase.
5. **Deploy:** Clique em "Deploy".

Após o deploy, a Vercel te dará um link público (ex: `gestao-kz.vercel.app`) para você e sua equipe acessarem de qualquer lugar!

## 💾 Banco de Dados (Supabase)
Certifique-se de executar o arquivo `supabase_schema.sql` no SQL Editor do seu projeto Supabase para criar a estrutura necessária.

---
Desenvolvido com foco em alta performance e reatividade.
