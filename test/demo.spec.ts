import sinon from 'sinon';

import { ClearableSinon } from '../src/clearable-sinon';

describe('sinon', function () {
    describe('using sinon.createSandbox', function () {
        it('does not clear Timers automatically when doing restore', async function () {
            const sandbox = sinon.createSandbox();
            const clock = sandbox.useFakeTimers();

            const intervalTaskStub = sandbox.stub().callsFake(() => console.log('...executing task...'));
            setInterval(intervalTaskStub, 1000);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 5);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 10);

            sandbox.restore();

            console.log('\nabout to tick 5s (after clearInterval)');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 15); // Actual: the IntervalTimer is still running.
            // sinon.assert.callCount(intervalTaskStub, 10); // Expectation: the IntervalTimer should stop running after restore.
        });

        it('can clear fake Timers correctly before restore', async function () {
            const sandbox = sinon.createSandbox();
            const clock = sandbox.useFakeTimers();

            const intervalTaskStub = sandbox.stub().callsFake(() => console.log('...executing task...'));
            const intervalId = setInterval(intervalTaskStub, 1000);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 5);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 10);

            clearInterval(intervalId);

            sandbox.restore();

            console.log('\nabout to tick 5s (after clearInterval)');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 10);
        });

        it('can not clear fake Timers correctly after restore', async function () {
            const sandbox = sinon.createSandbox();
            const clock = sandbox.useFakeTimers();

            const intervalTaskStub = sandbox.stub().callsFake(() => console.log('...executing task...'));
            const intervalId = setInterval(intervalTaskStub, 1000);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 5);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 10);

            sandbox.restore();

            clearInterval(intervalId); // this will simply not work, because clearInterval is different from the one Sinon is using, and it's not possible clear the Timers Sinon has set. In this example we can move this line before sandbox.restore(); to solve, but if we can't get the intervalId then we can't clear it.

            console.log('\nabout to tick 5s (after clearInterval)');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 15);
        });
    });

    describe('using ClearableSinon.sandbox', function () {
        it('can clear fake Timers automatically when doing restore', async function () {
            const clearableSion = new ClearableSinon();
            const sandbox = clearableSion.sandbox;
            const clock = clearableSion.activateFakeTimer();

            const intervalTaskStub = sandbox.stub().callsFake(() => console.log('...executing task...'));
            setInterval(intervalTaskStub, 1000);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 5);

            console.log('\nabout to tick 5s');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 10);

            clearableSion.restore(); // this does some more clean up.

            console.log('\nabout to tick 5s (after restore which does clear Timers internally)');
            await clock.tickAsync(5_000);
            sinon.assert.callCount(intervalTaskStub, 10); // Interval tasks stoppped by restore.
        });
    });
});
