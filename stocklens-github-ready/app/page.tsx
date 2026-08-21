"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Point = { date: string; close: number };
type News = { title: string; source: string; date: string; link: string };
type Metric = { label: string; value: string; change: number | null };
type Stock = { symbol:string; name:string; exchange:string; price:number; change:number; changePct:number; marketCap:number; dayRange:string; yearRange:string; volume:string; target:string; yield:string; marketStatus:string; updated:string; history:Point[]; financials:Metric[]; news:News[] };
const money = (value:number) => new Intl.NumberFormat("en-US", { style:"currency", currency:"USD", minimumFractionDigits:2 }).format(value);
const compact = (value:number) => value ? new Intl.NumberFormat("en-US", { notation:"compact", maximumFractionDigits:2 }).format(value) : "—";

export default function Home() {
  const [query,setQuery]=useState(""); const [stock,setStock]=useState<Stock|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [range,setRange]=useState("1M");
  async function analyze(term:string, selectedRange=range) {
    const clean=term.trim(); if(!clean)return; setLoading(true); setError("");
    try { const response=await fetch(`/api/stock?q=${encodeURIComponent(clean)}&range=${selectedRange}`); const data=await response.json() as Stock&{error?:string}; if(!response.ok)throw new Error(data.error||"We couldn’t find that company."); setStock(data); setQuery(""); setTimeout(()=>document.querySelector("#overview")?.scrollIntoView({behavior:"smooth",block:"start"}),50); }
    catch(cause){setError(cause instanceof Error?cause.message:"Something went wrong.");} finally{setLoading(false);}
  }
  useEffect(()=>{analyze("Apple");},[]);
  function submit(event:FormEvent){event.preventDefault();analyze(query);}
  const direction=(stock?.change??0)>=0;
  const bars=useMemo(()=>{const values=stock?.history.map(point=>point.close)??[];const min=Math.min(...values),max=Math.max(...values);return values.map(value=>22+((value-min)/Math.max(max-min,1))*70);},[stock]);
  function changeRange(item:string){setRange(item);if(stock)analyze(stock.symbol,item);}

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#">Stock<span>lens</span></a><nav aria-label="Primary navigation"><a className="active" href="#overview">Overview</a><a href="#history">History</a><a href="#news">News</a></nav><span className="live-dot"><i/> LIVE DATA</span></header>
    <section className="search-band"><div><p className="eyebrow">MARKET INTELLIGENCE</p><h1>Know the company.<br/>Understand the stock.</h1><p className="subhead">Search any US-listed company for its latest price, historical performance, financial results, and breaking coverage.</p></div><form className="search" onSubmit={submit}><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search company or ticker..." aria-label="Search company or ticker"/><button type="submit" disabled={loading}>{loading?"Loading…":"Analyze →"}</button></form><div className="quick"><span>Try</span>{["Apple","Nvidia","Tesla","Microsoft"].map(name=><button key={name} onClick={()=>analyze(name)}>{name}</button>)}</div>{error&&<p className="error" role="alert">{error}</p>}</section>
    <section className={`dashboard ${loading?"is-loading":""}`} id="overview" aria-busy={loading}>
      {!stock?<div className="empty-state">Loading market data…</div>:<>
        <div className="company-row"><div className="company-mark">{stock.symbol[0]}</div><div><p className="ticker">{stock.symbol} · {stock.exchange}</p><h2>{stock.name}</h2><small className="updated">{stock.marketStatus} · Updated {stock.updated}</small></div><div className="price"><strong>{money(stock.price)}</strong><span className={direction?"up":"down"}>{direction?"+":""}{stock.change.toFixed(2)}&nbsp; ({stock.changePct.toFixed(2)}%)</span></div></div>
        <div className="metrics"><article><span>Market cap</span><strong>{compact(stock.marketCap)}</strong><small>Latest reported value</small></article><article><span>Today’s range</span><strong>{stock.dayRange}</strong><small>52W {stock.yearRange}</small></article><article><span>Share volume</span><strong>{stock.volume}</strong><small>Current session</small></article><article><span>Dividend yield</span><strong>{stock.yield}</strong><small>1Y target {stock.target}</small></article></div>
        <div className="grid">
          <article className="panel chart-panel" id="history"><div className="panel-head"><div><p>PRICE HISTORY</p><h3>{money(stock.price)}</h3></div><div className="ranges">{["1M","3M","1Y","5Y"].map(item=><button key={item} className={range===item?"selected":""} onClick={()=>changeRange(item)}>{item}</button>)}</div></div><div className="chart" aria-label={`${range} closing-price history`}><div className="gridline g1"/><div className="gridline g2"/><div className="gridline g3"/><div className="mountain">{bars.map((height,index)=><i key={index} style={{height:`${height}%`}} title={`${stock.history[index].date}: ${money(stock.history[index].close)}`}/>)}</div></div><div className="chart-foot"><span>{stock.history.at(0)?.date??""}</span><span>{stock.history.at(Math.floor(stock.history.length/2))?.date??""}</span><span>{stock.history.at(-1)?.date??""}</span></div></article>
          <article className="panel performance"><div className="panel-head"><div><p>ANNUAL FINANCIALS</p><h3>Profit & loss</h3></div><span className="positive">Reported</span></div>{stock.financials.length?stock.financials.map((item,index)=><div key={item.label}><div className="perf-row"><span>{item.label}</span><strong>{item.value}</strong><em className={(item.change??0)>=0?"up":"down"}>{item.change==null?"latest":`${item.change>=0?"+":""}${item.change.toFixed(1)}%`}</em></div><div className="bar"><i style={{width:`${Math.max(28,90-index*17)}%`}}/></div></div>):<p className="unavailable">Financial statements are not available for this security.</p>}</article>
        </div>
        <section className="news-section" id="news"><div className="section-title"><div><p>LATEST COVERAGE</p><h3>News that moves the market</h3></div><span>Updated continuously</span></div><div className="news-grid">{stock.news.map((item,index)=><a href={item.link} target="_blank" rel="noreferrer" key={item.link}><article><div className={`news-image news-${(index%3)+1}`}><span>{item.source||"MARKET NEWS"}</span></div><small>{new Date(item.date).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</small><h4>{item.title}</h4><p>Read the full report ↗</p></article></a>)}</div></section>
        <footer>Market data is provided for informational purposes and may be delayed. Nothing on Stocklens is investment advice.</footer>
      </>}
    </section>
  </main>;
}
