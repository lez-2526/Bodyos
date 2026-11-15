'use strict';
const KEY='bodyos.v1',$=s=>document.querySelector(s);
const iso=d=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const today=()=>iso(new Date()),dn=n=>{const d=new Date();d.setDate(d.getDate()-n);return iso(d)};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const DEF={profile:{h:171,w:62,goal:67,protein:110,kcal:2700,units:'kg',theme:'auto'},weights:[],days:{},meals:[],workouts:[],pantry:[],fav:[],measures:[],cur:null,last:null};
const load=()=>{try{const r=JSON.parse(localStorage.getItem(KEY));return r?{...structuredClone(DEF),...r,profile:{...DEF.profile,...r.profile}}:structuredClone(DEF)}catch(e){return structuredClone(DEF)}};
let S=load();const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const lb=S=>S.profile.units==='lb';
const wv=v=>lb(S)?(v*2.20462).toFixed(1)+' фунт':(+v).toFixed(1)+' кг';
const toKg=x=>lb(S)?x/2.20462:+x;
const day=(d=today())=>S.days[d]||(S.days[d]={am:{},pm:{}});
const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const sum=(a,k)=>a.reduce((s,m)=>s+(+m[k]||0),0);
const curW=()=>S.weights.length?S.weights[S.weights.length-1].v:S.profile.w;
// ---- данные
const CAT=[['яйца',155,13],['куриная грудка варёная',165,31],['творог 5%',120,17],['молоко 2,5%',52,3],['кефир 2,5%',53,3],['сыр',350,25],['сухое молоко',360,26],['тунец консервированный',130,28],['фарш говяжий (готовый)',250,18],['гречка варёная',110,4],['рис варёный',130,2.7],['макароны варёные',160,5.5],['овсянка (сухая)',370,13],['картофель варёный',80,2],['хлеб',250,8],['банан',90,1.1],['арахисовая паста',590,25],['растительное масло',884,0]];
const cat=n=>CAT.find(c=>c[0]===n);
const REC=[['Омлет с сыром и хлебом',[['яйца',165],['сыр',30],['хлеб',60]],'Взбейте яйца вилкой, пожарьте, сверху сыр. Хлеб — отдельно.',['яйца']],
['Гречка с курицей',[['гречка варёная',250],['куриная грудка варёная',120],['растительное масло',10]],'Смешайте тёплую гречку и нарезанную курицу, добавьте масло.',['гречка','куриная']],
['Рис с тунцом и яйцами',[['рис варёный',250],['тунец консервированный',80],['яйца',110]],'Рис смешать с тунцом, сверху варёные яйца.',['рис','тунец']],
['Овсянка на молоке с арахисовой пастой',[['овсянка (сухая)',60],['молоко 2,5%',250],['банан',100],['арахисовая паста',20]],'Варите овсянку 5 минут на молоке, добавьте пасту и нарезанный банан.',['овсянка','молоко']],
['Шейкер: молоко и сухое молоко',[['молоко 2,5%',300],['сухое молоко',40],['арахисовая паста',15]],'Все в шейкер, энергично встряхните 30 секунд. Блендер не нужен.',['молоко','сухое']],
['Творог с бананом',[['творог 5%',200],['банан',100]],'Банан разомните вилкой и смешайте с творогом.',['творог']],
['Макароны с фаршем',[['макароны варёные',250],['фарш говяжий (готовый)',120],['растительное масло',10]],'Обжарьте фарш, смешайте с макаронами.',['макароны','фарш']],
['Картофель с яйцами',[['картофель варёный',300],['яйца',110],['растительное масло',10]],'Разомните картофель, добавьте яйца, обжарьте.',['картофель','яйца']]];
const TIPS=['Добавляйте ложку масла или арахисовой пасты в кашу и гарнир: +100–180 ккал почти без объёма.','Пейте калорийное: молоко со сухим молоком в шейкере — около 250–300 ккал и 20 г белка.','Белок распределяйте на 3–4 приёма по 25–35 г: например яйца, творог, курица, тунец.','В длинную смену берите готовое с собой: варёные яйца, бутерброд с сыром, банан, шейкер с сухим молоком.','Если вес не растёт 2 недели, добавьте 150–250 ккал в день. Если растёт быстрее 0,5 кг в неделю — слегка уменьшите.'];
const EX={A:[['a1','Подтягивания','Широчайшие, бицепс, предплечья',3,'2–4','2–3 мин','Хват чуть шире плеч, лопатки вниз, подбородок над перекладиной, спуск 2–3 секунды.','Негативные подтягивания (спуск 4–5 с с опорой ногой) или вис 15–20 с.','Пауза 1 с вверху, 5 повторов, затем медленные спуски.'],
['a2','Отжимания','Грудь, трицепс, передняя дельта',3,'8–10','90 с','Тело прямой линией, локти под углом ~45°, грудь к полу.','Руки на стол или диван.','Ноги на возвышении или спуск 3 секунды.'],
['a3','Болгарские сплит-приседания','Квадрицепс, ягодицы',3,'8 на ногу','90 с','Задняя нога на стуле, корпус прямой, колено не заваливается внутрь.','Без опоры для задней ноги, меньшая глубина.','Гиря в руке у груди.'],
['a4','Тяга гири одной рукой','Спина, задняя дельта, бицепс',3,'10 на сторону','75 с','Свободная рука на опоре, спина ровная, тяните локоть к поясу.','Меньше повторов и без паузы.','Пауза 2 с вверху.'],
['a5','Ягодичный мост','Ягодицы, задняя поверхность бедра',3,'12–15','60 с','Лёжа, стопы у таза, поднимайте таз, сожмите ягодицы вверху.','Меньшая амплитуда.','Гиря на тазе или одна нога.'],
['a6','Планка','Кор, пресс',3,'20–40 с','45 с','Локти под плечами, таз не провисает, дышите ровно.','Планка с колен.','Дольше 45 с или касания плеч.']],
B:[['b1','Подтягивания (хват к себе)','Бицепс, широчайшие',3,'по возможностям','2–3 мин','Ладони к себе на ширине плеч, остановитесь, не доходя 1–2 повторов до отказа.','Негативные повторы или вис.','Добавьте повтор или паузу вверху.'],
['b2','Жим гири одной рукой стоя','Плечи, трицепс, кор',3,'6–8 на сторону','90 с','Гиря у плеча, жмите вверх, не прогибайтесь в пояснице.','Жим сидя или 5 повторов.','Жим в 3 секунды вниз.'],
['b3','Гоблет-приседание с гирей','Квадрицепс, ягодицы',3,'10–12','90 с','Гиря у груди, колени по линии носков, глубина без боли.','Приседание без гири на стул.','Пауза 2 с внизу.'],
['b4','Отжимания узкой постановкой','Трицепс, грудь',3,'6–8','90 с','Ладони под плечами, локти вдоль тела.','Руки на возвышении.','Ноги выше уровня рук.'],
['b5','Тяга гири двумя руками к поясу','Спина, бицепс',3,'10–12','75 с','Наклон корпуса, спина ровная, гиря к низу живота.','Меньше повторов.','Пауза 2 с вверху.'],
['b6','Боковая планка','Косые мышцы, кор',2,'20–30 с на сторону','45 с','Корпус одной линией, таз не опускается.','С колена.','Подъём верхней руки.'],
['b7','Лопаточные подтягивания на турнике','Нижняя трапеция, мышцы лопаток',2,'8–10','60 с','В висе сведите лопатки вниз, руки прямые.','Вис 15 с.','С паузой 2 с.']]};
const SKIN=['Сухость','Жирный блеск','Воспаления','Чёрные точки/поры','Раздражение'];
// ---- статистика
function week(a=0){const ds=Array.from({length:7},(_,i)=>dn(a+i));
const ws=S.weights.filter(x=>ds.includes(x.d)).map(x=>x.v),pr=ds.map(d=>sum(S.meals.filter(m=>m.d===d),'p')).filter(x=>x>0);
const care=ds.reduce((s,d)=>{const k=S.days[d];return s+(k?Object.values(k.am).filter(Boolean).length+Object.values(k.pm).filter(Boolean).length:0)},0);
return{w:avg(ws),pr:avg(pr),tr:S.workouts.filter(x=>ds.includes(x.d)).length,care:Math.round(care/35*100),sl:avg(ds.map(d=>+(S.days[d]||{}).sleep).filter(x=>x>0))}}
const nextT=()=>S.last==='A'?'B':'A';
// ---- представления
const V={};
V.home=()=>{const w=week(),w0=week(7),lw=S.workouts[S.workouts.length-1],d=day(),p=S.profile,m=S.meals.filter(x=>x.d===today());
const ch=w.w!=null&&w0.w!=null?(w.w-w0.w):null,prog=Math.min(100,Math.max(0,(curW()-p.w)/(p.goal-p.w)*100||0));
return`<h1>BODY OS</h1><p class="mute">${new Date().toLocaleDateString('ru',{weekday:'long',day:'numeric',month:'long'})}</p>
<div class="card"><div class="mute">Текущий вес</div><div class="big">${wv(curW())}</div><p class="mute">Цель: ${wv(p.goal)} · старт ${wv(p.w)}</p><div class="bar"><i style="width:${prog}%"></i></div></div>
<div class="row"><button class="p" data-a="qw">+ Вес</button><button data-a="go" data-h="#/food">+ Еда</button><button data-a="go" data-h="#/train">Тренировка</button><button data-a="go" data-h="#/diary">Запись</button></div>
<div class="card"><h3>Тренировки</h3><p class="mute">Последняя: ${lw?`${lw.t} · ${lw.d}`:'пока нет'}<br>Следующая: <b>${nextT()}</b></p><button class="p" data-a="go" data-h="#/train">Открыть тренировку ${nextT()}</button></div>
<div class="card"><h3>Уход сегодня</h3><p class="mute">Утро: ${Object.values(d.am).filter(Boolean).length}/3 · Вечер: ${Object.values(d.pm).filter(Boolean).length}/2</p><button data-a="go" data-h="#/skin">Чек-листы</button></div>
<div class="card"><h3>Сегодня съедено</h3><p>${Math.round(sum(m,'kcal'))} ккал · ${Math.round(sum(m,'p'))} г белка (ориентир ${p.protein} г)</p></div>
<h2>Неделя</h2><div class="card">${S.weights.length||S.workouts.length?`<p>Средний вес: ${w.w!=null?wv(w.w):'нет данных'}${ch!=null?` (${ch>0?'+':''}${ch.toFixed(2)} кг к прошлой)`:''}<br>Тренировок: ${w.tr}<br>Средний белок: ${w.pr!=null?Math.round(w.pr)+' г':'нет данных'}<br>Уход: ${w.care}%</p>`:'<p class="mute">Записей пока нет. Добавьте вес или тренировку.</p>'}</div>`};
V.train=()=>{const c=S.cur;if(!c){const t=nextT();return`<h1>Тренировки</h1><p class="mute">Цикл: A → отдых → B → отдых. Без привязки к дням недели.</p>
<div class="card"><h3>Следующая: ${t}</h3><p class="mute">Как вы себя чувствуете после смены?</p>
<button class="p xl" data-a="start" data-t="${t}" data-m="full">Готов — полная тренировка</button><br><br><button class="xl" data-a="start" data-t="${t}" data-m="light">Устал — короткая лёгкая</button><br><br><button class="xl" data-a="rest">Сегодня отдых</button></div>
<div class="card"><h3>Правила</h3><p class="mute"><b>Разминка (5 мин):</b> круги плечами, кошка-корова, 10 приседаний без веса, 10 отжиманий от стены.<br><b>Заминка:</b> растяжка груди, спины и бёдер по 30 с, спокойное дыхание.<br><b>Запас:</b> заканчивайте подход за 1–3 повтора до отказа.<br><b>Прогрессия:</b> если все подходы выполнены в верхней границе с запасом 2 повтора — добавьте 1 повтор, затем подход, затем сложный вариант.<br><b>Отдых:</b> если сон был короче 5 ч или есть боль — отдых или лёгкая версия. Приложение не гарантирует набор мышц: результат зависит от питания, сна и регулярности.</p></div>${hist()}`}
const L=c.m==='light';return`<h1>Тренировка ${c.t}${L?' · лёгкая':''}</h1><p class="mute">Сначала разминка 5 минут. Оставляйте 1–3 повтора в запасе.</p>
${EX[c.t].map(e=>{const n=L?Math.max(1,Math.round(e[3]*.6)):e[3],r=c.ex[e[0]]||[];return`<div class="card"><h3>${e[1]}</h3><p class="mute">${n} × ${e[4]} · отдых ${e[5]}<br>Мышцы: ${e[2]}</p><div class="sets">${Array.from({length:n},(_,i)=>`<input type="number" inputmode="numeric" min="0" placeholder="повт." data-a="rep" data-e="${e[0]}" data-i="${i}" value="${r[i]??''}">`).join('')}</div>
<label class="chk"><input type="checkbox" data-a="exdone" data-e="${e[0]}" ${c.done[e[0]]?'checked':''}>Выполнено</label><details><summary>Техника и варианты</summary><p>${e[6]}</p><p><b>Проще:</b> ${e[7]}</p><p><b>Сложнее:</b> ${e[8]}</p></details></div>`}).join('')}
<button class="p xl" data-a="finish">Завершить тренировку</button><br><br><button class="xl d" data-a="cancel">Отменить</button>`};
const hist=()=>{const h=S.workouts.slice(-8).reverse();return`<h2>История</h2>${h.length?h.map((w,i,a)=>{const tot=Object.values(w.ex).flat().reduce((s,x)=>s+(+x||0),0),pv=S.workouts.filter(x=>x.t===w.t&&x.d<w.d).pop(),pt=pv?Object.values(pv.ex).flat().reduce((s,x)=>s+(+x||0),0):null;return`<div class="card"><b>${w.d} · ${w.t}${w.m==='light'?' (лёгкая)':''}</b><br><span class="mute">Всего повторов: ${tot}${pt!=null?` (${tot-pt>=0?'+':''}${tot-pt} к прошлой ${w.t})`:''}</span></div>`}).join(''):'<p class="mute">Тренировок ещё не было.</p>'}`};
V.food=()=>{const p=S.profile,m=S.meals.filter(x=>x.d===today()),has=n=>S.pantry.some(x=>x.n.toLowerCase().includes(n.toLowerCase())),rec=REC.filter(r=>r[3].every(has));
const calc=r=>r[1].reduce((a,[n,g])=>{const c=cat(n);return[a[0]+c[1]*g/100,a[1]+c[2]*g/100]},[0,0]);
return`<h1>Питание</h1><div class="card"><div class="big">${Math.round(sum(m,'p'))} г</div><p class="mute">белка из ~${p.protein} г · ${Math.round(sum(m,'kcal'))} ккал (ориентир ${p.kcal}, корректируйте по весу). Значения приблизительные.</p><div class="bar"><i style="width:${Math.min(100,sum(m,'p')/p.protein*100)}%"></i></div></div>
<h2>Добавить приём пищи</h2><div class="card"><datalist id="cat">${CAT.map(c=>`<option value="${c[0]}">`).join('')}</datalist>
<label>Продукт или блюдо</label><input id="mn" list="cat"><div class="row"><div><label>Граммы</label><input id="mg" type="number" inputmode="decimal"></div><div><label>Ккал</label><input id="mk" type="number" inputmode="decimal"></div><div><label>Белок, г</label><input id="mp" type="number" inputmode="decimal"></div></div>
<p class="mute">Для продуктов из каталога ккал и белок подставятся по граммам (≈). Для остальных введите вручную.</p><button class="p xl" data-a="addmeal">Добавить в дневник</button></div>
${m.map((x,i)=>`<div class="card row"><span>${esc(x.n)}${x.g?`, ${x.g} г`:''}<br><span class="mute">≈ ${Math.round(x.kcal)} ккал · ${Math.round(x.p)} г белка</span></span><button class="d" data-a="delmeal" data-i="${S.meals.indexOf(x)}" style="flex:0">✕</button></div>`).join('')}
<h2>Что есть дома</h2><div class="card"><div class="row"><input id="pn" list="cat" placeholder="Продукт"><input id="pg" type="number" inputmode="decimal" placeholder="Граммы" style="max-width:110px"></div><br><button class="p" data-a="addpan">Добавить</button>
${S.fav.length?`<p class="mute">Часто используемые:</p>${S.fav.map(f=>`<button data-a="favadd" data-n="${esc(f)}">${esc(f)}</button> `).join('')}`:''}
${S.pantry.map((x,i)=>`<div class="row"><span>${esc(x.n)} ${x.g?x.g+' г':''}</span><button data-a="fav" data-n="${esc(x.n)}" style="flex:0">${S.fav.includes(x.n)?'★':'☆'}</button><button class="d" data-a="delpan" data-i="${i}" style="flex:0">✕</button></div>`).join('')}</div>
<h2>Варианты блюд</h2>${rec.length?rec.map(r=>{const [k,pr]=calc(r);return`<div class="card"><h3>${r[0]}</h3><p class="mute">${r[1].map(([n,g])=>n+' '+g+' г').join(', ')}<br>≈ ${Math.round(k)} ккал · ${Math.round(pr)} г белка</p><p>${r[2]}</p><button data-a="eat" data-n="${esc(r[0])}" data-k="${Math.round(k)}" data-p="${Math.round(pr)}">Съел — добавить в дневник</button></div>`}).join(''):'<p class="mute">Добавьте продукты дома (яйца, гречка, молоко, творог…) — появятся варианты без блендера.</p>'}
<h2>Как набрать больше</h2>${TIPS.map(t=>`<p>• ${t}</p>`).join('')}<p class="mute">Каталог — округлённые значения на 100 г готового продукта. Реальные цифры смотрите на упаковке.</p>`};
V.skin=()=>{const d=day(),sk=d.skin||(d.skin={pr:[]}),A=['Мягкое очищение (по необходимости)','Увлажняющий крем','SPF 30–50'],P=['Мягкое очищение','Увлажняющий крем'],ck=(g,i,t)=>`<label class="chk"><input type="checkbox" data-a="care" data-g="${g}" data-i="${i}" ${d[g][i]?'checked':''}>${t}</label>`;
return`<h1>Уход за лицом</h1><div class="card"><h3>Утро</h3>${A.map((t,i)=>ck('am',i,t)).join('')}</div><div class="card"><h3>Вечер</h3>${P.map((t,i)=>ck('pm',i,t)).join('')}
<label class="chk"><input type="checkbox" data-a="sa" ${d.sa?'checked':''}>Салициловая кислота (необязательно)</label><p class="mute">Начните с 0,5–2% и 2 раз в неделю, только если кожа переносит. Не вводите несколько активных средств сразу.</p></div>
<h2>Состояние кожи сегодня</h2><div class="card">${SKIN.map(s=>`<button data-a="sk" data-s="${s}" class="${sk.pr.includes(s)?'p':''}" style="margin:3px">${s}</button>`).join('')}<label>Раздражение от ухода</label><select data-a="irr">${['нет','слабое','заметное'].map((t,i)=>`<option value="${i}" ${sk.irr==i?'selected':''}>${t}</option>`).join('')}</select></div>
<div class="card"><p class="mute">Тёмные круги и мешки часто связаны со строением лица, наследственностью и сном: косметика не гарантирует их устранение. Морщины замедляет ежедневный SPF. При выраженных, болезненных или рубцующихся высыпаниях обратитесь к дерматологу.</p></div>`};
V.diary=()=>{const d=day(),t=S.measures[S.measures.length-1]||{};return`<h1>Дневник</h1><div class="card"><div class="row"><div><label>Сон, часов</label><input type="number" step="0.5" data-a="dsleep" value="${d.sleep??''}"></div><div><label>Энергия 1–5</label><select data-a="den">${['','1','2','3','4','5'].map(v=>`<option ${d.en==v?'selected':''}>${v}</option>`).join('')}</select></div></div><label>Заметка</label><textarea rows="3" data-a="dnote">${esc(d.note||'')}</textarea></div>
<h2>Вес</h2><div class="card"><div class="row"><input id="dw" type="number" step="0.1" inputmode="decimal" placeholder="${lb(S)?'фунты':'кг'}"><button class="p" data-a="addw" style="flex:0">Записать</button></div>${S.weights.slice(-6).reverse().map(x=>`<p class="mute">${x.d}: ${wv(x.v)}</p>`).join('')}</div>
<h2>Замеры, см</h2><div class="card"><div class="row">${[['chest','Грудь'],['waist','Талия'],['shoulders','Плечи'],['arm','Рука'],['thigh','Бедро']].map(([k,n])=>`<div style="min-width:30%"><label>${n}</label><input id="m_${k}" type="number" step="0.5" inputmode="decimal" placeholder="${t[k]??''}"></div>`).join('')}</div><br><button class="p" data-a="addm">Сохранить замеры</button>${S.measures.slice(-3).reverse().map(x=>`<p class="mute">${x.d}: грудь ${x.chest??'–'}, талия ${x.waist??'–'}, плечи ${x.shoulders??'–'}, рука ${x.arm??'–'}, бедро ${x.thigh??'–'}</p>`).join('')}</div>`};
function report(){const p=S.profile,w=week(),w0=week(7),L=[];
L.push('ОТЧЁТ BODY OS ('+today()+')','','ИСХОДНЫЕ ПАРАМЕТРЫ','Рост '+p.h+' см, старт '+wv(p.w)+', сейчас '+wv(curW())+', цель '+wv(p.goal),'Новичок, домашние тренировки (гиря 7 кг, турник, коврик). Работа: смены по 13 часов, плавающий график.','');
L.push('ВЕС','Средний за 7 дней: '+(w.w!=null?wv(w.w):'нет данных')+'; за предыдущие 7: '+(w0.w!=null?wv(w0.w):'нет данных'),'Последние записи: '+(S.weights.slice(-8).map(x=>x.d+' '+x.v).join('; ')||'нет'),'');
L.push('ТРЕНИРОВКИ (последние)',...(S.workouts.slice(-6).map(x=>x.d+' '+x.t+(x.m==='light'?' (лёгкая)':'')+': '+Object.entries(x.ex).map(([k,v])=>k+' '+v.join('/')).join(', '))),S.workouts.length?'':'нет записей','За 7 дней: '+w.tr,'');
L.push('ПИТАНИЕ','Средний белок за 7 дней: '+(w.pr!=null?Math.round(w.pr)+' г (ориентир '+p.protein+')':'нет данных'),'Ориентир ккал: '+p.kcal+' (приблизительно)','');
L.push('СОН И САМОЧУВСТВИЕ','Средний сон: '+(w.sl!=null?w.sl.toFixed(1)+' ч':'нет данных'),'Заметки: '+(Object.entries(S.days).filter(([,v])=>v.note).slice(-5).map(([k,v])=>k+': '+v.note).join(' | ')||'нет'),'');
L.push('КОЖА','Регулярность ухода за 7 дней: '+w.care+'%','Проблемы: '+(Object.entries(S.days).filter(([,v])=>v.skin&&v.skin.pr.length).slice(-7).map(([k,v])=>k+': '+v.skin.pr.join(', ')).join(' | ')||'нет записей'),'');
const m=S.measures.slice(-2);L.push('ЗАМЕРЫ',m.length?m.map(x=>JSON.stringify(x)).join('\n'):'нет','');
L.push('ВОПРОСЫ','1. Достаточно ли набора веса по моей динамике?','2. Как скорректировать калории и белок?','3. Нужно ли изменить нагрузку в тренировках A/B?','4. Нужны ли изменения в уходе за кожей?');return L.join('\n')}
V.report=()=>`<h1>Отчёт для ChatGPT</h1><p class="mute">Приложение не подключено к ChatGPT. Нажмите кнопку, скопируйте текст и вставьте его в чат самостоятельно.</p><button class="p xl" data-a="rep">Сформировать отчёт для ChatGPT</button>${window._rep?`<div class="row" style="margin-top:12px"><button data-a="copy">Копировать</button><button data-a="dl">Скачать .txt</button></div><pre>${esc(window._rep)}</pre>`:''}`;
V.settings=()=>{const p=S.profile;return`<h1>Настройки</h1><div class="card"><div class="row"><div><label>Рост, см</label><input type="number" data-a="set" data-k="h" value="${p.h}"></div><div><label>Стартовый вес, кг</label><input type="number" step="0.1" data-a="set" data-k="w" value="${p.w}"></div></div><div class="row"><div><label>Цель, кг</label><input type="number" step="0.1" data-a="set" data-k="goal" value="${p.goal}"></div><div><label>Белок, г/сут</label><input type="number" data-a="set" data-k="protein" value="${p.protein}"></div></div><label>Ккал/сут (ориентир)</label><input type="number" data-a="set" data-k="kcal" value="${p.kcal}">
<label>Единицы веса</label><select data-a="set" data-k="units"><option value="kg" ${p.units=='kg'?'selected':''}>кг</option><option value="lb" ${p.units=='lb'?'selected':''}>фунты</option></select><label>Тема</label><select data-a="set" data-k="theme">${[['auto','Системная'],['light','Светлая'],['dark','Тёмная']].map(([v,t])=>`<option value="${v}" ${p.theme==v?'selected':''}>${t}</option>`).join('')}</select></div>
<h2>Данные</h2><div class="card"><button class="xl" data-a="exp">Скачать резервную копию (JSON)</button><br><br><label>Восстановить из JSON</label><input type="file" accept=".json,application/json" data-a="imp"><br><br><button class="xl d" data-a="wipe">Удалить все данные</button></div><p class="mute">Данные хранятся только на этом устройстве, в браузере. Напоминания не реализованы: веб-приложение не может надёжно присылать их без сервера.</p>`};
V.more=()=>`<h1>Ещё</h1><a class="btn xl" href="#/diary" style="display:flex;margin:10px 0">Дневник и замеры</a><a class="btn xl" href="#/report" style="display:flex;margin:10px 0">Отчёт для ChatGPT</a><a class="btn xl" href="#/settings" style="display:flex;margin:10px 0">Настройки</a>`;
// ---- рендер и события
function render(){const r=(location.hash||'#/home').slice(2);const v=V[r]?r:'home';$('#app').innerHTML=V[v]();const nv=['diary','report','settings'].includes(v)?'more':v;document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#/'+nv));
const t=S.profile.theme;t==='auto'?document.documentElement.removeAttribute('data-theme'):document.documentElement.setAttribute('data-theme',t)}
const dl=(n,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),999)};
const num=id=>{const v=parseFloat(String($('#'+id).value).replace(',','.'));return isNaN(v)?null:v};
document.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a,x=b.dataset;
if(a==='go')location.hash=x.h;
else if(a==='qw'){const v=parseFloat(String(prompt('Вес ('+(lb(S)?'фунты':'кг')+'):')||'').replace(',','.'));if(v>0){S.weights.push({d:today(),v:toKg(v)});save();render()}}
else if(a==='start'){S.cur={t:x.t,m:x.m,ex:{},done:{}};save();render()}
else if(a==='rest'){alert('Отдых — тоже часть программы. Цикл не сдвинулся.')}
else if(a==='cancel'){if(confirm('Отменить тренировку без сохранения?')){S.cur=null;save();render()}}
else if(a==='finish'){const c=S.cur;S.workouts.push({d:today(),t:c.t,m:c.m,ex:c.ex});S.last=c.t;S.cur=null;save();render()}
else if(a==='addmeal'){const n=$('#mn').value.trim(),g=num('mg');let k=num('mk'),p=num('mp');const c=cat(n);if(c&&g){if(k==null)k=c[1]*g/100;if(p==null)p=c[2]*g/100}if(!n||k==null){alert('Введите название и ккал (или выберите продукт из каталога и граммы).');return}S.meals.push({d:today(),n,g,kcal:k,p:p||0});save();render()}
else if(a==='delmeal'){S.meals.splice(+x.i,1);save();render()}
else if(a==='eat'){S.meals.push({d:today(),n:x.n,g:null,kcal:+x.k,p:+x.p});save();render()}
else if(a==='addpan'){const n=$('#pn').value.trim();if(n){S.pantry.push({n,g:num('pg')});save();render()}}
else if(a==='favadd'){S.pantry.push({n:x.n,g:null});save();render()}
else if(a==='fav'){const i=S.fav.indexOf(x.n);i<0?S.fav.push(x.n):S.fav.splice(i,1);save();render()}
else if(a==='delpan'){S.pantry.splice(+x.i,1);save();render()}
else if(a==='sk'){const p=day().skin.pr,i=p.indexOf(x.s);i<0?p.push(x.s):p.splice(i,1);save();render()}
else if(a==='addw'){const v=num('dw');if(v>0){S.weights.push({d:today(),v:toKg(v)});save();render()}}
else if(a==='addm'){const o={d:today()};['chest','waist','shoulders','arm','thigh'].forEach(k=>{const v=num('m_'+k);if(v!=null)o[k]=v});if(Object.keys(o).length>1){S.measures.push(o);save();render()}}
else if(a==='rep'){window._rep=report();render()}
else if(a==='copy'){navigator.clipboard.writeText(window._rep).then(()=>alert('Скопировано. Вставьте текст в чат ChatGPT.'),()=>alert('Не удалось скопировать. Скачайте файл.'))}
else if(a==='dl')dl('body-os-report-'+today()+'.txt',window._rep,'text/plain');
else if(a==='exp')dl('body-os-backup-'+today()+'.json',JSON.stringify(S,null,1),'application/json');
else if(a==='wipe'){if(confirm('Удалить ВСЕ данные без возможности восстановления?')&&confirm('Точно удалить? Сначала сделайте резервную копию.')){S=structuredClone(DEF);save();render()}}});
document.addEventListener('change',e=>{const t=e.target,a=t.dataset.a;if(!a)return;const x=t.dataset;
if(a==='rep'){const c=S.cur;(c.ex[x.e]||(c.ex[x.e]=[]))[+x.i]=t.value===''?null:+t.value;save()}
else if(a==='exdone'){S.cur.done[x.e]=t.checked;save()}
else if(a==='care'){day()[x.g][x.i]=t.checked;save()}
else if(a==='sa'){day().sa=t.checked;save()}
else if(a==='irr'){day().skin.irr=+t.value;save()}
else if(a==='dsleep'){day().sleep=t.value===''?null:+t.value;save()}
else if(a==='den'){day().en=t.value;save()}
else if(a==='dnote'){day().note=t.value;save()}
else if(a==='set'){const k=x.k,v=['units','theme'].includes(k)?t.value:parseFloat(t.value);if(v===''||(typeof v==='number'&&isNaN(v)))return;S.profile[k]=v;save();render()}
else if(a==='imp'&&t.files[0]){const f=t.files[0];f.text().then(s=>{try{const o=JSON.parse(s);if(!o||typeof o!=='object'||!o.profile||!Array.isArray(o.weights))throw 0;if(confirm('Заменить текущие данные резервной копией?')){S={...structuredClone(DEF),...o};save();render();alert('Данные восстановлены.')}}catch(err){alert('Файл не похож на резервную копию BODY OS.')}})}});
addEventListener('hashchange',render);render();
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
