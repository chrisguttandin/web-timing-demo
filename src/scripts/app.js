import { TimingObject } from 'timing-object';
import { TimingProvider } from 'timing-provider';

const APPID_MCORP = '3705418343321362065';
const app = MCorp.app(APPID_MCORP, { anon: true, range: [ 0, 65535 ] }); // eslint-disable-line no-undef
const $leftPlain = document.getElementById('left-plain');
const $changeColorButton = document.getElementById('change-color');
const $connectingMessageSpan = document.getElementById('connecting-message');
const $rightPlain = document.getElementById('right-plain');
const arrayBuffer = new ArrayBuffer(2);
const uint8Array = new Uint8Array(arrayBuffer);
const uint16Array = new Uint16Array(arrayBuffer);

// eslint-disable-next-line padding-line-between-statements
const changeColor = (...timingObjects) => {
    uint8Array[0] = Math.floor(Math.random() * 256);
    uint8Array[1] = Math.floor(Math.random() * 256);

    timingObjects.forEach((timingObject) => timingObject.update({ position: uint16Array[0], velocity: 0 }));
};

Promise
    .all([
        app
            .ready
            .then(() => {
                const timingObject = new TIMINGSRC.TimingObject({ provider: app.motions.shared }); // eslint-disable-line no-undef

                return timingObject
                    .ready
                    .then(() => timingObject);
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
    ])
    .then(([ timingSrcTimingObject, webRtcTimingObject ]) => {
        $connectingMessageSpan.style.display = 'none';

        $changeColorButton.style.display = 'block';
        $changeColorButton.addEventListener('click', () => {
            changeColor(timingSrcTimingObject, webRtcTimingObject);
        });

        const renderColor = ($plain, timingObject) => {
            const { position } = timingObject.query();

            uint16Array[0] = position;

            $plain.style.backgroundColor = `rgb(${ uint8Array[0] },${ uint8Array[1] },255)`;
        };
        const updateColor = () => {
            renderColor($leftPlain, timingSrcTimingObject);
            renderColor($rightPlain, webRtcTimingObject);

            requestAnimationFrame(() => updateColor());
        };

        requestAnimationFrame(() => updateColor());
    });

app.init();
