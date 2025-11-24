import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const API = (path, opts={}) =>
  fetch(import.meta.env.VITE_API_URL + path, { headers:{'Content-Type':'application/json'}, ...opts })
  .then(r => r.json());

function useFetch(path, deps=[]){
  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{
    let isMounted = true;
    setLoading(true);
    API(path).then(d => { if(isMounted){ setData(d); setLoading(false);} });
    return ()=>{ isMounted=false; };
  }, deps);
  return { data, loading, reload: ()=>API(path).then(setData) };
}

function TabClientes(){
  const { data:clientes, loading } = useFetch("/clientes", []);
  const [form,setForm]=useState({nome:"",telefone:"",endereco:"",bairro:"",cidade:""});
  const [refresh,setRefresh]=useState(0);

  useEffect(()=>{},[refresh]);

  const salvar = async ()=>{
    await API("/clientes",{method:"POST", body:JSON.stringify(form)});
    setForm({nome:"",telefone:"",endereco:"",bairro:"",cidade:""});
    setRefresh(x=>x+1);
  };

  const remover = async (id)=>{
    await API("/clientes/"+id,{method:"DELETE"});
    setRefresh(x=>x+1);
  };

  useEffect(()=>{ API("/clientes").then(()=>setRefresh(x=>x+1)); },[]);

  const list = useFetch("/clientes",[refresh]).data;

  return (
    <div>
      <div className="card">
        <h3>Novo cliente</h3>
        <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8}}>
          {["nome","telefone","endereco","bairro","cidade"].map(k=>(
            <input key={k} placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
          ))}
        </div>
        <div style={{marginTop:10}}><button onClick={salvar}>Salvar</button></div>
      </div>

      <div className="card">
        <h3>Clientes</h3>
        {loading? <small>Carregando…</small> :
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Telefone</th><th>Bairro</th><th>Cidade</th><th>Ações</th></tr></thead>
          <tbody>
            {list.map(c=>(
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.nome}</td><td>{c.telefone}</td><td>{c.bairro}</td><td>{c.cidade}</td>
                <td><button onClick={()=>remover(c.id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}

function TabProdutos(){
  const [refresh,setRefresh]=useState(0);
  const { data:produtos } = useFetch("/produtos",[refresh]);
  const [form,setForm]=useState({nome:"",tipo:"gás",preco:"",estoque:""});

  const salvar = async ()=>{
    await API("/produtos",{method:"POST", body:JSON.stringify({...form, preco:Number(form.preco), estoque:Number(form.estoque)})});
    setForm({nome:"",tipo:"gás",preco:"",estoque:""});
    setRefresh(x=>x+1);
  };

  const remover = async (id)=>{
    await API("/produtos/"+id,{method:"DELETE"});
    setRefresh(x=>x+1);
  };

  return (
    <div>
      <div className="card">
        <h3>Novo produto</h3>
        <div style={{display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8}}>
          <input placeholder="nome" value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/>
          <select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
            <option value="gás">gás</option>
            <option value="água">água</option>
          </select>
          <input placeholder="preço" value={form.preco} onChange={e=>setForm({...form,preco:e.target.value})}/>
          <input placeholder="estoque" value={form.estoque} onChange={e=>setForm({...form,estoque:e.target.value})}/>
        </div>
        <div style={{marginTop:10}}><button onClick={salvar}>Salvar</button></div>
      </div>

      <div className="card">
        <h3>Estoque</h3>
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Tipo</th><th>Preço</th><th>Estoque</th><th>Ações</th></tr></thead>
          <tbody>
            {produtos.map(p=>(
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.nome}</td><td>{p.tipo}</td><td>R$ {Number(p.preco).toFixed(2)}</td><td>{p.estoque}</td>
                <td><button onClick={()=>remover(p.id)}>Excluir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabVendas(){
  const [refresh,setRefresh]=useState(0);
  const { data:clientes } = useFetch("/clientes",[refresh]);
  const { data:produtos } = useFetch("/produtos",[refresh]);
  const { data:vendas } = useFetch("/vendas",[refresh]);

  const [form,setForm]=useState({cliente_id:"",usuario_id:1,produto_id:"",quantidade:1,forma_pagamento:"pix"});

  const lançar = async ()=>{
    await API("/vendas",{method:"POST", body:JSON.stringify({
      cliente_id:Number(form.cliente_id),
      usuario_id:Number(form.usuario_id),
      produto_id:Number(form.produto_id),
      quantidade:Number(form.quantidade),
      forma_pagamento:form.forma_pagamento
    })});
    setRefresh(x=>x+1);
  };

  return (
    <div>
      <div className="card">
        <h3>Nova venda</h3>
        <div style={{display:"grid", gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr", gap:8}}>
          <select value={form.cliente_id} onChange={e=>setForm({...form,cliente_id:e.target.value})}>
            <option value="">Cliente…</option>
            {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select value={form.produto_id} onChange={e=>setForm({...form,produto_id:e.target.value})}>
            <option value="">Produto…</option>
            {produtos.map(p=><option key={p.id} value={p.id}>{p.nome} (R$ {Number(p.preco).toFixed(2)})</option>)}
          </select>
          <input type="number" min="1" value={form.quantidade} onChange={e=>setForm({...form,quantidade:e.target.value})}/>
          <select value={form.forma_pagamento} onChange={e=>setForm({...form,forma_pagamento:e.target.value})}>
            <option>pix</option><option>dinheiro</option><option>cartão</option><option>fiado</option>
          </select>
          <button onClick={lançar}>Lançar</button>
        </div>
        <small>Usuário (vendedor) fixo em 1 só para começar; depois fazemos login/perfis.</small>
      </div>

      <div className="card">
        <h3>Vendas (recentes)</h3>
        <table>
          <thead><tr><th>#</th><th>Cliente</th><th>Produto</th><th>Qtd</th><th>Valor</th><th>Pagamento</th><th>Data</th></tr></thead>
          <tbody>
            {vendas.map(v=>(
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.cliente_nome}</td>
                <td>{v.produto_nome}</td>
                <td>{v.quantidade}</td>
                <td>R$ {Number(v.valor_total).toFixed(2)}</td>
                <td>{v.forma_pagamento}</td>
                <td>{new Date(v.data_venda).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabRelatorios(){
  const [inicio,setInicio]=useState(new Date().toISOString().slice(0,10));
  const [fim,setFim]=useState(new Date().toISOString().slice(0,10));
  const [total,setTotal]=useState(null);

  const calcular = async ()=>{
    const r = await API(`/relatorios/lucro?inicio=${inicio}&fim=${fim}`);
    setTotal(r.total);
  };

  return (
    <div className="card">
      <h3>Relatório de lucro (período)</h3>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input type="date" value={inicio} onChange={e=>setInicio(e.target.value)} />
        <span>até</span>
        <input type="date" value={fim} onChange={e=>setFim(e.target.value)} />
        <button onClick={calcular}>Calcular</button>
      </div>
      {total!==null && <p style={{marginTop:10}}>Total do período: <b>R$ {Number(total).toFixed(2)}</b></p>}
    </div>
  );
}

function App(){
  const [tab,setTab]=useState("clientes");
  const tabs=[["clientes","Clientes"],["produtos","Produtos/Estoque"],["vendas","Vendas"],["rel","Relatórios"]];
  return (
    <>
      <div className="tabs">
        {tabs.map(([k,label])=>(
          <div key={k} className={"tab"+(tab===k?" active":"")} onClick={()=>setTab(k)}>{label}</div>
        ))}
      </div>
      {tab==="clientes"&&<TabClientes/>}
      {tab==="produtos"&&<TabProdutos/>}
      {tab==="vendas"&&<TabVendas/>}
      {tab==="rel"&&<TabRelatorios/>}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App/>);
