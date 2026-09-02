const fs=require('fs');
const s=fs.readFileSync('hunterstellar-logo.svg','utf8');
// root svg width/height
const m=s.match(/<svg[^>]*>/)[0];
console.log('ROOT:', m);
const re=/<path\s+d="([^"]*)"/g;
let idx=0,hit; const paths=[];
while((hit=re.exec(s))){ paths.push({i:idx++,d:hit[1]}) }
// function to extract max x (end position) roughly by parsing move/line/curve coords
function extractX(d){
  const nums=[...d.matchAll(/-?\d+(?:\.\d+)?/g)].map(x=>parseFloat(x[0]));
  // coordinates come in pairs; x = even indices
  let maxX=-1e9,minX=1e9,maxY=-1e9,minY=1e9;
  for(let i=0;i+1<nums.length;i+=2){ const x=nums[i],y=nums[i+1]; if(x>maxX)maxX=x; if(x<minX)minX=x; if(y>maxY)maxY=y; if(y<minY)minY=y; }
  return {minX,maxX,minY,maxY,w:maxX-minX};
}
console.log('PATH index, minX, maxX, width, height');
for(const p of paths){ const b=extractX(p.d); console.log(p.i, Math.round(b.minX), Math.round(b.maxX), Math.round(b.w), Math.round(b.maxY-b.minY)); }
