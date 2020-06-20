import { TimingObject } from 'timing-object';
import { TimingProvider } from 'timing-provider';

const APPID_MCORP = '3705418343321362065';
const app = MCorp.app(APPID_MCORP, { anon: true, range: [0, 4294967040] }); // eslint-disable-line no-undef
const $leftPlain = document.getElementById('left-plain');
const $changeColorButton = document.getElementById('change-color');
const $connectingMessageSpan = document.getElementById('connecting-message');
const $rightPlain = document.getElementById('right-plain');
const arrayBuffer = new ArrayBuffer(4);
const uint8Array = new Uint8Array(arrayBuffer);
const uint32Array = new Uint32Array(arrayBuffer);

// eslint-disable-next-line padding-line-between-statements
const changeColor = (...timingObjects) => {
    uint8Array[1] = Math.floor(Math.random() * 256);
    uint8Array[2] = Math.floor(Math.random() * 256);
    uint8Array[3] = Math.floor(Math.random() * 256);

    timingObjects.forEach((timingObject) => timingObject.update({ position: uint32Array[0], velocity: 0 }));
};

// eslint-disable-next-line padding-line-between-statements
const renderColor = ($plain, timingObject) => {
    const { position } = timingObject.query();

    uint32Array[0] = position;

    $plain.style.backgroundColor = `rgb(${uint8Array[1]},${uint8Array[2]},${uint8Array[3]})`;
};

Promise.all([
    app.ready.then(() => {
        const timingObject = new TIMINGSRC.TimingObject({ provider: app.motions.shared }); // eslint-disable-line no-undef

        return timingObject.ready.then(() => timingObject);
    }),
    new Promise((resolve) => {
        const timingObject = new TimingObject(new TimingProvider('abcdefghijklmno01234'));
        const onReadystateChange = () => {
            timingObject.removeEventListener('readystatechange', onReadystateChange);

            if (timingObject.readyState === 'open') {
                resolve(timingObject);
            }
        };

        timingObject.addEventListener('readystatechange', onReadystateChange);
    })
]).then(([timingSrcTimingObject, webRtcTimingObject]) => {
    $connectingMessageSpan.style.display = 'none';

    $changeColorButton.style.display = 'block';
    $changeColorButton.addEventListener('click', () => {
        changeColor(timingSrcTimingObject, webRtcTimingObject);
    });

    const updateColor = () => {
        renderColor($leftPlain, timingSrcTimingObject);
        renderColor($rightPlain, webRtcTimingObject);

        requestAnimationFrame(() => updateColor());
    };

    requestAnimationFrame(() => updateColor());
});

app.init();
