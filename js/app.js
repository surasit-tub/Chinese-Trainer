console.log("app.js loaded");

const SLIDE_DISTANCE = 30;

let studyMode = "vocab";
let answerTimer = null;

let autoRunning = false;
let speakerOn = false;

let allLines = [];
let currentIndex = 0;
let words = [];
let cur = null;

let autoTimer = null;
let autoMode = false;
let tableVisible = false;
let answerVisible = false;

let autoShowAnswer = false;

let randomWords = [];
let randomIndex = 0;

let touchStartX = 0;
let touchEndX = 0;
let isSwiping = false;
let dragging = false;


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

function toggleAnswerMode(){

    autoShowAnswer = !autoShowAnswer;

    const icon=document.getElementById("answerModeIcon");

    if(autoShowAnswer){

        icon.className="fa-solid fa-eye";

        answerVisible=true;
        showAnswer();

    }else{

        icon.className="fa-solid fa-eye-slash";

        answerVisible=false;
        showQuestion();

    }

}

function toggleSpeaker(){

    speakerOn = !speakerOn;

    const icon = document.getElementById("speakerIcon");

    if(speakerOn){
        icon.className = "fa-solid fa-volume-high";
    }else{
        icon.className = "fa-solid fa-volume-xmark";
    }
	
	// Animation
    speakerBtn.classList.add("pop");

    setTimeout(()=>{
        speakerBtn.classList.remove("pop");
    },250);

}

function shuffle(array) {

    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a,b)=>a.sort-b.sort)
        .map(({value})=>value);

}

function changeNextMode(){

    const nextMode = document.getElementById("nextMode").value;

    answerVisible = false;

    if(nextMode === "random"){

        randomWords = shuffle([...words]);
        randomIndex = 0;

        cur = randomWords[randomIndex];

        document.getElementById("info").innerHTML =
            `${randomIndex + 1} / ${words.length}`;

    }else{

        currentIndex = 0;

        cur = words[currentIndex];

        document.getElementById("info").innerHTML =
            `${currentIndex + 1} / ${words.length}`;
    }

    showQuestion();
}


function changeStudyMode(){

    studyMode = document.getElementById("studyMode").value;

    changeCategory(); // 🔥 สำคัญมาก ต้อง reload ใหม่
}

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

function buildCategory(){

    const category = document.getElementById("category");

    category.innerHTML = "";

    Object.keys(datasets).forEach(name => {
        category.innerHTML += `<option value="${name}">${name}</option>`;
    });

    // เลือกค่าเริ่มต้น
    category.value = "เด็กเล็ก";
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
		
	let nextMode = document.getElementById("nextMode").value;
	if(nextMode=="random"){
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
		
	
	const tbody = document.querySelector("#wordTable tbody");
	tbody.innerHTML = "";
	tableVisible  = true;
	const showTableBtn = document.getElementById("show-table-btn");
	showTableBtn.innerHTML = '<i class="fa-regular fa-folder-closed"></i>';
}

function showTable() {

	const showTableBtn = document.getElementById("show-table-btn");
    const tbody = document.querySelector("#wordTable tbody");

    tbody.innerHTML = "";

	if(tableVisible  == true) {		

		if(studyMode=="dialog"){

			words.forEach((w, i) => {
	
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
						
		tableVisible  = false;
		showTableBtn.innerHTML = '<i class="fa-regular fa-folder-open"></i></i>';		
		
	}
	else {
		tableVisible  = true;
		showTableBtn.innerHTML = '<i class="fa-regular fa-folder-closed"></i></i>';
	}
}

function toggleAuto(){

    autoRunning = !autoRunning;

    const icon = document.getElementById("autoIcon");

    if(autoRunning){

        icon.className = "fa-solid fa-stop";

        autoPlay();

        autoTimer = setInterval(autoPlay,5000);

    }else{

        icon.className = "fa-solid fa-play";

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


function nextWord() {
	
	console.log(currentIndex);

    let nextMode = document.getElementById("nextMode").value;

    if(nextMode=="random"){
		
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

    let nextMode = document.getElementById("nextMode").value;

    if(nextMode=="random"){
		
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


function showQuestion() {

    applyCardStyle();

    const modeSelect = document.getElementById("mode").value;

    card.innerHTML = `
			<div class="word-line">
				<div class="chinese">
					${modeSelect=="ct" ? cur.c : cur.t}
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

    const modeSelect = document.getElementById("mode").value;

    if (modeSelect == "ct") {

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
					<div class="pinyin">${cur.c}</div>
					<div class="thaiRead">${cur.p}</div>
					<div class="meaning">${cur.r}</div>
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

    const studyMode = document.getElementById("studyMode").value;
    const card = document.getElementById("card");

    card.classList.remove("vocab","dialog");
    card.classList.add(studyMode);
}

function animateSpeaker(){

    const speakerBtn = document.getElementById("speakerBtn");

    speakerBtn.classList.add("pop");

    setTimeout(()=>{
        speakerBtn.classList.remove("pop");
    },250);

}

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


function init() {
    buildCategory();
    changeCategory();
	
	const card = document.getElementById("card");
	
	card.addEventListener("pointerdown", function(e){

		card.style.transition = "none";
		card.setPointerCapture(e.pointerId);

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
			card.releasePointerCapture(e.pointerId);
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


