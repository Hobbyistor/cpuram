function init() {
    const cores = navigator.hardwareConcurrency ?? 1;

    const workers = Number(cores);
    const work = Number(14);

    const $spawn = document.querySelector('#spawninput');
    $spawn.value = workers;

    const $work = document.querySelector('#workinput');
    $work.value = work;

    document.querySelector('#workerstospawn').innerHTML = `No of workers to spawn (${cores} logical CPUs detected)`;
}
function start() {
    clearProgressDivs();

    const $spawn = document.querySelector('#spawninput');
    const $work = document.querySelector('#workinput');

    createWorkers(Number($spawn.value) ?? 1, Number($work.value) ?? 14);
}

/**
 * Creates the workers
 * @param {number} num the number of workers to spawn
 * @param {number} work work to do. higher work = higher iterations
 * @returns the workers
 */
 function createWorkers(num = 1, work = 10) {
    const workers = [];
    if (window.Worker) {
        for (let i = 0; i < num; i++) {
            const worker = createWorker(i, work);
            workers.push(worker);
        }
    } else {
        console.error('Workers are not supported in this browser');
    }
    return workers;
}

function createWorker(workerId, work) {
    // Build a worker from an anonymous function body
    const blobURL = URL.createObjectURL(new Blob(['(',
        getWorkerCode(),
        ')()'], { type: 'application/javascript' })
    );

    const worker = new Worker(blobURL);

    worker.addEventListener("message", handleWorkerMessage);

    sendWorkerMessage(worker, 'setprops', { id: workerId, work: work });
    sendWorkerMessage(worker, 'start');

    addProgressForWorker(workerId);
    return worker;
}

function sendWorkerMessage(worker, command, message) {
    const data = { command, ...message };
    worker.postMessage(data);
}

function addProgressForWorker(workerId) {
    const $div = document.querySelector('#workers');
    const $workerDiv = document.createElement('div');
    const $progress = document.createElement('progress');
    const $perc = document.createElement('span');
    const $text = document.createElement('span');

    $progress.dataset.workerid = workerId;
    $perc.dataset.workerid = workerId;

    $progress.classList.add('progress');
    $progress.setAttribute('value', 0);
    $progress.setAttribute('max', 100);

    $perc.classList.add('numprogress');
    $perc.innerHTML = '0%';
    $text.innerHTML = `Worker ${workerId}`;

    $progress.classList.add(getRandomColorClass());

    $workerDiv.appendChild($text);
    $workerDiv.appendChild($perc);
    $workerDiv.appendChild($progress);
    $div.appendChild($workerDiv);
}

function getRandomColorClass() {
    const classes = ['is-warning', 'is-success', 'is-danger', 'is-link', 'is-info', 'is-primary'];
    return classes[Math.floor(Math.random() * classes.length)];
}

function clearProgressDivs() {
    const $workers = document.querySelector('#workers');
    while ($workers.firstChild) {
        $workers.removeChild($workers.firstChild);
    }
}

function handleWorkerMessage(event) {
    //dispath according to message type
    switch (event.data.type) {
        case 'progress':
            updateWorkerProgress(event.data.id, event.data.message.progress);
            break;
        case 'message':
        default:
            console.log(`Message from worker [${event.data.id}]: ${event.data.message}`);
            break;
    }
}

function updateWorkerProgress(id, progress) {
    const $progress = document.querySelector(`progress[data-workerid='${id}']`);
    const $text = document.querySelector(`span[data-workerid='${id}']`);
    if ($progress) {
        $progress.setAttribute('value', progress);
        $text.innerHTML = `${progress}%`;
    }
}
init();