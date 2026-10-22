/* Hotel Digital Perú - Interactividad 2026 (vanilla, sin dependencias) */
(function(){
  "use strict";

  /* 1. Barra de progreso */
  var progress = document.createElement("div");
  progress.id = "hd-progress";
  document.body.prepend(progress);
  function onScrollProgress(){
    var h = document.documentElement;
    var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = pct + "%";
  }
  window.addEventListener("scroll", onScrollProgress, {passive:true});

  /* 2. Reveal on scroll */
  var revealEls = document.querySelectorAll(".hd-reveal");
  if("IntersectionObserver" in window && revealEls.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    },{threshold:.12});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("visible"); });
  }

  /* 3. Contadores animados */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400, start = null;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = target * eased;
      el.textContent = (target % 1 !== 0 ? val.toFixed(1) : Math.round(val).toLocaleString("es-PE")) + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if("IntersectionObserver" in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
      });
    },{threshold:.4});
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* 4. FAQ acordeón (también genera SEO) */
  document.querySelectorAll(".hd-faq-item").forEach(function(item){
    var btn = item.querySelector(".hd-faq-q");
    var ans = item.querySelector(".hd-faq-a");
    if(!btn) return;
    btn.addEventListener("click", function(){
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".hd-faq-item.open").forEach(function(o){
        o.classList.remove("open");
        o.querySelector(".hd-faq-a").style.maxHeight = null;
        o.querySelector(".hd-faq-q").setAttribute("aria-expanded","false");
      });
      if(!isOpen){
        item.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + "px";
        btn.setAttribute("aria-expanded","true");
      }
    });
  });

  /* 5. Vista de cuartos: selecciona y gestiona */
  var rooms = document.querySelectorAll(".hd-room");
  var rdNum = document.getElementById("hd-rd-num");
  var rdTipo = document.getElementById("hd-rd-tipo");
  var rdEstado = document.getElementById("hd-rd-estado");
  var rdHuesped = document.getElementById("hd-rd-huesped");
  var currentRoom = document.querySelector(".hd-room.selected") || rooms[0];
  var huespedes = {"102":"👤 Juan P. • 2 noches","105":"👤 María G. • 1 noche","202":"👤 Carlos R. • 3 noches"};
  function estadoLabel(s){ return s==="libre"?"Libre":s==="ocupada"?"Ocupada":"Limpieza"; }
  function renderDetail(room){
    if(!room || !rdNum) return;
    var num = room.dataset.num, tipo = room.dataset.tipo || "Estándar", precio = room.dataset.precio || "80";
    var estado = room.classList.contains("ocupada")?"ocupada":room.classList.contains("limpieza")?"limpieza":"libre";
    rdNum.textContent = "Hab. "+num;
    rdTipo.textContent = tipo+" • S/ "+precio+" / noche";
    rdEstado.textContent = estadoLabel(estado);
    rdEstado.className = "hd-estado "+estado;
    if(estado==="ocupada"){ rdHuesped.textContent = huespedes[num] || "👤 Huésped registrado • En curso"; }
    else if(estado==="limpieza"){ rdHuesped.textContent = "🧹 En limpieza • Lista en ~30 min"; }
    else { rdHuesped.textContent = "✅ Lista para check-in"; }
  }
  rooms.forEach(function(room){
    room.addEventListener("click", function(){
      rooms.forEach(function(r){ r.classList.remove("selected"); });
      room.classList.add("selected");
      currentRoom = room;
      renderDetail(room);
    });
  });
  document.querySelectorAll(".hd-rd-actions button").forEach(function(btn){
    btn.addEventListener("click", function(){
      if(!currentRoom) return;
      var acc = btn.dataset.acc;
      currentRoom.classList.remove("libre","ocupada","limpieza");
      currentRoom.classList.add(acc);
      currentRoom.setAttribute("aria-label","Habitación "+currentRoom.dataset.num+" "+acc);
      renderDetail(currentRoom);
      updateDemoStats();
    });
  });
  renderDetail(currentRoom);
  function updateDemoStats(){
    var libres = document.querySelectorAll(".hd-room.libre").length;
    var ocup = document.querySelectorAll(".hd-room.ocupada").length;
    var oEl = document.getElementById("hd-occ");
    if(oEl && (libres+ocup)>0){
      oEl.textContent = Math.round(ocup/(libres+ocup)*100) + "%";
    }
  }

  /* 6. Simulador de ingresos */
  var rHab = document.getElementById("sim-hab");
  var rPrecio = document.getElementById("sim-precio");
  var rOcup = document.getElementById("sim-ocup");
  function calcSim(){
    if(!rHab) return;
    var hab = parseInt(rHab.value,10);
    var precio = parseInt(rPrecio.value,10);
    var ocup = parseInt(rOcup.value,10);
    document.getElementById("sim-hab-v").textContent = hab;
    document.getElementById("sim-precio-v").textContent = "S/ "+precio;
    document.getElementById("sim-ocup-v").textContent = ocup+"%";
    var mensual = hab * precio * 30 * (ocup/100);
    document.getElementById("sim-result").textContent = "S/ " + Math.round(mensual).toLocaleString("es-PE");
    document.getElementById("sim-anual").textContent = "S/ " + Math.round(mensual*12).toLocaleString("es-PE") + " al año";
  }
  [rHab,rPrecio,rOcup].forEach(function(r){ if(r) r.addEventListener("input", calcSim); });
  calcSim();

  /* 7. Toggle precios mensual/anual */
  var tBtns = document.querySelectorAll(".hd-price-toggle button");
  tBtns.forEach(function(b){
    b.addEventListener("click", function(){
      tBtns.forEach(function(x){ x.classList.remove("active"); });
      b.classList.add("active");
      var mode = b.dataset.plan;
      document.querySelectorAll(".single-price-plan").forEach(function(card){
        if(mode === "mensual"){
          card.style.display = card.dataset.plan === "mensual" ? "" : "none";
        } else if(mode === "anual"){
          card.style.display = card.dataset.plan === "anual" ? "" : "none";
        } else {
          card.style.display = "";
        }
      });
    });
  });

  /* 8. Nav activa según sección */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".navbar-nav.items .nav-link");
  function setActiveNav(){
    var pos = window.scrollY + 140;
    var current = "";
    sections.forEach(function(s){ if(s.offsetTop <= pos) current = s.id; });
    navLinks.forEach(function(a){
      a.classList.toggle("active", a.getAttribute("href") === "#"+current);
      if(a.getAttribute("href") === "#"+current){ a.style.color = "#C9A86A"; } else { a.style.color = ""; }
    });
  }
  window.addEventListener("scroll", setActiveNav, {passive:true});

  /* 9. Año dinámico + lazy nativo */
  document.querySelectorAll("img:not([loading])").forEach(function(img){ img.setAttribute("loading","lazy"); });
  var yearEl = document.getElementById("hd-year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

})();
