(function(){
  'use strict';
  let cur=0; const TOTAL=3;
  const slides=[...document.querySelectorAll('.slide')];
  const dots=[...document.querySelectorAll('.dot')];
  const btnNext=document.getElementById('btnNext');
  const btnSkip=document.getElementById('btnSkip');
  const btnCreate=document.getElementById('btnCreate');
  const btnLogin=document.getElementById('btnLogin');
  const finalWrap=document.getElementById('finalWrap');

  // Canvas particles
  const canvas=document.getElementById('canvas');
  const ctx=canvas.getContext('2d');
  let W,H,pts=[];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  class P{
    constructor(){this.r2(true);}
    r2(s){this.x=Math.random()*W;this.y=s?Math.random()*H:H+5;this.r=Math.random()*.9+.2;this.a=Math.random()*.14+.03;this.vx=(Math.random()-.5)*.1;this.vy=-(Math.random()*.25+.07);this.t=0;this.T=Math.random()*220+100;}
    tick(){this.x+=this.vx;this.y+=this.vy;this.t++;if(this.t>=this.T||this.y<-6)this.r2(false);}
    draw(){const p=this.t/this.T;const f=p<.12?p/.12:p>.78?(1-p)/.22:1;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=`rgba(201,168,76,${this.a*f})`;ctx.fill();}
  }
  function initPts(){pts=[];const n=Math.min(~~(W*H/10000),55);for(let i=0;i<n;i++){const p=new P();p.t=~~(Math.random()*p.T);pts.push(p);}}
  function frame(){ctx.clearRect(0,0,W,H);pts.forEach(p=>{p.tick();p.draw();});requestAnimationFrame(frame);}
  resize();initPts();frame();
  window.addEventListener('resize',()=>{resize();initPts();});

  function goTo(i){
    if(i<0||i>=TOTAL)return;
    slides[cur].classList.remove('active');
    slides[cur].classList.add('out');
    const prev=cur; cur=i;
    setTimeout(()=>slides[prev].classList.remove('out'),460);
    slides[cur].classList.add('active');
    dots.forEach((d,j)=>d.classList.toggle('active',j===cur));
    if(cur===TOTAL-1){btnNext.style.display='none';finalWrap.classList.add('show');}
    else{btnNext.style.display='';finalWrap.classList.remove('show');}
  }

  btnNext.addEventListener('click',()=>goTo(cur+1));
  btnSkip.addEventListener('click',()=>nav('../welcome/welcome.html'));
  btnCreate.addEventListener('click',()=>nav('../welcome/welcome.html'));
  btnLogin.addEventListener('click',()=>nav('../welcome/welcome.html'));
  dots.forEach(d=>d.addEventListener('click',()=>goTo(+d.dataset.i)));

  // Swipe
  let tx=0;
  document.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
  document.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>44){d<0?goTo(cur+1):goTo(cur-1);}},{passive:true});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowRight')goTo(cur+1);if(e.key==='ArrowLeft')goTo(cur-1);if(e.key==='Escape')nav('../welcome/welcome.html');});

  function nav(url){document.body.classList.add('out');setTimeout(()=>window.location.href=url,460);}
})();
