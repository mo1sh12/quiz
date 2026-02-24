document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get('path') || '';
    const collectionId = urlParams.get('collection');
    const isLessonQuiz = urlParams.has('lessonQuiz');
    const selectedUniId = localStorage.getItem('selectedUni');

    const siteTitleEl = document.getElementById('site-title');
    const questionCounter = document.getElementById('question-counter');
    const questionStem = document.getElementById('question-stem');
    const optionsContainer = document.getElementById('options-container');
    const explanationContainer = document.getElementById('explanation-container');
    const submitBtn = document.getElementById('submit-btn');
    const prevBtn = document.getElementById('prev-btn');
    const progressBar = document.getElementById('progress-bar');
    const quizInterface = document.getElementById('quiz-interface');
    const resultsScreen = document.getElementById('results-screen');
    const reviewScreen = document.getElementById('review-screen');
    const scoreDisplay = document.getElementById('score-display');
    const reviewBtn = document.getElementById('review-btn');
    const browseBtn = document.getElementById('browse-btn');
    const browseModal = document.getElementById('browse-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const browseList = document.getElementById('browse-list');
    const resetBtn = document.getElementById('reset-btn');
    const celebrationToggle = document.getElementById('celebration-toggle');
    const quizModeToggle = document.getElementById('quizmode-toggle');
    const restartBtn = document.getElementById('restart-btn');

  


    if (restartBtn) {
        restartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (path) {
                const encodedPath = encodeURIComponent(path);
                const baseUrl = window.location.origin;
                window.location.href = `${baseUrl}/docs/lesson.html?path=${encodedPath}`;
            } else alert('Path not found.');
        });
    }

    let currentQuestionIndex = 0;
    let userAnswers = [];
    let quizData = null;
    let storageKey = '';

    // Load quiz data
    try {
        if (!path) throw new Error("Path not specified.");
        const cleanPath = path.replace(/^\/+/, '');
        const examFilePath = `./json/${cleanPath}/mcq/${collectionId}.json`;
     
        const response = await fetch(examFilePath);
        if (!response.ok) throw new Error("exam.json could not be loaded.");
        const data = await response.json();
        quizData = data;
        storageKey = `quiz-progress-${cleanPath}`;
        if (!quizData || !quizData.questions) throw new Error('Quiz data not found.');
        siteTitleEl.textContent = `${quizData.examTitle || 'Quiz Platform'}`;
        setupSettings();
        populateBrowseModal();
        initializeQuiz();
    } catch (error) {
        showError(error.message);
    }

    function playVideo(url) {

    const wrapper = document.getElementById('video-wrapper');
    wrapper.style.display = "block";

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {

        const videoId =
            url.split('v=')[1]?.split('&')[0] ||
            url.split('/').pop();

        player.src({
            type: 'video/youtube',
            src: `https://www.youtube.com/watch?v=${videoId}`
        });

    } else {
        // mp4 local file
        player.src({
            type: 'video/mp4',
            src: url
        });
    }

    player.load();
    player.play();
}

    // إعداد إعدادات Celebration و Quiz Mode
    function setupSettings() {
        celebrationToggle.checked = localStorage.getItem('celebrationModeEnabled') === 'true';
        celebrationToggle.addEventListener('change', function() {
            localStorage.setItem('celebrationModeEnabled', this.checked);
        });
        quizModeToggle.checked = localStorage.getItem('quizModeEnabled') === 'true';
        quizModeToggle.addEventListener('change', function() {
            localStorage.setItem('quizModeEnabled', this.checked);
        });
    }

    // تحميل التقدم من localStorage
    function loadProgress(key, length) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            return Array.isArray(data) && data.length === length ? data : new Array(length).fill(null);
        } catch {
            return new Array(length).fill(null);
        }
    }

    // حفظ التقدم
    function saveProgress(key, answers) {
        try { localStorage.setItem(key, JSON.stringify(answers)); } 
        catch (e) { console.error(e); }
    }

    // Initialize quiz
    function initializeQuiz() {
        userAnswers = loadProgress(storageKey, quizData.questions.length);
        let resumeIndex = userAnswers.findIndex(a => a === null);
        if (resumeIndex === -1) { showResults(); return; }
        displayQuestion(resumeIndex);
    }

function displayQuestion(index) {
    currentQuestionIndex = index;
    const question = quizData.questions[index];

    // تحديث نص السؤال
    questionCounter.textContent = `Question ${index + 1} of ${quizData.questions.length}`;
    questionStem.textContent = question.stem;

    // عرض الوسائط إذا وجدت
    const mediaContainer = document.getElementById('media-container');
    mediaContainer.innerHTML = ''; // تنظيف الوسائط القديمة

    if (question.media) {
        // المسار الديناميكي لمجلد media
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path') || '';
        const baseMediaPath = `./json${path}/media/`;

        let hasMedia = false;

        // صورة
        if (question.media.image) {
            const img = document.createElement('img');
            img.src = baseMediaPath + question.media.image;
            img.alt = "Question Image";
            img.style.maxWidth = "100%";
            img.style.margin = "10px 0";
            mediaContainer.appendChild(img);
            hasMedia = true;
        }

        // فيديو
        if (question.media.video) {
            const video = document.createElement('video');
            video.src = baseMediaPath + question.media.video;
            video.controls = true;
            video.style.maxWidth = "100%";
            video.style.margin = "10px 0";
            mediaContainer.appendChild(video);
            hasMedia = true;
        }

        // رابط خارجي
        if (question.media.link) {
            const a = document.createElement('a');
            a.href = question.media.link;
            a.textContent = "More Info";
            a.target = "_blank";
            a.style.display = "block";
            a.style.margin = "10px 0";
            mediaContainer.appendChild(a);
            hasMedia = true;
        }

        // محتوى مدمج (iframe أو HTML)
        if (question.media.embedded) {
            const div = document.createElement('div');
            div.innerHTML = question.media.embedded;
            div.style.margin = "10px 0";
            mediaContainer.appendChild(div);
            hasMedia = true;
        }

        // إذا لم توجد أي ميديا، اجعل container مخفي
        mediaContainer.style.display = hasMedia ? 'block' : 'none';
    } else {
        mediaContainer.style.display = 'none';
    }

    // عرض الخيارات
    optionsContainer.innerHTML = '';
    optionsContainer.classList.remove('options-disabled');
    explanationContainer.style.display = 'none';
    question.options.forEach((option, i) => {
        const opt = document.createElement('div');
        opt.className = 'option';
        opt.innerHTML = `<input type="radio" name="answer" value="${i}" id="option-${i}"><label for="option-${i}">${option}</label>`;
        if (userAnswers[index] === i) opt.querySelector('input').checked = true;
        opt.addEventListener('click', () => selectOption(i));
        optionsContainer.appendChild(opt);
    });

    // عرض التغذية الراجعة إذا تم الإجابة مسبقًا
    if (userAnswers[index] !== null) showFeedback();

    // تحديث أزرار التنقل وشريط التقدم
    updateNavigation();
}

    // حفظ الإجابة الحالية
    function saveAnswer(index, answer) {
        if (index < 0 || index >= quizData.questions.length) return;
        userAnswers[index] = answer;
        try { localStorage.setItem(storageKey, JSON.stringify(userAnswers)); } 
        catch (e) { console.error(e); }
    }

    // تعليم الخيار المختار
    function markOptionAsChecked(selectedIndex) {
        const input = document.querySelector(`input[name="answer"][value='${selectedIndex}']`);
        if (input) input.checked = true;
    }

    // اختيار إجابة
    function selectOption(selectedIndex) {
        saveAnswer(currentQuestionIndex, selectedIndex);
        markOptionAsChecked(selectedIndex);
        if (localStorage.getItem('quizModeEnabled') !== 'true') showFeedback();
        updateNavigation();
    }

    // عرض التغذية الراجعة
    function showFeedback() {
        if (localStorage.getItem('quizModeEnabled') === 'true') return;
        const correctIndex = quizData.questions[currentQuestionIndex].correct;
        const explanationText = quizData.questions[currentQuestionIndex].explanation;
        optionsContainer.classList.add('options-disabled');
        if (userAnswers[currentQuestionIndex] === correctIndex && localStorage.getItem('celebrationModeEnabled') === 'true') {
            if (typeof Tone !== 'undefined') {
                const synth = new Tone.Synth({oscillator:{type:'sine'},envelope:{attack:0.005,decay:0.1,sustain:0.3,release:1}}).toDestination();
                synth.triggerAttackRelease("C6","8n");
            }
            if (typeof confetti === 'function') confetti({particleCount:150, spread:80, origin:{y:0.6}});
        }
        document.querySelectorAll('.option').forEach((opt,i)=>{
            if(i===correctIndex) opt.classList.add('correct');
            else if(userAnswers[currentQuestionIndex]===i) opt.classList.add('incorrect');
        });
        if(explanationText){explanationContainer.innerHTML=`<strong>Explanation:</strong> ${explanationText}`; explanationContainer.style.display='block';}
    }

    // تحديث أزرار التنقل
    function updateNavigation() {
        prevBtn.disabled = currentQuestionIndex === 0;
        submitBtn.disabled = userAnswers[currentQuestionIndex] === null;
        submitBtn.textContent = (currentQuestionIndex === quizData.questions.length-1)? 'Submit':'Next';
        updateProgressBar();
    }

    // تحديث شريط التقدم
    function updateProgressBar() {
        const progress = ((currentQuestionIndex+1)/quizData.questions.length)*100;
        progressBar.style.width = `${progress}%`;
    }

    // عرض النتائج النهائية
    function showResults() {
        let score=0,wrongQuestionsHTML='';
        quizData.questions.forEach((q,i)=>{
            const ua=userAnswers[i],ci=q.correct;
            const correct=ua===ci;
            if(correct) score++; 
            else wrongQuestionsHTML+=`<div class="result-card"><h4>Question ${i+1}: ${q.stem}</h4>
            <p><strong>Your Answer:</strong> <span class="incorrect">${ua!==null?q.options[ua]:'Not Answered'} ❌</span></p>
            <p><strong>Correct Answer:</strong> <span class="correct">${q.options[ci]}</span></p>
            ${q.explanation?`<p><strong>Explanation:</strong> ${q.explanation}</p>`:''}</div>`;
        });
        const total=quizData.questions.length;
        const percentage=((score/total)*100).toFixed(2);
        let grade='',gradeColor='';
        if(percentage>=90){grade='Excellent'; gradeColor='#28a745';} 
        else if(percentage>=75){grade='Good'; gradeColor='#17a2b8';} 
        else if(percentage>=50){grade='Average'; gradeColor='#ffc107';} 
        else {grade='Needs Improvement'; gradeColor='#dc3545';}
        scoreDisplay.innerHTML=`<div class="score-summary"><div class="circular-progress" data-percentage="${percentage}" style="--percentage:${percentage}; --color:${gradeColor};"><span>${percentage}%</span></div><div class="grade" style="color:${gradeColor};">${grade}</div><p><strong>Correct:</strong> ${score}</p><p><strong>Wrong:</strong> ${total-score}</p></div><h3>Wrong Answers Review</h3>${wrongQuestionsHTML||'<p style="color:green;">No wrong answers! Perfect Score 🎉</p>'}`;
        quizInterface.style.display='none'; resultsScreen.style.display='block';
    }

    // عرض مراجعة الأسئلة
    function showReview() {
        resultsScreen.style.display='none'; reviewScreen.style.display='block'; reviewScreen.innerHTML='<h2>Quiz Review</h2>';
        quizData.questions.forEach((q,index)=>{
            const qb=document.createElement('div'); qb.className='review-question-block';
            let optionsHTML='';
            q.options.forEach((opt,i)=>{
                let cls='option'; if(i===q.correct) cls+=' correct'; else if(i===userAnswers[index]) cls+=' incorrect';
                optionsHTML+=`<div class="${cls}">${opt}</div>`;
            });
            qb.innerHTML=`<h3>Q${index+1}: ${q.stem}</h3><div class="options-container">${optionsHTML}</div>${q.explanation?`<div class="review-explanation"><strong>Explanation:</strong> ${q.explanation}</div>`:''}`;
            reviewScreen.appendChild(qb);
        });
        const backBtn=document.createElement('button'); backBtn.textContent='Back to Results'; backBtn.className='button button-secondary';
        backBtn.onclick=()=>{reviewScreen.style.display='none'; resultsScreen.style.display='block';};
        reviewScreen.appendChild(backBtn);
    }

    // إعداد قائمة Browse
    function populateBrowseModal() {
        browseList.innerHTML='';
        quizData.questions.forEach((q,index)=>{
            const item=document.createElement('div'); item.className='browse-item'; let optionsHTML='';
            q.options.forEach((opt,i)=>{ let cls='browse-option'; if(i===q.correct) cls+=' correct-answer'; optionsHTML+=`<div class="${cls}">${opt}</div>`; });
            item.innerHTML=`<h3 class="browse-question">Q${index+1}: ${q.stem}</h3>${optionsHTML}<div class="browse-explanation">${q.explanation}</div>`;
            browseList.appendChild(item);
        });
    }

    // عرض خطأ تحميل
    function showError(message){ quizInterface.innerHTML=`<p style="color:red;text-align:center;">${message}</p>`; }

    // أزرار التفاعل
    submitBtn.addEventListener('click', ()=>{currentQuestionIndex<quizData.questions.length-1?displayQuestion(currentQuestionIndex+1):showResults();});
    prevBtn.addEventListener('click', ()=>{if(currentQuestionIndex>0) displayQuestion(currentQuestionIndex-1);});
    reviewBtn.addEventListener('click', showReview);
    browseBtn.addEventListener('click', ()=>{browseModal.classList.remove('hidden');});
    closeModalBtn.addEventListener('click', ()=>{browseModal.classList.add('hidden');});
    browseModal.addEventListener('click',(e)=>{if(e.target===browseModal) browseModal.classList.add('hidden');});
    resetBtn.addEventListener('click', ()=>{localStorage.removeItem(storageKey); window.location.reload();});
});