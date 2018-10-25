import assertUtils from 'assert-utils';

const
	{assert} = assertUtils;

export default class Waterfall {
	constructor(config) {
		assert.type(config, {
			_required: false,
			onNewPromise: '?function'
		});

		config = config || {};
		this.onNewPromise = config.onNewPromise;
		this.options = {};
	}

	/**
	 * @param  {Array} jobs array of functions, each returning either Promise or data
	 * @param  {[options]} options options object
	 * @param  {[Boolean]} options.waitForItems causes main Promise is never resolved and Waterfall executes every newly added job
	 * @param  {[Number]} options.waitTimeout timeout for waitForItems, undefined means no timeout
	 * @param  {[Number]} options.checkInterval interval for waitForItems in ms, default 1000
	 * @return {Promise}
	 */
	exec(jobs, options) {
		assert.type(jobs, '[]');
		assert.type(options, {
			_required: false,
			waitForItems: '?boolean',
			waitTimeout: '?number',
			checkInterval: '?number'
		});

		this.jobs = jobs;
		this.options = options || {};

		if (this.options.checkInterval === undefined) {
			this.options.checkInterval = 1000;
		}
		return this._doJob();
	}

	stop() {
		this.jobs = [];
		this.options.waitForItems = false;
	}

	_doJob(result) {
		let
			job, jobResult, promise;

		if (this.jobs.length) {
			console.log('we have a job!');

			job = this.jobs.shift();

			console.assert(typeof job === 'function');

			jobResult = job();

			promise = new Promise(function(resolve, reject) {
				if (jobResult instanceof Promise) {
					jobResult
						.then(function(result) {
							return this._doJob(result);
						}.bind(this))
						.then(function(result) {
							resolve(result);
						})
						.catch(function(reason) {
							reject(reason);
						});
				}
				else {
					this._doJob(jobResult)
						.then(function(result) {
							resolve(result);
						})
						.catch(function(reason) {
							reject(reason);
						});
				}
			}.bind(this));

			if (this.onNewPromise) {
				this.onNewPromise(promise);
			}

			return promise;
		}
		else {
			if (this.options.waitForItems) {
				return new Promise(function(resolve, reject) {
					this._waitForJobs()
						.then(function() {
							this._doJob()
								.then(function(result) {
									resolve(result);
								})
								.catch(function(reason) {
									reject(reason);
								});
						}.bind(this))
						.catch(function(reason) {
							reject(reason);
						}.bind(this));
				}.bind(this));
			}
			else {
				return Promise.resolve(result);
			}
		}
	}

	_waitForJobs() {
		return new Promise(function(resolve, reject) {
			this.start = Date.now();
			this.checker = setInterval(function() {
				if (this.jobs.length || !this.options.waitForItems) {
					clearInterval(this.checker);
					resolve();
				}
				else if (this.options.waitTimeout && (this.start + this.options.waitTimeout < Date.now())) {
					clearInterval(this.checker);
					reject('Waterfall timed out');
				}
			}.bind(this), this.options.checkInterval);
		}.bind(this));
	}
}
