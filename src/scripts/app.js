const APPID_MCORP = '3705418343321362065';
const app = MCorp.app(APPID_MCORP, { anon: true, range: [ 0, 65535 ] }); // eslint-disable-line no-undef
const $changeColorButton = document.getElementById('change-color');
const arrayBuffer = new ArrayBuffer(2);
const uint8Array = new Uint8Array(arrayBuffer);
const uint16Array = new Uint16Array(arrayBuffer);

// eslint-disable-next-line padding-line-between-statements
const changeColor = (timingObject) => {
    uint8Array[0] = Math.floor(Math.random() * 256);
    uint8Array[1] = Math.floor(Math.random() * 256);

    timingObject.update({ position: uint16Array[0], velocity: 1 });
};

app
    .ready
    .then(() => {
        const timingObject = new TIMINGSRC.TimingObject({ provider: app.motions.shared }); // eslint-disable-line no-undef

        timingObject
            .ready
            .then(() => {
                $changeColorButton.style.display = 'block';
                $changeColorButton.addEventListener('click', () => {
                    changeColor(timingObject);
                });

                const updateColour = () => {
                    const { position } = timingObject.query();

                    uint16Array[0] = position;

                    document.body.style.backgroundColor = `rgb(${ uint8Array[0] },${ uint8Array[1] },255)`;

                    requestAnimationFrame(() => updateColour());
                };

                requestAnimationFrame(() => updateColour());
            });
    });

app.init();
