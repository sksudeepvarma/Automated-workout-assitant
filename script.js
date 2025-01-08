const workouts = [
	'Scissor Leg Raises',
	'Leg Raise and Hip Thrust',
	'Reverse Crunches',
	'Flutter Kicks',
	'Russian Twists',
	'Side Oblique Crunches',
	'Side Plank Rotation',
	'Crunches',
	'V Sit Crunches',
	'Crunches Again',
	'Situps',
	'Plank Knee Ins',
	'Plank',
	'Stomach Vacuums (Hold)',
	'Stomach Vacuums (Squeeze)'
];

const workoutTime = 30; // seconds
const restTime = 15; // seconds
let currentWorkout = 0;

const timerDisplay = document.getElementById('timer');
const announcement = document.getElementById('announcement');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

let timerInterval;
let remainingTime;
let isPaused = false;
let currentCallback = null; // Store the current callback for resuming

function startWorkout() {
	if (currentWorkout < workouts.length) {
		const workoutName = workouts[currentWorkout];
		announcement.innerText = `Workout: ${workoutName}`;
		speak(`Starting ${workoutName}`, () => {
			// Start the workout timer after announcing the workout
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

function startTimer(duration, type, callback) {
	clearInterval(timerInterval);
	remainingTime = duration;
	currentCallback = callback; // Store the current callback for resumption
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

function updateUI(time) {
	timerDisplay.innerText = time;
}

function speak(message, callback) {
	const synth = window.speechSynthesis;

	// Stop any ongoing speech
	synth.cancel();

	const utterance = new SpeechSynthesisUtterance(message);

	// Execute callback after speech is done
	utterance.onend = () => {
		if (callback && !isPaused) {
			callback();
		}
	};

	utterance.rate = 1; // Normal speed
	if (!isPaused) synth.speak(utterance);
}

// Pause button functionality
pauseBtn.addEventListener('click', () => {
	isPaused = true;
	clearInterval(timerInterval);
	window.speechSynthesis.cancel(); // Stop ongoing speech
	pauseBtn.style.display = 'none';
	resumeBtn.style.display = 'inline-block';
});

// Resume button functionality
resumeBtn.addEventListener('click', () => {
	isPaused = false;
	if (remainingTime > 0) {
		startTimer(remainingTime, 'Resume', currentCallback);
	}
	pauseBtn.style.display = 'inline-block';
	resumeBtn.style.display = 'none';
});

// Start button event listener
startBtn.addEventListener('click', () => {
	startBtn.style.display = 'none';
	startWorkout();
});
