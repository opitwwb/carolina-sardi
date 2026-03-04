import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

### 📄 `src/App.jsx`
Nome do arquivo: `src/App.jsx`

Cole aqui **todo o conteúdo** do arquivo `CarolinaSardi.jsx` que você baixou. É o arquivo principal com todo o site.

---

## 3️⃣ Conectar na Vercel

1. Acesse **[vercel.com](https://vercel.com)** → faça login com o GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `carolina-sardi`
4. A Vercel detecta Vite automaticamente
5. Clique em **"Deploy"** 🚀

Em 1-2 minutos o site está no ar com URL tipo `carolina-sardi.vercel.app`

---

## 4️⃣ Atualizar o site no futuro

Sempre que quiser mudar algo, basta:
1. Abrir o arquivo no GitHub (ex: `src/App.jsx`)
2. Clicar no **ícone de lápis** ✏️ para editar
3. Fazer a alteração
4. Clicar em **"Commit changes"**

A Vercel detecta o commit e **redeploy automático** em segundos! ✅

---

**Ordem resumida:**
```
GitHub (cria os 5 arquivos) → Vercel (conecta o repo) → site no ar
