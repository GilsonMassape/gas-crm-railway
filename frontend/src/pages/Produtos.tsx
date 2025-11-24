import { useEffect, useState } from "react";

type Produto = { id:number; nome:string; tipo:string; preco:number; estoque:number };

export default function Produtos() {
  const [itens, setItens] = useState<Produto[]>([]);
  const [form, setForm] = useState({ nome:"", tipo:"GAS_P13", preco:"", estoque:"0" });

  useEffect(() => {
    // CORREÇÃO: Removido o prefixo /api/
    fetch("/produtos").then(r=>r.json()).then(setItens).catch(()=>setItens([]));
  }, []);

  const salvar = async () => {
    // CORREÇÃO: Removido o prefixo /api/
    await fetch("/produtos", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ 
        nome: form.nome, 
        tipo: form.tipo, 
        preco: Number(form.preco||0), 
        estoque: Number(form.estoque||0) 
      })
    });
    // CORREÇÃO: Removido o prefixo /api/
    const nova = await fetch("/produtos").then(r=>r.json());
    setItens(nova);
    setForm({ nome:"", tipo:"GAS_P13", preco:"", estoque:"0" });
  };

  return (
    <div style={{padding:16}}>
      <h1>Produtos</h1>

      <div style={{display:"grid",gap:8,maxWidth:480}}>
        <input placeholder="Nome" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/>
        <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
          <option value="GAS_P13">Gás P13</option>
          <option value="AGUA_MINERAL">Água mineral</option>
          <option value="AGUA_DESSALINIZADA">Água dessalinizada</option>
        </select>
        <input placeholder="Preço" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})}/>
        <input placeholder="Estoque" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})}/>
        <button onClick={salvar}>Salvar</button>
      </div>

      <hr/>
      <table>
        <thead><tr><th>ID</th><th>Nome</th><th>Tipo</th><th>Preço</th><th>Estoque</th></tr></thead>
        <tbody>
          {itens.map(p=>(
            <tr key={p.id}><td>{p.id}</td><td>{p.nome}</td><td>{p.tipo}</td><td>{p.preco}</td><td>{p.estoque}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
