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
const changeColor = (timingObject, timingProvider) => {
    uint8Array[0] = Math.floor(Math.random() * 256);
    uint8Array[1] = Math.floor(Math.random() * 256);

    timingObject.update({ position: uint16Array[0], velocity: 1 });
    timingProvider.update({ position: uint16Array[0], velocity: 0 });
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
            const timingProvider = new TimingProvider('abcdefghijklmno01234');

            timingProvider.addEventListener('readystatechange', () => {
                if (timingProvider.readyState === 'open') {
                    setTimeout(() => resolve(timingProvider), 5000);
                }
            });
        })
    ])
    .then(([ timingObject, timingProvider ]) => {
        $connectingMessageSpan.style.display = 'none';

        $changeColorButton.style.display = 'block';
        $changeColorButton.addEventListener('click', () => {
            changeColor(timingObject, timingProvider);
        });

        const updateColor = () => {
            const { position } = timingObject.query();

            uint16Array[0] = position;

            $leftPlain.style.backgroundColor = `rgb(${ uint8Array[0] },${ uint8Array[1] },255)`;

            const vector = timingProvider.vector;

            if (vector !== undefined) {
                uint16Array[0] = vector.position;

                $rightPlain.style.backgroundColor = `rgb(${ uint8Array[0] },${ uint8Array[1] },255)`;
            }

            requestAnimationFrame(() => updateColor());
        };

        requestAnimationFrame(() => updateColor());
    });

app.init();
