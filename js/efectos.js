(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Archivos embebidos: CV en PDF y video
  function b64ToUrl(id, type){
    var el=document.getElementById(id); if(!el) return null;
    var bin=atob(el.textContent.trim()), arr=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr],{type:type}));
  }
  var pdf=b64ToUrl('fx-pdf','application/pdf');
  document.querySelectorAll('a[data-cv]').forEach(function(a){ if(pdf){a.href=pdf;a.target='_blank';a.rel='noopener';} });
  var vid=b64ToUrl('fx-video','video/mp4');
  var v=document.querySelector('video'); if(v&&vid){ v.src=vid; }

  // Header compacto + barra de progreso
  var header=document.querySelector('header'), bar=document.getElementById('fx-progress'), fab=document.getElementById('fx-fab');
  function onScroll(){
    var y=window.scrollY, h=document.documentElement.scrollHeight-innerHeight;
    header.classList.toggle('fx-scrolled', y>20);
    if(bar) bar.style.transform='scaleX('+(h>0?y/h:0)+')';
    if(fab) fab.classList.toggle('fx-show', y>innerHeight*0.6);
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // El retrato y su círculo entran juntos, recién cuando la foto terminó de cargar
  var photo=document.querySelector('.fx-photo');
  if(photo){ var im=photo.querySelector('img'); var go=function(){photo.classList.add('fx-go');};
    if(reduce){ photo.style.opacity=1; } else if(im.complete){ (im.decode?im.decode():Promise.resolve()).then(go,go); } else { im.addEventListener('load',go); } }

  if(reduce) return;

  // Aparición escalonada al hacer scroll
  var groups=[
    '#especialidades h2','#especialidades h2 + p','#especialidades article','#especialidades article ~ div',
    '#trayectoria h2','#trayectoria figure','#trayectoria article',
    '#formacion h2','#formacion ol > li',
    '#mit h2','#mit video',
    '#investigacion h2','#investigacion article','#investigacion li',
    '[aria-label="Distinciones"] figure','[aria-label="Distinciones"] h2','[aria-label="Distinciones"] [style*="border-radius: 14px"]',
    '#turnos h2','#turnos article','#contacto h2','#contacto form'
  ];
  var els=[]; groups.forEach(function(sel){ document.querySelectorAll(sel).forEach(function(e){ if(els.indexOf(e)<0) els.push(e); }); });
  els.forEach(function(e){
    e.classList.add('fx-rv');
    var sib=e.parentElement?Array.prototype.indexOf.call(e.parentElement.children,e):0;
    e.style.transitionDelay=Math.min(sib,6)*90+'ms';
  });
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('fx-in'); io.unobserve(en.target);} });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(e){ io.observe(e); });

  // Contadores animados en la franja de cifras
  var nums=document.querySelectorAll('[aria-label="Datos destacados"] p:first-child');
  var co=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return; co.unobserve(en.target);
      var el=en.target, m=el.textContent.match(/^(\d+)(.*)$/); if(!m) return;
      var end=+m[1], suf=m[2], t0=null, dur=1600;
      function step(t){ if(!t0)t0=t; var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
        el.textContent=Math.round(end*e).toLocaleString('es-AR')+suf; if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  },{threshold:.6});
  nums.forEach(function(n){ co.observe(n); });

})();
