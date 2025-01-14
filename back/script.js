const workouts = [
	'Bent over W',
	'Bent over W',
	'Bent over W',
	'Snow angles',
	'Snow angles',
	'Bird dog',
	'Bird dog',
	'Glute bridge hold',
	'Glute bridge hold',
	'superman up and down',
	'superman hold',
	'superman hold',
	'Cobra up and down',
	'Cobra up and down',
	'Cobra hold',
	'Knee to check alt side',
	'Knee to check alt side',
	'Child pose'
];

let currentWorkout = 0;
let remainingTime = 0;
let isPaused = false;
let timerInterval = null;
let currentCallback = null;

const timerDisplay = document.getElementById('timer');
const announcement = document.getElementById('announcement');
const nextWorkout = document.getElementById('nextWorkout');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const workoutList = document.getElementById('workoutList');
const progressBar = document.getElementById('progressBar');
const menuIcon = document.getElementById('menuIcon');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeSidebar');

// Initialize UI
function initializeUI() {
	workoutList.innerHTML = '';
	workouts.forEach((workout, index) => {
		const li = document.createElement('li');
		li.innerText = workout;
		li.className = index === 0 ? 'current' : 'upcoming';
		workoutList.appendChild(li);
	});
	updateProgressBar();
	updateNextWorkout();
}

// Update Timer Display
function updateUI(time) {
	timerDisplay.innerText = time;
}

// Update Progress Bar
function updateProgressBar() {
	const progress = ((currentWorkout / workouts.length) * 100).toFixed(2);
	progressBar.style.width = `${progress}%`;
}

// Update Workout List
function updateWorkoutList() {
	const listItems = workoutList.querySelectorAll('li');
	if (listItems[currentWorkout]) {
		listItems[currentWorkout].classList.remove('current');
		listItems[currentWorkout].classList.add('completed');
	}
	if (listItems[currentWorkout + 1]) {
		listItems[currentWorkout + 1].classList.add('current');
	}
	updateProgressBar();
}

// Update Next Workout
function updateNextWorkout() {
	if (currentWorkout + 1 < workouts.length) {
		nextWorkout.innerText = workouts[currentWorkout + 1];
	} else {
		nextWorkout.innerText = 'No more workouts! You’re almost done!';
	}
}

// Start Workout
function startWorkout() {
	if (currentWorkout < workouts.length) {
		const workoutName = workouts[currentWorkout];

		// Update UI
		updateWorkoutList();
		updateNextWorkout();

		// Announce current workout
		announcement.innerText = `Workout: ${workoutName}`;
		speak(`Starting ${workoutName}`, () => {
			// Start Workout Timer
			startTimer(30, 'Workout', () => {
				// Announce Rest
				speak('Rest time!', () => {
					announcement.innerText = 'Rest';
					startTimer(15, 'Rest', () => {
						// Move to next workout
						currentWorkout++;
						startWorkout();
					});
				});
			});
		});

		pauseBtn.style.display = 'inline-block';
	} else {
		// End of workouts
		announcement.innerText = 'Workout Complete! Great Job!';
		progressBar.style.width = '100%';
		speak('Workout complete! Great job!');
	}
}

// Start Timer
function startTimer(duration, type, callback) {
	clearInterval(timerInterval); // Clear any previous intervals
	remainingTime = duration;
	currentCallback = callback;
	updateUI(remainingTime); // Update the timer display

	timerInterval = setInterval(() => {
		if (!isPaused) {
			remainingTime--;
			updateUI(remainingTime);

			// Announce every 5 seconds
			if (remainingTime > 0 && remainingTime % 5 === 0) {
				speak(`${remainingTime} seconds remaining`);
			}

			// End the timer
			if (remainingTime <= 0) {
				clearInterval(timerInterval);
				callback(); // Trigger the next step (rest or workout)
			}
		}
	}, 1000);
}

// Text-to-Speech
function speak(message, callback) {
	const synth = window.speechSynthesis;

	// Cancel any ongoing speech
	if (synth.speaking) {
		synth.cancel();
	}

	const utterance = new SpeechSynthesisUtterance(message);
	utterance.rate = 1; // Normal speed
	utterance.pitch = 1; // Normal pitch

	utterance.onend = () => {
		if (callback) callback();
	};

	synth.speak(utterance);
}

// Sidebar Toggle
menuIcon.addEventListener('click', () => {
	sidebar.classList.add('active'); // Show sidebar
});

closeSidebar.addEventListener('click', () => {
	sidebar.classList.remove('active'); // Hide sidebar
});

// Event Listeners
startBtn.addEventListener('click', () => {
	startBtn.style.display = 'none';
	initializeUI();
	startWorkout();
});

pauseBtn.addEventListener('click', () => {
	isPaused = true;
	clearInterval(timerInterval);
	pauseBtn.style.display = 'none';
	resumeBtn.style.display = 'inline-block';
});

resumeBtn.addEventListener('click', () => {
	isPaused = false;
	startTimer(remainingTime, 'Resume', currentCallback);
	resumeBtn.style.display = 'none';
	pauseBtn.style.display = 'inline-block';
});
