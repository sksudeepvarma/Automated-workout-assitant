// Define exercises
const workouts = [
	'Scissor Leg Raises',
	'Leg Raise and Hip Thrust',
	'Reverse Crunches',
	'Flutter Kicks',
	'Russian Twists',
	'Side Oblique Crunches',
	'Side Plank Rotation Left',
	'Side Plank Rotation right',
	'Crunches',
	'V Sit Crunches',
	'Situps',
	'Plank Knee Ins',
	'Plank',
	'Stomach Vacuums (Hold)',
	'Stomach Vacuums (Squeeze)'
];

// Timer and workout settings
const workoutTime = 30; // seconds
const restTime = 10; // seconds
let currentWorkout = 0; // Index of the current workout
let remainingTime = 0;
let isPaused = false;
let timerInterval = null;
let currentCallback = null; // Stores the next step after the timer

// Select DOM elements
const timerDisplay = document.getElementById('timer');
const announcement = document.getElementById('announcement');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

// Main workout flow
function startWorkout() {
	if (currentWorkout < workouts.length) {
		const workoutName = workouts[currentWorkout];
		announcement.innerText = `Workout: ${workoutName}`;
		speak(`Starting ${workoutName}`, () => {
			startTimer(workoutTime, 'Workout', () => {
				speak('Rest time!', () => {
					announcement.innerText = 'Rest';
					startTimer(restTime, 'Rest', () => {
						currentWorkout++;
						startWorkout();
					});
				});
			});
		});
		pauseBtn.style.display = 'inline-block';
	} else {
		announcement.innerText = 'Workout Complete! Great Job!';
		speak('Workout complete! You crushed it!');
		pauseBtn.style.display = 'none';
		resumeBtn.style.display = 'none';
	}
}

// Timer logic
function startTimer(duration, type, callback) {
	clearInterval(timerInterval);
	remainingTime = duration;
	currentCallback = callback; // Store callback for resume functionality
	updateUI(remainingTime);

	timerInterval = setInterval(() => {
		if (!isPaused) {
			remainingTime--;
			updateUI(remainingTime);

			// Announce every 5 seconds
			if (remainingTime > 0 && remainingTime % 5 === 0) {
				speak(`${remainingTime}`);
			}

			if (remainingTime <= 0) {
				clearInterval(timerInterval);
				currentCallback();
			}
		}
	}, 1000);
}

// Update the timer display
function updateUI(time) {
	timerDisplay.innerText = time;
}

// Text-to-speech
function speak(message, callback) {
	const synth = window.speechSynthesis;

	// Stop any ongoing speech
	synth.cancel();

	const utterance = new SpeechSynthesisUtterance(message);

	// Callback after speech finishes
	utterance.onend = () => {
		if (callback && !isPaused) {
			callback();
		}
	};

	utterance.rate = 1; // Normal speech rate
	if (!isPaused) synth.speak(utterance);
}

// Pause functionality
pauseBtn.addEventListener('click', () => {
	isPaused = true;
	clearInterval(timerInterval);
	window.speechSynthesis.cancel(); // Stop ongoing speech
	pauseBtn.style.display = 'none';
	resumeBtn.style.display = 'inline-block';
});

// Resume functionality
resumeBtn.addEventListener('click', () => {
	isPaused = false;
	if (remainingTime > 0) {
		startTimer(remainingTime, 'Resume', currentCallback);
	}
	pauseBtn.style.display = 'inline-block';
	resumeBtn.style.display = 'none';
});

// Start button functionality
startBtn.addEventListener('click', () => {
	startBtn.style.display = 'none';
	startWorkout();
});

let wakeLock = null;

// Request a wake lock
async function requestWakeLock() {
	try {
		if ('wakeLock' in navigator) {
			wakeLock = await navigator.wakeLock.request('screen');
			console.log('Screen Wake Lock is active');
		} else {
			console.log('Wake Lock API is not supported in this browser.');
		}
	} catch (err) {
		console.error(`Failed to acquire wake lock: ${err.message}`);
	}
}

// Release the wake lock
async function releaseWakeLock() {
	if (wakeLock) {
		await wakeLock.release();
		wakeLock = null;
		console.log('Screen Wake Lock released');
	}
}

// Handle visibility changes to re-request wake lock if needed
document.addEventListener('visibilitychange', async () => {
	if (document.visibilityState === 'visible' && !wakeLock) {
		await requestWakeLock();
	}
});

// Request wake lock when the app starts
startBtn.addEventListener('click', async () => {
	await requestWakeLock();
});

// Release wake lock when the app is closed or the user navigates away
window.addEventListener('unload', async () => {
	await releaseWakeLock();
});
