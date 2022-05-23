import sinon from 'sinon';

export class ClearableSinon {
    private _originalSetIntervalSpy: sinon.SinonSpy | undefined;
    private _originalSetTimeoutSpy: sinon.SinonSpy | undefined;

    private _fakeSetIntervalSpy: sinon.SinonSpy | undefined;
    private _fakeSetTimeoutSpy: sinon.SinonSpy | undefined;

    private _fakeTimer: sinon.SinonFakeTimers | undefined;

    private _sandbox: sinon.SinonSandbox;

    constructor() {
        this._sandbox = sinon.createSandbox();

        this._originalSetIntervalSpy = this._sandbox.spy(global, 'setInterval');
        this._originalSetTimeoutSpy = this._sandbox.spy(global, 'setTimeout');
        // TODO: setImmediate

        this._sandbox;
    }

    get sandbox(): sinon.SinonSandbox {
        return this._sandbox;
    }

    restore(): void {
        this._clearFakeTimers(); // clear all fake timers before restoring sandbox(including the fake clock)
        this._sandbox.restore();
        this._clearOriginalPendingTimers(); // clear all real timers after restoring sandbox (to stop all timers set up before using fake timers)
    }

    activateFakeTimer(): sinon.SinonFakeTimers {
        if (this._fakeTimer) {
            return this._fakeTimer;
        }

        this._fakeTimer = this._sandbox.useFakeTimers(); // from here on the Timer functions will be mocked.

        if (this._fakeSetIntervalSpy || this._fakeSetTimeoutSpy) {
            this._clearFakeTimers();
        }

        this._fakeSetIntervalSpy = this._sandbox.spy(global, 'setInterval');
        this._fakeSetTimeoutSpy = this._sandbox.spy(global, 'setTimeout');

        return this._fakeTimer;
    }

    private _clearOriginalPendingTimers(): void {
        this._originalSetIntervalSpy?.returnValues.map((timerId) => global.clearInterval(timerId));
        this._originalSetTimeoutSpy?.returnValues.map((timerId) => global.clearTimeout(timerId));
    }

    private _clearFakeTimers(): void {
        this._fakeSetIntervalSpy?.returnValues.map((timerId) => global.clearInterval(timerId));
        this._fakeSetTimeoutSpy?.returnValues.map((timerId) => global.clearTimeout(timerId));
    }
}
