import { NextRequest, NextResponse } from "next/server";
export const runtime="edge";
const NASDAQ="https://api.nasdaq.com/api";
const headers={"User-Agent":"Mozilla/5.0 (compatible; Stocklens/1.0)",Accept:"application/json","Accept-Language":"en-US,en;q=0.9"};
const aliases:Record<string,string>={apple:"AAPL",nvidia:"NVDA",tesla:"TSLA",microsoft:"MSFT",amazon:"AMZN",google:"GOOGL",alphabet:"GOOGL",meta:"META",netflix:"NFLX",amd:"AMD",intel:"INTC",walmart:"WMT",disney:"DIS",boeing:"BA","coca-cola":"KO",coca_cola:"KO",nike:"NKE",paypal:"PYPL",uber:"UBER",salesforce:"CRM",broadcom:"AVGO"};
const text=(value:unknown)=>typeof value==="string"?value:"";
const number=(value:unknown)=>Number(text(value).replace(/[$,%+,]/g,""))||0;
const cleanName=(value:string)=>value.replace(/ Common Stock| Class [A-Z] Common Stock| Ordinary Shares|, Inc\.?/gi,"").trim();
const formatFinancial=(value:string)=>{const raw=number(value)*1000;return raw?`$${new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:2}).format(raw)}`:"—";};
const decode=(value:string)=>value.replace(/<!\[CDATA\[|\]\]>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");
async function json(url:string){const response=await fetch(url,{headers,cf:{cacheTtl:300,cacheEverything:true}} as RequestInit);if(!response.ok)throw new Error(`Market provider returned ${response.status}`);return response.json();}

export async function GET(request:NextRequest){
  try{
    const query=(request.nextUrl.searchParams.get("q")||"Apple").trim(),key=query.toLowerCase().replace(/\s+/g,"_");
    let symbol=aliases[key]||(query.length<=6&&/^[a-z.\-]+$/i.test(query)?query.toUpperCase():"");let listing:Record<string,unknown>|undefined;
    if(!symbol){const directory=await json(`${NASDAQ}/screener/stocks?tableonly=true&limit=5000&offset=0`);const rows=directory?.data?.table?.rows||[],lowered=query.toLowerCase();listing=rows.find((row:Record<string,unknown>)=>text(row.name).toLowerCase().startsWith(lowered))||rows.find((row:Record<string,unknown>)=>text(row.name).toLowerCase().includes(lowered));symbol=text(listing?.symbol);}
    if(!symbol)return NextResponse.json({error:`No US-listed company matched “${query}”. Try its ticker symbol.`},{status:404});
    const range=request.nextUrl.searchParams.get("range")||"1M",days=range==="3M"?95:range==="1Y"?370:range==="5Y"?1830:35,end=new Date(),start=new Date(Date.now()-days*86400000),iso=(date:Date)=>date.toISOString().slice(0,10),base=`${NASDAQ}/quote/${encodeURIComponent(symbol)}`;
    const [info,summary,history,financials,rss]=await Promise.all([
      json(`${base}/info?assetclass=stocks`),json(`${base}/summary?assetclass=stocks`),json(`${base}/historical?assetclass=stocks&fromdate=${iso(start)}&todate=${iso(end)}&limit=${range==="5Y"?1300:380}`),json(`${NASDAQ}/company/${encodeURIComponent(symbol)}/financials?frequency=1`).catch(()=>null),fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(`${symbol} stock`)}&hl=en-US&gl=US&ceid=US:en`,{cf:{cacheTtl:300}} as RequestInit).then(response=>response.text()).catch(()=>"")
    ]);
    if(!info?.data?.primaryData)return NextResponse.json({error:`No market data is available for ${symbol}.`},{status:404});
    const primary=info.data.primaryData,sum=summary?.data?.summaryData||{},rows=(history?.data?.tradesTable?.rows||[]).map((row:Record<string,unknown>)=>({date:text(row.date),close:number(row.close)})).filter((row:{close:number})=>row.close).reverse(),statements=financials?.data?.incomeStatementTable,financialRows:Array<Record<string,string>>=statements?.rows||[];
    const metrics=["Total Revenue","Gross Profit","Operating Income","Net Income"].map(label=>{const row=financialRows.find(item=>item.value1===label);if(!row)return null;const latest=number(row.value2),previous=number(row.value3);return{label,value:formatFinancial(row.value2),change:previous?((latest-previous)/Math.abs(previous))*100:null};}).filter(Boolean);
    const items=[...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,3).map(match=>{const body=match[1],get=(tag:string)=>decode(body.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]||""),title=get("title"),source=title.includes(" - ")?title.split(" - ").pop()||"Market news":"Market news";return{title:title.slice(0,Math.max(0,title.length-source.length-3)),source,date:get("pubDate"),link:get("link")};});
    const latest=rows.at(-1),todayHigh=number(primary.lastSalePrice),todayLow=todayHigh;
    return NextResponse.json({symbol,name:cleanName(text(info.data.companyName)||text(listing?.name)||symbol),exchange:text(info.data.exchange)||text(sum.Exchange?.value),price:number(primary.lastSalePrice)||latest?.close||0,change:number(primary.netChange)*(text(primary.deltaIndicator)==="down"?-1:1),changePct:number(primary.percentageChange)*(text(primary.deltaIndicator)==="down"?-1:1),marketCap:number(sum.MarketCap?.value)||number(listing?.marketCap),dayRange:text(sum.TodayHighLow?.value)!=="N/A"&&text(sum.TodayHighLow?.value)?text(sum.TodayHighLow?.value):`$${todayLow.toFixed(2)}–$${todayHigh.toFixed(2)}`,yearRange:text(sum.FiftTwoWeekHighLow?.value)||"—",volume:text(primary.volume)||text(sum.ShareVolume?.value)||"—",target:text(sum.OneYrTarget?.value)||"—",yield:text(sum.Yield?.value)||"—",marketStatus:text(info.data.marketStatus),updated:text(primary.lastTradeTimestamp),history:rows,financials:metrics,news:items});
  }catch(cause){return NextResponse.json({error:cause instanceof Error?cause.message:"Market data is temporarily unavailable."},{status:500});}
}
