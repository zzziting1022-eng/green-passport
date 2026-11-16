// 裕隆城綠活護照：所有互動均為課程提案示範
const $ = (id) => document.getElementById(id);
const storageKey = "裕隆城綠活護照_展示版三";

// 將示範進度保留在這台電腦的瀏覽器中
let state = { points: 0, earned: 0, spent: 0, actions: 0, rides: 0, recycleKg: 0, badges: [], tickets: [], history: [] };
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && typeof saved.points === "number") state = { ...state, ...saved };
} catch (error) {
  // 若瀏覽器不允許儲存，網站仍可正常互動
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) {}
}
function message(text) {
  const box = $("toast");
  box.textContent = text;
  box.classList.add("show");
  clearTimeout(message.timer);
  message.timer = setTimeout(() => box.classList.remove("show"), 2700);
}
function addAction(name, points, badge) {
  state.points += points;
  state.earned += points;
  state.actions++;
  if (badge && !state.badges.includes(badge)) state.badges.push(badge);
  state.history.unshift({ name, points, time: new Date().toLocaleString("zh-TW") });
  save();
  render();
  message(points ? `已完成「${name}」！示範獲得 ${points} 綠點` : `已完成「${name}」！獲得行動紀錄`);
}
function render() {
  $("topPoints").textContent = state.points.toLocaleString("zh-TW");
  $("walletPoints").textContent = state.points.toLocaleString("zh-TW");
  $("earnedPoints").textContent = state.earned.toLocaleString("zh-TW");
  $("spentPoints").textContent = state.spent.toLocaleString("zh-TW");
  $("actionCount").textContent = state.actions;
  $("rideCount").innerHTML = `${state.rides} <span>/ 2 趟</span>`;
  const names = ["♻ 循環實踐家", "☕ 綠色生活家", "↗ 綠色移動家", "✳ 市集探索家"];
  $("challengeBadges").replaceChildren();
  names.forEach(name => {
    const div = document.createElement("div");
    div.className = "challenge" + (state.badges.includes(name) ? " unlocked" : "");
    div.textContent = `${state.badges.includes(name) ? "✓ " : "○ "}${name}`;
    $("challengeBadges").appendChild(div);
  });
  const count = names.filter(name => state.badges.includes(name)).length;
  $("badgeCount").textContent = `${count} / 4`;
  $("badgeBar").style.width = `${count * 25}%`;
  $("historyList").replaceChildren();
  if (!state.history.length) $("historyList").textContent = "尚無行動紀錄。";
  state.history.slice(0, 10).forEach(item => {
    const div = document.createElement("div");
    div.className = "record-item";
    div.textContent = `${item.name}｜${item.points ? "+" + item.points + " 點" : "行動完成"}｜${item.time}`;
    $("historyList").appendChild(div);
  });
  $("ticketList").replaceChildren();
  if (!state.tickets.length) $("ticketList").textContent = "尚無票券，完成任務累積綠點吧。";
  state.tickets.forEach((ticket, index) => {
    const div = document.createElement("div");
    div.className = "record-item";
    const label = document.createElement("span");
    label.textContent = `${ticket.used ? "已模擬核銷" : "尚未使用"}｜${ticket.name}｜${ticket.date}`;
    div.appendChild(label);
    if (!ticket.used) {
      const button = document.createElement("button");
      button.textContent = "模擬核銷";
      button.addEventListener("click", () => {
        ticket.used = true;
        save(); render(); message("示範票券已標記為使用，不具實際折抵效力");
      });
      div.appendChild(button);
    }
    $("ticketList").appendChild(div);
  });
}

// 永續人格：三題計分，依最高分推薦市集任務
const questions = [
  ["在永續市集，你會先去哪裡？", "二手衣穿搭攤位", "永續盲盒交換區", "循環材料手作區", "環保生活體驗區"],
  ["你最期待完成哪件事？", "搭配一套獨特二手衣", "讓閒置物品找到新主人", "把回收材料變成作品", "養成一個環保好習慣"],
  ["你最想帶走什麼？", "自己的永續穿搭卡", "充滿驚喜的交換盲盒", "親手完成的再生小物", "可以持續使用的綠活技巧"]
];
const personas = [
  { name:"循環時尚家", description:"透過穿搭實踐永續。你喜歡探索二手單品的新風格。", title:"二手衣穿搭挑戰", steps:"前往二手衣攤位 → 挑選一件二手單品 → 完成穿搭拍照 → 工作人員驗證", image:"人格角色1.png", badge:"✳ 市集探索家" },
  { name:"生活尋寶家", description:"透過物品交換實踐永續。你總能發現舊物的新故事。", title:"永續盲盒交換挑戰", steps:"攜帶閒置物品 → 工作人員檢查 → 選擇主題盲盒 → 完成交換", image:"人格角色2.png", badge:"✳ 市集探索家" },
  { name:"手作創意家", description:"透過材料再利用實踐永續。你喜歡親手創作獨一無二的作品。", title:"循環材料手作挑戰", steps:"前往手作攤位 → 領取回收材料 → 完成作品 → 工作人員驗證", image:"人格角色3.png", badge:"✳ 市集探索家" },
  { name:"綠色生活家", description:"透過日常行動實踐永續。你擅長把環保變成生活習慣。", title:"綠活生活探索挑戰", steps:"前往環保生活攤位 → 認識循環用品 → 完成互動問答 → 取得驗證", image:"人格角色4.png", badge:"✳ 市集探索家" }
];
let quizIndex = 0;
let answers = [];
let selectedPersona = null;
function showQuiz() {
  const question = questions[quizIndex];
  $("quizProgress").textContent = `第 ${quizIndex + 1} 題 / 共 3 題`;
  $("quizBar").style.width = `${(quizIndex + 1) / 3 * 100}%`;
  $("quizQuestion").textContent = question[0];
  $("quizOptions").replaceChildren();
  question.slice(1).forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.addEventListener("click", () => {
      answers.push(index);
      quizIndex++;
      if (quizIndex < questions.length) showQuiz(); else finishQuiz();
    });
    $("quizOptions").appendChild(button);
  });
}
function finishQuiz() {
  const scores = [0, 0, 0, 0];
  answers.forEach(index => scores[index]++);
  const top = Math.max(...scores);
  const firstAnswer = answers[0];
  selectedPersona = scores[firstAnswer] === top ? firstAnswer : scores.indexOf(top);
  const persona = personas[selectedPersona];
  $("quizProgress").textContent = "測驗完成！";
  $("quizQuestion").textContent = `✳ ${persona.name}`;
  $("personaResult").textContent = `${persona.description}\n推薦原因：依照你三題的興趣選擇。`;
  $("personaReveal").hidden = false;
  $("personaReveal").innerHTML = `<img src="./${persona.image}" alt="${persona.name}Ｑ版角色"><div><b>你的專屬角色：${persona.name}</b><small>完成市集現場驗證，可解鎖專屬成就。</small></div>`;
  $("huntTitle").textContent = persona.title;
  $("huntSteps").textContent = persona.steps;
  $("huntReason").textContent = `專屬於「${persona.name}」：${persona.description}`;
  $("completeHunt").disabled = false;
  $("quizOptions").replaceChildren();
  const restart = document.createElement("button");
  restart.textContent = "重新測驗 ↻";
  restart.addEventListener("click", () => {
    quizIndex = 0; answers = []; selectedPersona = null;
    $("personaResult").textContent = "回答三個問題，探索你的永續人格。";
    $("personaReveal").hidden = true;
    showQuiz();
  });
  $("quizOptions").appendChild(restart);
  message(`已解鎖你的永續人格：${persona.name}`);
}
$("completeHunt").addEventListener("click", () => {
  if (selectedPersona === null) return message("請先完成永續人格測驗");
  addAction(personas[selectedPersona].title, 0, "✳ 市集探索家");
});
showQuiz();

// 二手穿搭配對：風格與場合推薦（展示版）
const looks = [
  {name:"韓系簡約", top:"米白色針織上衣", bottom:"丹寧藍長裙", extras:"帆布包、簡約球鞋", reason:"奶油白與丹寧藍自然協調"},
  {name:"日系文青", top:"白色襯衫", bottom:"黑色寬褲", extras:"黑色肩背包、簡約球鞋", reason:"黑白搭配俐落耐看"},
  {name:"復古學院", top:"復古花紋針織背心", bottom:"卡其色長褲", extras:"貝雷帽、皮革肩背包", reason:"大地色系展現復古層次"},
  {name:"運動休閒", top:"灰色連帽上衣", bottom:"寬版丹寧褲", extras:"棒球帽、後背包", reason:"寬鬆單品舒適又有街頭感"},
  {name:"法式浪漫", top:"碎花洋裝", bottom:"米白色針織外套", extras:"小型斜背包、平底鞋", reason:"柔和配色呈現輕盈氣質"},
  {name:"清新學院", top:"深藍色針織背心", bottom:"灰色百褶裙", extras:"帆布包、樂福鞋", reason:"經典學院單品容易重複搭配"},
  {name:"戶外機能", top:"橄欖綠工裝外套", bottom:"卡其色工裝褲", extras:"漁夫帽、運動鞋", reason:"橄欖綠與卡其色兼具實用與層次"},
  {name:"都會俐落", top:"深色西裝外套", bottom:"灰色寬版長褲", extras:"黑色肩背包、素色球鞋", reason:"同色系層次適合正式與休閒場合"},
  {name:"丹寧休閒", top:"丹寧外套與條紋上衣", bottom:"米白色寬褲", extras:"帆布包、白色球鞋", reason:"丹寧藍與米白色清爽百搭"},
  {name:"甜美穿搭", top:"粉色針織外套", bottom:"白色長裙", extras:"小型斜背包、淺色球鞋", reason:"粉白配色柔和又適合日常"}
];
const occasionTips = {
  "上課／日常":"以舒適好走的鞋子為主，選擇方便活動的二手單品。",
  "逛市集":"搭配帆布袋與舒適球鞋，方便探索攤位和交換物品。",
  "朋友聚會":"用一件有特色的二手配件，增加穿搭記憶點。",
  "約會":"選擇乾淨柔和的配色，加入一件有故事的復古配件。",
  "戶外出遊":"優先選擇透氣、方便活動的服飾與耐走鞋款。",
  "上班／實習":"以整潔、俐落為主，選擇可重複搭配的經典款式。"
};
function showLook(index) {
  const look = looks[index];
  const occasion = $("matchOccasion").value;
  $("matchMood").value = look.name;
  $("matchImage").src = "./穿搭靈感" + (index+1) + ".jpg";
  $("matchImage").alt = look.name + "穿搭示意";
  const area = $("matchAdvice"); area.replaceChildren();
  const tag = document.createElement("span"); tag.textContent = "✦ 你的個人化穿搭建議";
  const title = document.createElement("h4"); title.textContent = look.name + " × " + occasion;
  const detail = document.createElement("p"); detail.textContent = "建議搭配「" + look.top + "」與「" + look.bottom + "」的二手單品，再加入" + look.extras + "，讓整體更有層次。";
  const reason = document.createElement("p"); reason.textContent = "搭配重點：" + look.reason + "。" + occasionTips[occasion];
  const market = document.createElement("p"); market.textContent = "市集探索：可以優先尋找上述相近風格的二手衣與配件。";
  const note = document.createElement("small"); note.textContent = "圖片為穿搭示意，非市集現貨；推薦採規則式模擬。";
  area.append(tag,title,detail,reason,market,note);
  document.querySelectorAll(".look-card").forEach((card,i)=>card.classList.toggle("selected",i===index));
}
$("matchButton").addEventListener("click",()=>{
  const index=looks.findIndex(item=>item.name===$("matchMood").value);
  showLook(index);message("已產生專屬二手穿搭建議！");
});
showLook(0);

// 充電試算：慢充滿 30 分鐘才計一個單位，快充依度數計算
$("chargeType").addEventListener("change", () => {
  const slow = $("chargeType").value === "slow";
  $("chargeLabel").firstChild.textContent = slow ? "充電時間（分鐘）" : "充電度數（度）";
  $("chargeAmount").value = slow ? "60" : "20";
});
$("calculateCharge").addEventListener("click", () => {
  const amount = Number($("chargeAmount").value);
  if (!Number.isFinite(amount) || amount <= 0) return message("請輸入大於零的充電數量");
  const slow = $("chargeType").value === "slow";
  const off = $("chargePeriod").value === "off";
  const unit = slow ? Math.floor(amount / 30) : amount;
  const rate = slow ? (off ? 150 : 75) : (off ? 50 : 20);
  const total = unit * rate;
  const detail = slow ? `${amount} 分鐘 → ${unit} 個完整 30 分鐘單位 × ${rate} 點` : `${amount} 度 × ${rate} 點／度`;
  $("chargeResult").innerHTML = `<small>預估可獲得</small><strong>${total.toLocaleString("zh-TW")} <span>綠點</span></strong><p>${detail}<br>這是試算結果，不會直接加入綠點錢包。</p>`;
  message(`試算完成：預估 ${total.toLocaleString("zh-TW")} 綠點`);
});

// 接駁示範：限制本次示範最多兩趟
$("rideShuttle").addEventListener("click", () => {
  if (state.rides >= 2) return message("本次示範已達 2 趟／30 點上限");
  state.rides++;
  $("rideFeedback").textContent = `第 ${state.rides} 趟示範驗證完成！已更新綠點錢包。`;
  addAction("電動接駁車搭乘", 15, "↗ 綠色移動家");
});

// 日常綠活：重量以每滿 0.5 公斤計算，並限制累積上限
$("cupAction").addEventListener("click", () => addAction("自備環保杯", 600, "☕ 綠色生活家"));
function getWeight() { return Number($("clothesWeight").value); }
$("clothesWeight").addEventListener("input", () => {
  const weight = getWeight();
  $("recyclePreview").textContent = Number.isFinite(weight) && weight > 0 ? `預估 +${Math.floor(weight / 0.5) * 150} 點` : "請輸入重量";
});
$("recycleAction").addEventListener("click", () => {
  const weight = getWeight();
  if (!Number.isFinite(weight) || weight < 0.5) return message("回收重量至少需要 0.5 公斤");
  const remain = Math.max(0, 5 - state.recycleKg);
  if (remain < 0.5) return message("本次示範已達 5 公斤回收上限");
  const valid = Math.min(weight, remain);
  const units = Math.floor(valid / 0.5);
  if (units < 1) return message("未達 0.5 公斤計點單位");
  state.recycleKg += units * 0.5;
  addAction(`舊衣回收 ${units * 0.5} 公斤`, units * 150, "♻ 循環實踐家");
});
$("cycleAction").addEventListener("click", () => addAction("循環杯借還體驗", 0, "☕ 綠色生活家"));

// 綠活成果卡：直接使用已完成的任務紀錄，不重複詢問興趣
function renderGreenMemory() {
  const stampNames = ["市集", "充電", "接駁", "日常"];
  const stampSymbols = ["✿", "ϟ", "↗", "♻"];
  const unlocked = stampNames.map((_, i) => {
    const button = document.querySelectorAll("[data-stamp]")[i];
    return Boolean(button && (button.classList.contains("unlocked") || button.classList.contains("collected") || button.classList.contains("active")));
  });
  // 使用既有的護照印章顯示結果，避免額外建立另一套集點規則
  const collected = document.querySelectorAll("[data-stamp].collected").length;
  const count = Math.max(0, Math.min(4, collected));
  $("finaleStamps").textContent = `${count} / 4`;
  $("finalePoints").textContent = state.earned.toLocaleString("zh-TW");
  $("finaleActions").textContent = state.actions;
  $("finaleDate").textContent = new Date().toLocaleDateString("zh-TW");
  $("finaleProgressText").textContent = count === 4 ? "四枚印記全數解鎖！" : `再收集 ${4 - count} 枚印記！`;
  $("finaleProgressBar").style.width = `${count * 25}%`;
  $("finaleGreeting").textContent = state.actions ? "每一次綠色選擇，都值得收藏。" : "開始你的第一個永續任務吧！";
  $("finaleLatest").textContent = state.history.length
    ? state.history.slice(0, 3).map(item => item.name).join("　✦　")
    : "還沒有行動紀錄，從上面的任務開始吧！";
  const holder = $("finaleStampIcons");
  holder.replaceChildren();
  stampNames.forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "finale-stamp" + (unlocked[index] ? " earned" : "");
    const symbol = document.createElement("span");
    symbol.textContent = stampSymbols[index];
    const label = document.createElement("small");
    label.textContent = name;
    item.append(symbol, label);
    holder.appendChild(item);
  });
}

// 一鍵生成可分享的文字成果卡，不需要連接外部服務
$("shareGreenCard").addEventListener("click", () => {
  renderGreenMemory();
  // 將護照成果繪製成圖片，無需外部服務
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
  bg.addColorStop(0, "#153b2a");
  bg.addColorStop(1, "#43805b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = "#e7d5a4";
  ctx.lineWidth = 6;
  ctx.strokeRect(48, 48, 984, 1254);
  ctx.textAlign = "center";
  ctx.fillStyle = "#e7d5a4";
  ctx.font = "bold 35px sans-serif";
  ctx.fillText("✦ 裕隆城・綠活護照 ✦", 540, 155);
  ctx.fillStyle = "#fff9e8";
  ctx.font = "bold 58px sans-serif";
  ctx.fillText("一本綠活護照", 540, 270);
  ctx.fillText("裕約永續未來", 540, 345);
  ctx.font = "30px sans-serif";
  ctx.fillText("我的專屬綠活冒險成果", 540, 425);
  ctx.fillStyle = "#fffaf0";
  ctx.beginPath();
  ctx.roundRect(110, 500, 860, 620, 32);
  ctx.fill();
  ctx.fillStyle = "#28583d";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText("今天的綠色足跡", 540, 585);
  const rows = [
    [$("finaleStamps").textContent, "護照印記"],
    [state.earned.toLocaleString("zh-TW"), "累積綠點"],
    [String(state.actions), "完成綠活行動"]
  ];
  rows.forEach((row, i) => {
    const y = 695 + i * 160;
    ctx.font = "bold 67px sans-serif";
    ctx.fillText(row[0], 540, y);
    ctx.font = "26px sans-serif";
    ctx.fillText(row[1], 540, y + 43);
  });
  ctx.fillStyle = "#e7d5a4";
  ctx.font = "28px sans-serif";
  ctx.fillText(new Date().toLocaleDateString("zh-TW"), 540, 1200);
  ctx.font = "21px sans-serif";
  ctx.fillText("提案互動示範・非官方會員紀錄", 540, 1260);
  const link = document.createElement("a");
  link.download = "我的綠活成果卡.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  message("✨ 已產生專屬綠活成果圖片！");
});

// 讓任務完成、兌換及集章後同步更新成果
const originalRender = render;
render = function () {
  originalRender();
  renderGreenMemory();
};

// 綠點票券：點數不足會提示；票券可模擬一次核銷
for (const button of document.querySelectorAll("[data-redeem]")) {
  button.addEventListener("click", () => {
    const cost = Number(button.dataset.redeem);
    if (state.points < cost) return message(`綠點不足，還差 ${(cost - state.points).toLocaleString("zh-TW")} 點`);
    state.points -= cost;
    state.spent += cost;
    state.tickets.unshift({ name: button.dataset.name, date: new Date().toLocaleDateString("zh-TW"), used: false });
    save(); render(); message(`已兌換示範票券：${button.dataset.name}`);
  });
}
$("resetDemo").addEventListener("click", () => {
  if (!confirm("確定要重新開始本次示範嗎？目前的模擬綠點與票券會重設。")) return;
  state = { points: 0, earned: 0, spent: 0, actions: 0, rides: 0, recycleKg: 0, badges: [], tickets: [], history: [] };
  save(); render(); message("示範資料已重設");
});
render();

// ========================================
// 護照互動升級：快速選項與集章紀錄
// ========================================

// 將原本的選單同步成好點選的風格籤，原本的選單仍可使用
for (const area of document.querySelectorAll(".choice-chips")) {
  const select = $(area.dataset.select);
  if (!select) continue;
  const options = [...select.options];
  function drawChips() {
    area.replaceChildren();
    options.forEach((option, index) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "choice-chip" + (select.selectedIndex === index ? " active" : "");
      chip.textContent = (area.dataset.select === "matchOccasion" ? ["📚 ","🛍 ","☕ ","♡ ","🌿 ","💼 "][index] : ["✦ ","🍃 ","📖 ","⚡ ","🌷 ","🎒 ","⛰ ","◆ ","👖 ","🎀 "][index]) + option.text;
      chip.setAttribute("aria-pressed", String(select.selectedIndex === index));
      chip.addEventListener("click", () => {
        select.selectedIndex = index;
        select.dispatchEvent(new Event("change"));
        drawChips();
      });
      area.appendChild(chip);
    });
  }
  select.addEventListener("change", drawChips);
  drawChips();
}

// 集章只記錄網站內的示範體驗，不等於現場真實驗證
const stampKey = "裕隆城綠活護照_集章體驗";
let stampState = {};
try { stampState = JSON.parse(localStorage.getItem(stampKey)) || {}; } catch (error) {}
function renderStamps() {
  let count = 0;
  document.querySelectorAll("[data-stamp]").forEach(button => {
    const found = !!stampState[button.dataset.stamp];
    if (found) count++;
    button.classList.toggle("collected", found);
    button.querySelector("small").textContent = found ? "✓ 已收藏印章" : "尚未收藏";
  });
  $("stampCount").textContent = `已收集 ${count} / 4 枚護照印章`;
  $("floatingPoints").textContent = state.points.toLocaleString("zh-TW");
}
function collectStamp(type) {
  if (!stampState[type]) {
    stampState[type] = true;
    try { localStorage.setItem(stampKey, JSON.stringify(stampState)); } catch (error) {}
    message("✳ 已解鎖一枚綠活護照印章！");
  }
  renderStamps();
}
// 章戳本身可以點選，帶使用者探索相應服務
for (const button of document.querySelectorAll("[data-stamp]")) {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.target)?.scrollIntoView({behavior:"smooth"});
  });
}
// 完成對應互動時，自動在護照蓋章
for (const [id,type] of [["completeHunt","market"],["calculateCharge","charge"],["rideShuttle","shuttle"],["cupAction","daily"],["recycleAction","daily"],["cycleAction","daily"]]) {
  $(id)?.addEventListener("click", () => {
    // 等原本的互動處理完再判斷；充電試算也只是示範章戳
    if (id === "calculateCharge" && !(Number($("chargeAmount").value) > 0)) return;
    if (id === "recycleAction" && !(Number($("clothesWeight").value) >= .5)) return;
    if (id === "completeHunt" && $(id).disabled) return;
    if (id === "rideShuttle" && $(id).disabled) return;
    collectStamp(type);
  });
}
// 餘額有變化時同步右下角的小護照
const floatingBalance = $("walletPoints");
if (floatingBalance) {
  const observer = new MutationObserver(() => {
    $("floatingPoints").textContent = floatingBalance.textContent;
  });
  observer.observe(floatingBalance,{childList:true,characterData:true,subtree:true});
}
renderStamps();

// ========================================
// 綠活隨行助手：依興趣與時間提供可立即操作的路線
// ========================================
let assistantInterest = "市集尋寶";
let assistantTime = "1小時";
for (const button of document.querySelectorAll("#assistantInterests button")) {
  button.addEventListener("click", () => {
    assistantInterest = button.dataset.interest;
    document.querySelectorAll("#assistantInterests button").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
  });
}
for (const button of document.querySelectorAll("#assistantTimes button")) {
  button.addEventListener("click", () => {
    assistantTime = button.dataset.time;
    document.querySelectorAll("#assistantTimes button").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
  });
}
const assistantPlans = {
  "市集尋寶": { icon:"🎁", title:"你的市集冒險路線", first:"先完成永續人格測驗，領取專屬尋寶任務卡", second:"到永續市集探索二手選物、交換盲盒與循環品牌", target:"ai", action:"🧩 開始人格測驗" },
  "時尚穿搭": { icon:"👗", title:"你的循環時尚行程", first:"先選擇喜歡的風格與場合，取得二手穿搭靈感", second:"前往二手衣攤位尋找適合的單品，參加穿搭體驗", target:"fashionStudio", action:"👕 開始二手穿搭配對" },
  "手作體驗": { icon:"✂️", title:"你的循環創作行程", first:"探索永續市集的回收材料手作體驗", second:"參加盲盒交換，讓閒置物品找到新主人", target:"market", action:"✂️ 探索永續市集" },
  "綠色移動": { icon:"🚌", title:"你的智慧移動行程", first:"查看大坪林站與裕隆城間的接駁提案", second:"比較電動車充電的尖離峰綠點回饋", target:"shuttle", action:"🚌 探索綠色接駁" },
  "生活集點": { icon:"☕", title:"你的日常綠活行程", first:"探索自備環保杯與循環杯體驗", second:"認識舊衣回收與綠點獎勵機制", target:"daily", action:"☕ 開始日常綠活" }
};
// AI 隨行助手：將推薦結果做成可點擊的圖片卡，而不是一長串文字
const assistantVisuals = {
  "市集尋寶": [
    {image:"人格角色2.png",title:"測測你的永續人格",detail:"領取你的專屬尋寶任務",target:"ai",icon:"🧩"},
    {image:"永續盲盒.svg",title:"探索永續盲盒交換",detail:"帶閒置物品，交換未知驚喜",target:"market",icon:"🎁"}
  ],
  "時尚穿搭": [
    {image:"穿搭靈感1.jpg",title:"找出你的二手穿搭",detail:"挑風格與場合，立即配對",target:"fashionStudio",icon:"👗"},
    {image:"穿搭靈感8.jpg",title:"到市集尋找相似單品",detail:"讓舊衣服穿出新故事",target:"market",icon:"🧥"}
  ],
  "手作體驗": [
    {image:"循環手作.svg",title:"發現循環手作",detail:"用再生材料玩出創意",target:"market",icon:"✂️"},
    {image:"永續盲盒.svg",title:"挑戰驚喜交換",detail:"到市集探索永續盲盒",target:"market",icon:"🎁"}
  ],
  "綠色移動": [
    {image:"接駁電車示意.png",title:"搭上綠色接駁",detail:"認識接駁路線與集點",target:"shuttle",icon:"🚌"},
    {image:"充電站.jpg",title:"探索智慧充電",detail:"試算尖離峰綠點回饋",target:"charge",icon:"⚡"}
  ],
  "生活集點": [
    {image:"環保杯.svg",title:"解鎖環保杯任務",detail:"從每天的一杯開始",target:"daily",icon:"☕"},
    {image:"舊衣循環.svg",title:"舊衣循環挑戰",detail:"讓閒置衣物再出發",target:"daily",icon:"♻️"}
  ]
};
function createJourneyCard(item, number) {
  const link = document.createElement("a");
  link.className = "journey-card";
  link.href = "#" + item.target;
  const picture = document.createElement("div");
  picture.className = "journey-picture";
  const img = document.createElement("img");
  img.src = "./" + item.image;
  img.alt = item.title + "示意圖片";
  img.loading = "lazy";
  const sticker = document.createElement("span");
  sticker.className = "journey-step";
  sticker.textContent = number + " / " + item.icon;
  picture.append(img, sticker);
  const info = document.createElement("div");
  info.className = "journey-info";
  const heading = document.createElement("strong");
  heading.textContent = item.title;
  const detail = document.createElement("small");
  detail.textContent = item.detail;
  const arrow = document.createElement("span");
  arrow.textContent = "去看看 ↗";
  info.append(heading,detail,arrow);
  link.append(picture,info);
  return link;
}
$("assistantGo").addEventListener("click", () => {
  const output = $("assistantOutput");
  output.replaceChildren();
  output.classList.add("visual-output");
  const intro = document.createElement("div");
  intro.className = "journey-intro";
  const heading = document.createElement("h3");
  heading.textContent = `✦ 為你挑選的 ${assistantInterest} 小冒險`;
  const subtitle = document.createElement("p");
  subtitle.textContent = `${assistantTime}・點擊圖片卡片，直接前往體驗！`;
  intro.append(heading,subtitle);
  const cards = document.createElement("div");
  cards.className = "journey-grid";
  const list = [...assistantVisuals[assistantInterest]];
  if (assistantTime === "30分鐘") list.splice(1);
  if (assistantTime === "2小時以上") list.push({image:"裕隆城外觀.jpg",title:"收集你的護照印記",detail:"看看綠點、徽章與優惠",target:"passport",icon:"📖"});
  list.forEach((item,index) => cards.append(createJourneyCard(item,index+1)));
  const note = document.createElement("p");
  note.className = "journey-note";
  note.textContent = "✳ 這是個人化示範推薦，實際活動及班次依現場公告。";
  output.append(intro,cards,note);
  message("✨ 小助手送上你的專屬探索卡！");
});
