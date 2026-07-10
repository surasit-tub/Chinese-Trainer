console.log("app.js loaded");

// =====================================================
// Constants
// =====================================================

const SLIDE_DISTANCE = 30;

// =====================================================
// Display Modes
// =====================================================

let languageMode = "ct";      // ct / tc
let studyMode    = "vocab";   // vocab / dialog
let displayMode  = "card";    // card / table

// =====================================================
// Study Options
// =====================================================

let shuffleMode    = false;
let speakerOn      = false;
let autoRunning    = false;
let autoShowAnswer = false;

// =====================================================
// Current Lesson
// =====================================================

let allLines = [];
let words    = [];
let cur      = null;

let currentIndex = 0;
let randomWords  = [];
let randomIndex  = 0;

// =====================================================
// Timers
// =====================================================

let autoTimer   = null;
let answerTimer = null;

// =====================================================
// Card State
// =====================================================

let answerVisible = false;

// =====================================================
// Swipe / Drag
// =====================================================

let touchStartX = 0;
let touchEndX   = 0;

let dragging   = false;
let isSwiping  = false;


// =====================================================
// Init
// =====================================================

function init() {
    buildCategory();
    changeCategory();
	
	const card = document.getElementById("card");
	
	card.addEventListener("pointerdown", function(e){

		card.style.transition = "none";
		//card.setPointerCapture(e.pointerId);

		dragging = true;

		touchStartX = e.clientX;

	});	
	
	card.addEventListener("pointermove", function(e){

		if(!dragging) return;

		const diff = e.clientX - touchStartX;

		card.style.transform = `translateX(${diff * 0.6}px)`;

	});
	
	card.addEventListener("pointerup", function(e){

		if(!dragging) return;

		dragging = false;

		touchEndX = e.clientX;

		const diff = touchEndX - touchStartX;

		// ลากไม่พอ
		if(Math.abs(diff) < 25){

			card.style.transition = "transform .2s ease";
			card.style.transform = "translateX(0)";
			//card.releasePointerCapture(e.pointerId);
			return;

		}

		handleSwipe();

	});

	card.addEventListener("pointerleave", function(){

		if(!dragging) return;

		dragging = false;

		card.style.transition = "transform .2s ease";
		card.style.transform = "translateX(0)";

	});

}


function buildCategory(){

    const category = document.getElementById("category");

    category.innerHTML = "";

    Object.keys(datasets).forEach(name => {
        category.innerHTML += `<option value="${name}">${name}</option>`;
    });

    // เลือกค่าเริ่มต้น
    category.value = "เด็กเล็ก";
}

// =====================================================
// Toggle Buttons
// =====================================================
/*
function toggleLanguage(){

    languageMode = (languageMode === "ct") ? "tc" : "ct";

    animateButton("languageBtn");

    const icon = document.getElementById("languageIcon");

    if(languageMode === "ct"){
		icon.classList.remove("flip");		
        icon.style.color = "";

    }else{
		icon.classList.add("flip");
		icon.style.color = "#1976d2";   // ฟ้า
        
    }	
		

    if(answerVisible){
        showAnswer();
    }else{
        showQuestion();
    }

}
*/

function toggleLanguage(){

    languageMode =
        languageMode === "ct"
            ? "tc"
            : "ct";

    animateButton("languageBtn");

    const text = document.getElementById("languageText");

    if(languageMode === "ct"){

        text.innerHTML = `
            <span class="cn">文</span>
            <span class="arrow">→</span>
            <span class="th">ก</span>
        `;

    }else{

        text.innerHTML = `
            <span class="th">ก</span>
            <span class="arrow">→</span>
            <span class="cn">文</span>
        `;

    }

    if(answerVisible){
        showAnswer();
    }else{
        showQuestion();
    }

}

function toggleStudyMode(){

    studyMode =
        studyMode === "vocab"
            ? "dialog"
            : "vocab";

    animateButton("studyModeBtn");

    const icon = document.getElementById("studyModeIcon");

    if(studyMode === "vocab"){

        icon.className = "fa-solid fa-chalkboard";
		icon.style.color = "";

    }else{

        icon.className = "fa-regular fa-comments";
		icon.style.color = "#1976d2";   // ฟ้า

    }

    changeCategory();

}

function toggleShuffle(){

	animateButton("shuffleBtn");

    shuffleMode = !shuffleMode;

    const icon = document.getElementById("shuffleIcon");

    if(shuffleMode){

		icon.className = "fa-solid fa-shuffle";
        icon.style.color = "#2196f3";

        randomWords = shuffle([...words]);
        randomIndex = 0;

        cur = randomWords[randomIndex];

        document.getElementById("info").innerHTML =
            `${randomIndex+1} / ${words.length}`;

    }else{

		icon.className = "fa-solid fa-list-ol";
        icon.style.color = "";

        currentIndex = 0;

        cur = words[currentIndex];

        document.getElementById("info").innerHTML =
            `${currentIndex+1} / ${words.length}`;

    }

    showQuestion();

}

function toggleAnswerMode(){
	
	animateButton("answerModeBtn");

    autoShowAnswer = !autoShowAnswer;

    const icon=document.getElementById("answerModeIcon");

    if(autoShowAnswer){

        icon.className="fa-solid fa-closed-captioning";
		icon.style.color = "#2196f3";

        answerVisible=true;
        showAnswer();

    }else{

        icon.className="fa-regular fa-closed-captioning";
		icon.style.color = "";

        answerVisible=false;
        showQuestion();

    }

}

function toggleSpeaker(){
	
	animateButton("speakerBtn");

    speakerOn = !speakerOn;

    const icon = document.getElementById("speakerIcon");

    if(speakerOn){
        icon.className = "fa-solid fa-volume-high";
		icon.style.color = "#2196f3";
    }else{
        icon.className = "fa-solid fa-volume-xmark";
		icon.style.color = "";
    }
		
}

function toggleDisplayMode(){

    animateButton("displayModeBtn");

    const cardWrapper = document.querySelector(".card-wrapper");
    const tableWrapper = document.querySelector(".table-wrapper");
    const icon = document.getElementById("displayModeIcon");
	const autoIcon = document.getElementById("autoIcon");
	const autoBtn = document.getElementById("autoBtn");

    displayMode =
        displayMode === "card" ? "table" : "card";

    if(displayMode === "table"){

		// หยุด Auto ถ้ากำลังทำงาน
		if(autoRunning){

			autoRunning = false;

			clearInterval(autoTimer);
			autoTimer = null;

			autoIcon.className = "fa-solid fa-play";
			autoIcon.style.color = "";
				
		}
	
		autoBtn.style.visibility = "hidden";
	
        cardWrapper.style.display = "none";
        tableWrapper.style.display = "block";

        icon.className = "fa-solid fa-table-list";
		icon.style.color = "#2196f3";

    }else{
		
		autoBtn.style.visibility = "visible";

        cardWrapper.style.display = "block";
        tableWrapper.style.display = "none";

        icon.className = "fa-solid fa-laptop-code";
		icon.style.color = "";
    }

}

// =====================================================
// Auto Play
// =====================================================

function toggleAuto(){
	
	animateButton("autoBtn");

    autoRunning = !autoRunning;

    const icon = document.getElementById("autoIcon");

    if(autoRunning){

        icon.className = "fa-solid fa-stop";
		icon.style.color = "#2196f3";

        autoPlay();

        autoTimer = setInterval(autoPlay,5000);

    }else{

        icon.className = "fa-solid fa-play";
		icon.style.color = "";

        if(autoTimer){
            clearInterval(autoTimer);
            autoTimer = null;
        }

    }

}

function autoPlay() {

    answerVisible = false;
    nextWord();
	

    if(answerTimer){
        clearTimeout(answerTimer);
    }

    answerTimer = setTimeout(function () {

        answerVisible = true;
        showAnswer();

    }, 3000);

}

// =====================================================
// Load Data
// =====================================================

function changeCategory(){

    const categoryName = document.getElementById("category").value;

    const pack = datasets[categoryName];

    if (studyMode === "vocab") {
        data = pack.vocab;
    } else {
        data = pack.dialog;
    }

    allLines = [];

    buildLesson();
    loadWords();
}

function loadWords(){
	words=[];

	if (allLines.length === 0) {
		if (typeof data === "string") {
			allLines = data.trim().split(/\n/);
		} else {
			allLines = [];
		}
	}

	let lines = [...allLines];

	const ep = parseInt(document.getElementById("lesson").value);

    const start = (ep - 1) * 10;
	const end = start + 10;

    lines = lines.slice(start, end);

	lines.forEach(l => {

		let p = l.split(/\t+/);

		if (p.length >= 4) {
			words.push({
				c: p[0],
				p: p[1],
				r: p[2],
				t: p[3]
			});
		}}
	);

	currentIndex = 0;
	cur = null;		
	
	if(shuffleMode){
		document.getElementById("info").innerHTML =
        `${randomIndex + 1} / ${words.length}`;
		cur = randomWords[randomIndex];
	} else {
		document.getElementById("info").innerHTML =
        `${currentIndex + 1} / ${words.length}`;
		cur = words[currentIndex];
	}	
	
	if (answerVisible) {
        showAnswer();
    } else {
        showQuestion();
    }
				
	buildTable();
}


function buildLesson(){

    const lesson = document.getElementById("lesson");

    lesson.innerHTML = "";

    const categoryName = document.getElementById("category").value;

    datasets[categoryName].lessons.forEach((name,index)=>{

        lesson.innerHTML += `
            <option value="${index+1}">
                ${name}
            </option>
        `;

    });

    lesson.value = "1";

}

function buildTable(){

    const tbody = document.querySelector("#wordTable tbody");

    tbody.innerHTML = "";

    if(studyMode=="dialog"){

        words.forEach(w=>{

            tbody.innerHTML += `
						<tr>
							<td>

								<div class="dialog-item">

									<div class="dialog-title">

										<div class="dialog-cn">${w.c}</div>

										<button class="speak-btn-table"
												onclick="speakChineseText('${w.c}')">
											<i class="fa-solid fa-volume-high"></i>
										</button>

									</div>

									<div class="dialog-pinyin">${w.p}</div>

									<div class="dialog-read">${w.r}</div>

									<div class="dialog-th">${w.t}</div>

								</div>

							</td>
						</tr>
				`;

        });

    }else{

        words.forEach(w=>{

            tbody.innerHTML += `
					<tr class="vocab-row">											
							
						<td class="vocab-cn">${w.c}</td>
						<td class="vocab-speaker">
							<button class="speak-btn-table"
									onclick="speakChineseText('${w.c}')">
								<i class="fa-solid fa-volume-high"></i>
							</button>
						</td>
						<td class="vocab-pinyin">${w.p}</td>
						<td class="vocab-read">${w.r}</td>
						<td class="vocab-th">${w.t}</td>
					</tr>
				`;

        });

    }

}

// =====================================================
// Card
// =====================================================

function showQuestion() {

    applyCardStyle();

    card.innerHTML = `
			<div class="word-line">
				<div class="chinese">
					${languageMode =="ct" ? cur.c : cur.t}
				</div>

				<button class="speak-btn"
					onclick="event.stopPropagation(); speakChinese();">
					<i class="fa-solid fa-volume-high"></i>
				</button>
			</div>
			
			<div class="answer-placeholder" onclick="showAns()">
				<div class="reveal-text"></div>
			</div>
		`;
}
function showAnswer() {

    applyCardStyle();

    if (languageMode  == "ct") {

			card.innerHTML = `
				<div class="word-line">

					<div class="chinese">${cur.c}</div>

					<button class="speak-btn"
						onclick="event.stopPropagation(); speakChinese();">
						<i class="fa-solid fa-volume-high"></i>
					</button>

				</div>
				<div onclick="showAns()">
					<div class="pinyin">${cur.p}</div>
					<div class="thaiRead">${cur.r}</div>
					<div class="meaning">${cur.t}</div>
				</div>
				
			`;
        

    } else {


			card.innerHTML = `
				<div class="word-line">

					<div class="chinese">${cur.t}</div>

					<button class="speak-btn"
						onclick="event.stopPropagation(); speakChinese();">
						<i class="fa-solid fa-volume-high"></i>
					</button>

				</div>
				<div onclick="showAns()">
					<div class="pinyin">${cur.r}</div>
					<div class="thaiRead">${cur.p}</div>
					<div class="meaning">${cur.c}</div>
				</div>
			`;        

    }
}


function showAns() {

	if(isSwiping){

        isSwiping = false;
        return;

    }
	
    if (!cur) return;

    answerVisible = !answerVisible;

    if (answerVisible)
        showAnswer();
    else
        showQuestion();
}

function applyCardStyle(){
    
    const card = document.getElementById("card");

    card.classList.remove("vocab","dialog");
    card.classList.add(studyMode);
}

// =====================================================
// Navigation
// =====================================================

function next(){

    animateChange(() => {
        nextWord();
    }, "next");

}

function previous(){

    animateChange(() => {
        previousWord();
    }, "previous");

}

function nextWord() {
	
	console.log(currentIndex);    

    if(shuffleMode){
		
		randomIndex++;

        // ครบ 10 คำ ให้เตรียมสุ่มรอบใหม่
        if(randomIndex >= randomWords.length){

            randomWords = [];
            randomIndex = 0;

        }

		// ถ้ายังไม่มี หรือครบแล้ว ให้สุ่มชุดใหม่
        if(randomWords.length === 0){

            randomWords = shuffle([...words]);
            randomIndex = 0;

        }

		document.getElementById("info").innerHTML =
        `${randomIndex + 1} / ${words.length}`;
		
        cur = randomWords[randomIndex];

                
    }else{

		currentIndex++;
		
		if(currentIndex>=words.length)
            currentIndex=0;		

		document.getElementById("info").innerHTML =
		`${currentIndex + 1} / ${words.length}`;
	
        cur = words[currentIndex];                

    }
	
	if(autoShowAnswer){
		answerVisible=true;
		showAnswer();
	}else{
		answerVisible=false;
		showQuestion();
	}
	
	if(speakerOn){
		speakChinese();
	}		
		
}

function previousWord(){
	
	console.log(currentIndex);
    
    if(shuffleMode){
		
		randomIndex--;		
		// ครบ 10 คำ ให้เตรียมสุ่มรอบใหม่
        if(randomIndex < 0){

            randomWords = [];
            randomIndex = 0;

        }
		

		// ถ้ายังไม่มี หรือครบแล้ว ให้สุ่มชุดใหม่
        if(randomWords.length === 0){

            randomWords = shuffle([...words]);
            randomIndex = 0;

        }

        cur = randomWords[randomIndex];

        document.getElementById("info").innerHTML =
        `${randomIndex + 1} / ${words.length}`;       
        

    }else{

		currentIndex--;
		
		if(currentIndex < 0)
            currentIndex = words.length-1;		
	
        cur = words[currentIndex];
		
		document.getElementById("info").innerHTML =
		`${currentIndex + 1} / ${words.length}`;
        
        

    }
	
	if(autoShowAnswer){
		answerVisible=true;
		showAnswer();
	}else{
		answerVisible=false;
		showQuestion();
	}

	if(speakerOn){
		speakChinese();
	}
}

// =====================================================
// Animation
// =====================================================

function animateButton(id){

    const btn = document.getElementById(id);

    btn.classList.add("pop");

    setTimeout(()=>{
        btn.classList.remove("pop");
    },250);

}

function animateChange(callback, direction){

    const card = document.getElementById("card");

    card.style.transition = "all .2s ease";
    card.style.transform =
        direction=="next"
            ? `translateX(-${SLIDE_DISTANCE}px)`
            : `translateX(${SLIDE_DISTANCE}px)`;

    card.style.opacity = "0";

    setTimeout(()=>{

        callback();

        card.style.transform = "translateX(0)";
        card.style.opacity = "1";

    },200);

}

// =====================================================
// Swipe
// =====================================================

function handleSwipe(){

    const diff = touchEndX - touchStartX;

    // ลากไม่ถึง
    if(Math.abs(diff) < 50){

        card.style.transition = "transform .2s ease";
        card.style.transform = "translateX(0)";
        return;

    }

    if(diff > 0){

        animateChange(function(){

            previousWord();

        },"previous");

    }else{

        animateChange(function(){

            nextWord();

        },"next");

    }

}

// =====================================================
// Speaker
// =====================================================

function speakChinese(){

    if(!cur || !speakerOn) return;

    animateSpeaker();

    const utter = new SpeechSynthesisUtterance(cur.c);

    utter.lang = "zh-CN";
    utter.rate = 0.8;

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);

}

function speakChineseText(text){

	if(!speakerOn) return;

    animateSpeaker();
	
    const utter = new SpeechSynthesisUtterance(text);

    utter.lang = "zh-CN";
    utter.rate = 0.8;

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);

}

// =====================================================
// Utils
// =====================================================

function shuffle(array) {

    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a,b)=>a.sort-b.sort)
        .map(({value})=>value);

}























