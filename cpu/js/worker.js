function getWorkerCode() {
    return function () {
        const props = {
            id: Math.floor(Math.random() * 1000),
            work: 8,
        };

        function intensiveFunction(id, work) {
            const start = Date.now();
            
            workTangents(work);

            // finished
            const end = Date.now();
            sendMessage(`Finished processing task after ${(end - start) / 1000} seconds`);
            close();
        }

        function workTangents(work) {
            let result = 0;
            let power = 7;

            // create large iteration of work
            const totalWork = Math.pow(work, power);

            sendMessage(`Starting task of rate ${work} `);

            const workUnit = Math.floor(totalWork / 100);
            for (var i = totalWork; i >= 0; i--) {
                // the actual intensive work
                result += Math.atan(i) * Math.tan(i);

                // report progress after unit % of work
                const left = totalWork - i;
                if (left % workUnit === 0) {
                    const progress = (left / totalWork) * 100;
                    sendMessage({ progress: Math.ceil(progress) }, 'progress');
                }
            };
        }

       function sendMessage(message, type = 'message') {
            self.postMessage({ id: props.id, message: message, type: type });
        }

        self.onmessage = function (e) {
            const args = e.data ?? {};
            switch (args.command) {
                case 'start':   // start work
                    intensiveFunction(props.id, props.work);
                    break;
                case 'stop':
                    close();    //terminates after the current turn
                    break;
                case 'setprops':    // set worker props
                    if (args.id !== undefined || args.id !== null) {
                        props.id = args.id;
                    }
                    if (args.work) {
                        props.work = args.work;
                    }
                    break;
                default:
                    break;
            }
        };
    }.toString();
}