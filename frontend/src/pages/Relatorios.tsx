import React, {useState} from "react";
export default function Relatorios(){
  const [de,setDe]=useState(""); const [ate,setAte]=useState("");
  const [res,setRes]=useState<{qtd:number,total:number}|null>(null);
  const consultar=async()=>{
    const q=new URLSearchParams({de,ate}); const r=await fetch("http://localhost:3000/api/relatorios/vendas?"+q.toString());
    setRes(await r.json());
  };
  return (<div style={{padding:16}}>
    <h2>Relatórios de Vendas</h2>
    <input type="datetime-local" value={de} onChange={e=>setDe(e.target.value)} />{" "}
    <input type="datetime-local" value={ate} onChange={e=>setAte(e.target.value)} />{" "}
    <button onClick={consultar}>Consultar</button>
    {res && <p><b>Vendas:</b> {res.qtd} | <b>Total:</b> R$ {Number(res.total).toFixed(2)}</p>}
  </div>);
}
