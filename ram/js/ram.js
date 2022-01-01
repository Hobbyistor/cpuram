async function init() {
    const DEFAULT_JS_HEAP_SIZE_IN_MBS = window.performance.memory.jsHeapSizeLimit / Math.pow(1000, 2); // not available in firefox/safari
    const $ramToFill = document.querySelector('#ramtofill');
    $ramToFill.innerHTML = `RAM to fill in MBs (JS Heap Size Limit: ${DEFAULT_JS_HEAP_SIZE_IN_MBS})`;
    const $ram = document.querySelector('#raminput');

    let maxRamValue = DEFAULT_JS_HEAP_SIZE_IN_MBS;

    const slider = initSlider('slider', 0, maxRamValue);
    initGauge('gauge', 0, maxRamValue);

    registerChangeEvents($ram, slider);
    setRamValue(100, $ram, slider);
}

async function start() {
    // get slider value
    const inputRamValue = document.querySelector('#raminput').value;
    const ram = Number(inputRamValue);

    if (ram > 0) {
        const button = document.querySelector('#rambutton');
        button.classList.add('is-loading');

        //init gauge
        const gauge = await initGauge('gauge', 0, ram);
        gauge.setTextField(document.getElementById('gauge-text'));
        try {
            await runPerfTest(gauge, ram);
        } catch (error) {
            button.classList.remove('is-loading');
            throw error;
        }
        button.classList.remove('is-loading');
    }
}

async function runPerfTest(gauge, maxRam = 500) {
    const elementSize = 2;

    const noOfIterations = maxRam / elementSize;
    const uiUpdates = noOfIterations * 0.025;

    const ramArray = [];

    while (ramArray.length < noOfIterations) {
        try {
            ramArray.push(generateUUIDString());
        } catch (error) {
            console.error(error);
        }
        await sleep(1);
        if (ramArray.length % uiUpdates === 0) {
            console.log(`${Math.floor(ramArray.length * elementSize)} MBs`);
            await setGaugeValue(gauge, ramArray.length * elementSize);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setGaugeValue(gauge, value) {
    gauge.set(value);
    gauge.update(true);
    return gauge;
}

function generateUUIDString(){
    //1 uuidv4 ~= 36 bytes
    const str = [];
    const chunk = 300;
    const uuids = Math.ceil(1024 * 1024 / ( 36 * chunk));
    for (let i = 0; i < uuids; i++){
        let temp = '';
        for (let h = 0; h < chunk; h++){
            temp += uuidv4()
        }
        str.push(temp);
    }
    return str;
}

function registerChangeEvents($ram, slider) {
    const pubsub = createPubSub();

    pubsub.sub('ramchange', (args) => {
        setRamValue(args.data, $ram, slider);
    });

    $ram.addEventListener('change', (event) => {
        pubsub.pub('ramchange', { event: event, data: Number($ram.value ?? 0) }, $ram);
    });
    slider.onChange = (values) => {
        pubsub.pub('ramchange', { event: event, data: slider.getValue() ?? 0 }, slider);
    };
}

function setRamValue(ramValue, $ram, slider) {
    if (slider.getValue() !== ramValue) {
        const sliderMax = slider.conf.values[slider.conf.values.length - 1];
        if (ramValue > sliderMax) {
            slider.setValues(sliderMax);
        } else {
            slider.setValues(ramValue);
        }
    }
    $ram.value = ramValue;
}

function initSlider(id, min, max, initial = 100) {
    const slider = new rSlider({
        target: `#${id}`,
        values: { min: min, max: max },
        tooltip: true,
        step: 50,
        scale: true,
        labels: false,
        set: initial,
    });
    slider.setValues(initial);
    return slider;
}

async function initGauge(div, min = 0, max = 100) {
    const labels = generateRange(min, max);
    var opts = {
        angle: 0, // The span of the gauge arc
        lineWidth: 0.40, // The line thickness
        radiusScale: 1, // Relative radius
        pointer: {
            length: 0.75, // Relative to gauge radius
            strokeWidth: 0.035, // The thickness
            color: '#000000' // Fill color
        },
        renderTicks: {
            divisions: 5,
            divWidth: 1.1,
            divLength: 0.5,
            divColor: '#333333',
            subDivisions: 3,
            subLength: 0.18,
            subWidth: 0.6,
            subColor: '#666666'
        },
        staticLabels: {
            font: "10px sans-serif",  // Specifies font
            labels: labels,  // Print labels at these values
            color: "#000000",  // Optional: Label text color
            fractionDigits: 0  // Optional: Numerical precision. 0=round off.
        },
        limitMax: false,     // If false, max value increases automatically if value > maxValue
        limitMin: true,     // If true, the min value of the gauge will be fixed
        colorStart: '#6FADCF',   // Colors
        colorStop: '#8FC0DA',
        strokeColor: '#E0E0E0',
        percentColors: [[0.0, "#a9d70b"], [0.50, "#f9c802"], [1.0, "#ff0000"]], // !!!!
        generateGradient: true,
        highDpiSupport: true,     // High resolution support
    };
    const target = document.getElementById(div);
    const gauge = new Gauge(target).setOptions(opts);
    gauge.maxValue = max; // set max gauge value
    gauge.setMinValue(min);  // Prefer setter over gauge.minValue = 0
    gauge.animationSpeed = 8; // set animation speed (32 is default value)
    gauge.set(min); // set min value

    return gauge;
}

function generateRange(min = 0, max = 100) {
    return [...Array(11)].map((_, i) => min + i * ((max - min) / 10)); // generate range with step increments
}

function createPubSub() {
    const events = {};
    return {
        sub: (event, cb) => {
            if (!events[event]) {
                events[event] = [];
            }
            events[event].push(cb);
        },
        pub: (event, args, scope = null) => {
            if (!events[event]) {
                return;
            }
            const cbs = events[event];
            cbs.forEach(cb => cb.call(scope, args));
        }
    }
}

init();
