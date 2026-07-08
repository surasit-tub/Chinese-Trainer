console.log("app.js loaded");

let studyMode = "vocab";
let answerTimer = null;

let allLines = [];
let currentIndex = 0;
let words = [];
let cur = null;

let autoTimer = null;
let autoMode = false;
let tableVisible = false;
let answerVisible = false;

let randomWords = [];
let randomIndex = 0;



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

function changePlayMode(){

    if(autoTimer){
        clearInterval(autoTimer);
        autoTimer = null;
    }

    if(answerTimer){
        clearTimeout(answerTimer);
        answerTimer = null;
    }

    const playMode = document.getElementById("playMode").value;

    if(playMode=="auto"){

        autoPlay();

        autoTimer = setInterval(autoPlay,5000);

    }

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
	
	
	const showTableBtn = document.getElementById("show-table-btn");
	const tbody = document.querySelector("#wordTable tbody");
	tbody.innerHTML = "";
	tableVisible  = true;
	showTableBtn.textContent = "Data";
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

								<div class="dialog-cn">${w.c}</div>

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
						<td class="vocab-pinyin">${w.p}</td>
						<td class="vocab-read">${w.r}</td>
						<td class="vocab-th">${w.t}</td>
					</tr>
				`;

			});

		}
						
		tableVisible  = false;
		showTableBtn.textContent = "Hide";			
		
	}
	else {
		tableVisible  = true;
		showTableBtn.textContent = "Data";
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
	
	if (answerVisible) {
        showAnswer();
    } else {
        showQuestion();
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
	
	if (answerVisible) {
        showAnswer();
    } else {
        showQuestion();
    }

}


function showQuestion() {

	applyCardStyle();

    const modeSelect = document.getElementById("mode").value;

    card.innerHTML =
        (modeSelect=="ct")
            ? `<div class="chinese">${cur.c}</div>`
            : `<div class="chinese">${cur.t}</div>`;
}

function showAnswer() {

	applyCardStyle();

    const modeSelect = document.getElementById("mode").value;	

	if (modeSelect == "ct") {
		card.innerHTML = `
			<div class="chinese">${cur.c}</div>
			<div class="pinyin">${cur.p}</div>
			<div class="thaiRead">${cur.r}</div>
			<div class="meaning">${cur.t}</div>
		`;
	} else {
		card.innerHTML = `
			<div class="chinese">${cur.t}</div>
			<div class="pinyin">${cur.c}</div>
			<div class="thaiRead">${cur.p}</div>
			<div class="meaning">${cur.r}</div>
		`;
	}	
	
}

function showAns() {

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

function init() {
    buildCategory();
    changeCategory();
}


