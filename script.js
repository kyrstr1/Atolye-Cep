(() => {
  const $ = (id) => document.getElementById(id);
  const operationSets = {
    lathe: [
      ['outside','Dış çap tornalama',true], ['face','Alın tornalama',false],
      ['inside','İç çap işleme / delik büyütme',true], ['step','Kademeli tornalama',true]
    ],
    mill: [
      ['surface','Düz yüzey frezeleme',false], ['thickness','Kalınlık düşürme',false],
      ['channel','Kanal açma',false], ['stepMill','Kademe frezeleme',false]
    ]
  };
  let machine = 'lathe';
  const numericIds = ['current','target','depth','rough','finish'];
  const val = id => Number($(id).value);
  const unit = () => $('units').value;
  const unitName = () => unit() === 'mm' ? 'mm' : 'inç';
  const fmt = n => {
    if (!Number.isFinite(n)) return '—';
    const places = unit() === 'mm' ? 3 : 4;
    return Number(n.toFixed(places)).toString().replace('.', ',');
  };
  const opInfo = () => operationSets[machine].find(o => o[0] === $('operation').value) || operationSets[machine][0];
  function setUnitLabels() {
    document.querySelectorAll('.input-wrap span').forEach(el => el.textContent = unitName());
    document.querySelectorAll('.hint').forEach(el => {});
    updateMini();
  }
  function updateMini() {
    const isDia = machine === 'lathe' && opInfo()[2];
    document.querySelector('.radio-row').hidden = !isDia;
    const symbol = isDia ? 'Ø ' : '';
    document.querySelector('.dim-start').textContent = symbol + (Number.isFinite(val('current')) ? fmt(val('current')) : '—');
    document.querySelector('.dim-end').textContent = symbol + (Number.isFinite(val('target')) ? fmt(val('target')) : '—');
    $('depthNote').textContent = isDia
      ? 'Tornada çap için radyal talaş derinliği, ölçü çapını bunun iki katı kadar değiştirir.'
      : 'Talaş derinliği, işlenen yüzeyden ölçülür. Hesap tek ölçü ekseninde yapılır.';
    document.querySelectorAll('.radio-row label span')[0].textContent = isDia ? 'Radyal / yüzeyden' : 'Yüzeyden derinlik';
    document.querySelectorAll('.radio-row label span')[1].textContent = isDia ? 'Çap / toplam genişlik' : 'Ölçü ekseni';
    document.querySelector('.mini-label').innerHTML = `${machine === 'lathe' ? 'TAKIM İLERLEMESİ' : 'TAKIM İLERLEMESİ'} <b>→</b>`;
  }
  function renderDrawing(result) {
    const svg = $('drawContent');
    const isDia = machine === 'lathe' && opInfo()[2];
    const a = result ? result.start : val('current'), b = result ? result.target : val('target');
    const diff = Math.abs(a - b);
    $('drawingType').textContent = `${machine === 'lathe' ? 'TORNA' : 'FREZE'} · ${opInfo()[1].toLocaleUpperCase('tr-TR')}`;
    const measure = `${isDia ? 'Ø ' : ''}${fmt(a)} → ${fmt(b)} ${unitName()}`;
    if (machine === 'lathe' && $('operation').value==='inside') {
      const scale=34/Math.max(a,b), bore0=a*scale, bore1=b*scale;
      svg.innerHTML = `<circle cx="212" cy="101" r="43" fill="#42637a"/><circle cx="212" cy="101" r="${bore1}" fill="#182734"/><path d="M ${212-bore1} 101 a ${bore1} ${bore1} 0 1 0 ${2*bore1} 0 a ${bore1} ${bore1} 0 1 0 -${2*bore1} 0 M ${212-bore0} 101 a ${bore0} ${bore0} 0 1 1 ${2*bore0} 0 a ${bore0} ${bore0} 0 1 1 -${2*bore0} 0" fill="url(#hatch)" fill-rule="evenodd"/><line x1="62" y1="45" x2="362" y2="45" stroke="#d9e2e8" marker-start="url(#arrow)" marker-end="url(#arrow)"/><text x="212" y="37" fill="#eaf0f4" text-anchor="middle" font-size="11">${measure}</text><path d="M340 157h-36l-13 15h62z" fill="#f2ab69"/><path d="M321 155v-16" stroke="#f2ab69" stroke-width="2"/><text x="320" y="185" fill="#a8b7c2" text-anchor="middle" font-size="10">İÇ TAKIM · ilerleme →</text>`;
    } else if (machine === 'lathe') {
      const radius = isDia ? Math.max(14, Math.min(35, 18 + diff * 2)) : 30;
      const y = 95 - radius;
      svg.innerHTML = `<rect x="62" y="${y}" width="300" height="${radius*2}" rx="${radius}" fill="#42637a"/><rect x="62" y="${y}" width="300" height="${Math.min(10,Math.max(4,diff*2))}" fill="url(#hatch)"/><line x1="62" y1="45" x2="362" y2="45" stroke="#d9e2e8" marker-start="url(#arrow)" marker-end="url(#arrow)"/><text x="212" y="37" fill="#eaf0f4" text-anchor="middle" font-size="11">${measure}</text><path d="M327 ${Math.min(155,y+radius+24)}h-38l-13 15h64z" fill="#f2ab69"/><path d="M319 ${Math.min(153,y+radius+22)}v-${Math.max(10,diff*2)}" stroke="#f2ab69" stroke-width="2"/><text x="312" y="185" fill="#a8b7c2" text-anchor="middle" font-size="10">TAKIM · ilerleme →</text>`;
    } else {
      const top = Math.max(50, 70 + Math.min(25, diff * 2));
      svg.innerHTML = `<rect x="62" y="${top}" width="300" height="${155-top}" rx="3" fill="#42637a"/><rect x="62" y="${top}" width="300" height="${Math.max(5,Math.min(16,diff*2))}" fill="url(#hatch)"/><line x1="62" y1="45" x2="362" y2="45" stroke="#d9e2e8" marker-start="url(#arrow)" marker-end="url(#arrow)"/><text x="212" y="37" fill="#eaf0f4" text-anchor="middle" font-size="11">${measure}</text><path d="M300 52h55l-14 16h-55z" fill="#f2ab69"/><path d="M316 68v16" stroke="#f2ab69" stroke-width="2"/><text x="320" y="180" fill="#a8b7c2" text-anchor="middle" font-size="10">TAKIM İLERLEMESİ ↓</text>`;
    }
  }
  function setMachine(next) {
    machine = next;
    document.querySelectorAll('.machine-card').forEach(card => card.classList.toggle('active', card.dataset.machine === machine));
    $('operation').innerHTML = operationSets[machine].map(o => `<option value="${o[0]}">${o[1]}</option>`).join('');
    updateMini(); renderDrawing(null); calculate(false);
  }
  function error(message) {
    $('error').textContent = message; $('error').hidden = false; $('results').hidden = true;
  }
  function calculate(showError = true) {
    const names = {current:'Mevcut ölçü',target:'Hedef ölçü',depth:'Paso derinliği',rough:'Kaba sonrası pay',finish:'Bitirme payı'};
    for (const id of numericIds) {
      const n = val(id);
      if (!Number.isFinite(n) || $(id).value.trim() === '') return showError ? error(`${names[id]} için geçerli bir sayı gir.`) : null;
      if (id === 'rough' || id === 'finish') { if (n < 0) return showError ? error(`${names[id]} negatif olamaz. Sıfır veya daha büyük bir değer gir.`) : null; }
      else if (n <= 0) return showError ? error(`${names[id]} sıfırdan büyük olmalı.`) : null;
    }
    const start=val('current'), target=val('target'), depth=val('depth'), rough=val('rough'), finish=val('finish');
    const isDia = machine === 'lathe' && opInfo()[2];
    const increasing = machine==='lathe' && $('operation').value==='inside';
    const direction = increasing ? 1 : -1;
    const delta = increasing ? target-start : start-target;
    if (delta <= 0) return showError ? error(increasing ? 'Delik büyütmede hedef çap mevcut çaptan büyük olmalı.' : 'Hedef ölçü mevcut ölçüden küçük olmalı. Bu sürüm malzeme kaldırma hesabı yapar; ölçüyü kontrol et.') : null;
    const reserve=rough+finish;
    if (reserve >= delta) return showError ? error(`Kaba sonrası pay ile bitirme payının toplamı (${fmt(reserve)} ${unitName()}) kaldırılacak farktan (${fmt(delta)} ${unitName()}) küçük olmalı. Payları azalt veya ölçüleri kontrol et.`) : null;
    const mode=document.querySelector('input[name="depthMode"]:checked').value;
    const maxAxis=isDia && mode==='radial' ? depth*2 : depth;
    if (finish > maxAxis + 1e-10) return showError ? error(`Bitirme payı (${fmt(finish)} ${unitName()}) bir pasoda planlanan en büyük ölçü değişiminden (${fmt(maxAxis)} ${unitName()}) büyük. Bitirme payını azalt veya paso derinliğini artır.`) : null;
    const roughRemoval=delta-reserve;
    const roughN=Math.ceil((roughRemoval - 1e-10)/maxAxis);
    const passes=[];
    let measure=start;
    for(let i=0;i<roughN;i++){
      const cut=i===roughN-1 ? roughRemoval-maxAxis*(roughN-1) : maxAxis;
      measure+=direction*cut;
      passes.push({kind:'Kaba paso',cut,measure});
    }
    let roughLeft=rough;
    while(roughLeft>1e-10){const cut=Math.min(maxAxis,roughLeft);measure+=direction*cut;roughLeft-=cut;passes.push({kind:'Yarı finiş (kaba sonrası pay)',cut,measure});}
    if(finish>1e-10){measure+=direction*finish;passes.push({kind:'Bitirme pasosu',cut:finish,measure});}
    else if(Math.abs(measure-target)>1e-8){measure=target;}
    if(passes.length===0 || Math.abs(measure-target)>Math.max(1e-8,Math.abs(target)*1e-10)) return showError ? error('Paso planı hedef ölçüye kapanmadı. Derinlik ve pay değerlerini kontrol et.') : null;
    $('error').hidden=true; $('results').hidden=false;
    $('passCount').textContent=passes.length;
    $('totalRemoval').textContent=`${fmt(delta)} ${unitName()}`;
    $('outCurrent').textContent=`${fmt(start)} ${unitName()}`;
    $('outTarget').textContent=`${fmt(target)} ${unitName()}`;
    $('outDifference').textContent=isDia ? `Ø ${fmt(delta)} ${unitName()} · radyal ${fmt(delta/2)} ${unitName()}` : `${fmt(delta)} ${unitName()}`;
    $('outPreFinish').textContent=finish>0?`${fmt(target-direction*finish)} ${unitName()}`:`${fmt(target)} ${unitName()} (pay yok)`;
    $('formulaTitle').textContent=isDia?'Çap ve radyal talaş':'Ölçü ve paso hesabı';
    $('formulaText').textContent=isDia
      ? `Çap farkı = ${fmt(start)} − ${fmt(target)} = ${fmt(delta)} ${unitName()}. Radyal kaldırma = çap farkı ÷ 2 = ${fmt(delta/2)} ${unitName()}. Radyal seçilen paso derinliği çapta 2× değişime karşılık gelir.`
      : `Toplam kaldırma = ${increasing?'hedef ölçü − mevcut ölçü':'mevcut ölçü − hedef ölçü'} = ${fmt(delta)} ${unitName()}. Kaba pasolar derinlik sınırına bölünür; paylar ayrı adımlarda alınır.`;
    $('planCount').textContent=`${passes.length} ADIM`;
    const items=[`Başlangıç ölçüsünü ${fmt(start)} ${unitName()} olarak al; güvenli bağlamayı ve takım konumunu kontrol et.`];
    passes.forEach((p,i)=>items.push(`${p.kind}: ${fmt(p.cut)} ${unitName()} kaldır → ölçü ${fmt(p.measure)} ${unitName()}.`));
    items.push(`Son ölçüyü kumpas/mikrometre ile kontrol et: hedef ${fmt(target)} ${unitName()}.`);
    $('steps').innerHTML=items.map((s,i)=>`<li><span class="step-index">${String(i+1).padStart(2,'0')}</span><span>${s}</span></li>`).join('');
    $('explanation').textContent=isDia
      ? `Başlangıç çapı ile hedef çap arasındaki fark ${fmt(delta)} ${unitName()}. Bu farkın yarısı olan ${fmt(delta/2)} ${unitName()} radyal yönde kaldırılır. Paso derinliği ${mode==='radial'?'radyal':'çap yönünde'} yorumlandı; gerçek uygunluk takım, malzeme, makine rijitliği ve bağlamaya bağlıdır.`
      : `${opInfo()[1]} seçildi. ${increasing?'Delik çapı büyüdükçe iç yüzeyden malzeme kaldırılır. ':''}Bu basit plan tek bir ölçü ekseninde malzeme kaldırımı varsayar; kanal profilini, takım geometrisini veya yüzey kalitesini modellemez.`;
    renderDrawing({start,target});
    return {start,target,passes};
  }
  document.querySelectorAll('.machine-card').forEach(card=>card.addEventListener('click',()=>setMachine(card.dataset.machine)));
  $('operation').addEventListener('change',()=>{updateMini();renderDrawing(null);calculate(false);});
  numericIds.forEach(id=>$(id).addEventListener('input',()=>{updateMini();renderDrawing(null);}));
  $('units').addEventListener('change',()=>{
    const ratio=unit()==='in'?1/25.4:25.4;
    numericIds.forEach(id=>{$(id).value=String(Number((val(id)*ratio).toPrecision(7)));});
    setUnitLabels(); renderDrawing(null); calculate(false);
  });
  document.querySelectorAll('input[name="depthMode"]').forEach(el=>el.addEventListener('change',()=>updateMini()));
  $('calculate').addEventListener('click',()=>calculate(true));
  $('reset').addEventListener('click',()=>{setMachine('lathe');$('current').value='40';$('target').value='30';$('depth').value='1';$('rough').value='0';$('finish').value='0.2';$('units').value='mm';document.querySelector('input[value="radial"]').checked=true;setUnitLabels();calculate(false);});
  document.querySelectorAll('.example').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.example;
    $('units').value='mm'; setUnitLabels();
    if(id==='shaft'){setMachine('lathe');$('operation').value='outside';$('current').value='40';$('target').value='30';$('depth').value='1';$('rough').value='0.4';$('finish').value='0.2';document.querySelector('input[value="radial"]').checked=true;}
    if(id==='thickness'){setMachine('mill');$('operation').value='thickness';$('current').value='25';$('target').value='20';$('depth').value='1';$('rough').value='0.5';$('finish').value='0.2';}
    if(id==='channel'){setMachine('mill');$('operation').value='channel';$('current').value='12';$('target').value='10';$('depth').value='0.5';$('rough').value='0.2';$('finish').value='0.1';}
    updateMini();renderDrawing(null);calculate(false);document.querySelector('.input-panel').scrollIntoView({behavior:'smooth',block:'start'});
  }));
  setMachine('lathe'); setUnitLabels(); calculate(false);
})();
